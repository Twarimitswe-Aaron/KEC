import React, { useState, useMemo } from "react";
import { IoSearch } from "react-icons/io5";
import { MdCheck, MdDoneAll, MdFilterList } from "react-icons/md";
import { IoArrowBack } from "react-icons/io5";
import { useGetUserQuery } from "../../state/api/authApi";
import { useGetChatsQuery, Chat } from "../../state/api/chatApi";
import { useChat } from "../../hooks/useChat";
import { useNavigate, useLocation } from "react-router-dom";

interface LeftSideInboxProps {
  onCloseSidebar: () => void;
}

type SortFilter = "all" | "unread" | "groups" | "personal";

const LeftSideInbox: React.FC<LeftSideInboxProps> = ({ onCloseSidebar }) => {
  const { data: currentUser } = useGetUserQuery();
  const { data: chatsResponse, isLoading, error } = useGetChatsQuery({});
  const { activeChat, setActiveChat, onlineUsers, typingUsers } = useChat();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortFilter, setSortFilter] = useState<SortFilter>("all");

  const previousRoute = location.state?.from || "/dashboard";

  const handleGoBack = () => {
    navigate(previousRoute);
  };

  // Format timestamp for chat list
  const formatTimestamp = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    if (messageDate.getTime() === today.getTime()) {
      // Today - show time
      return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else if (messageDate.getTime() === today.getTime() - 86400000) {
      // Yesterday
      return "Yesterday";
    } else if (now.getTime() - messageDate.getTime() < 7 * 86400000) {
      // Within a week - show day name
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      // Older - show date
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  // Get last message preview
  const getLastMessagePreview = (chat: Chat): string => {
    if (!chat.lastMessage) return "No messages yet";

    const { lastMessage } = chat;
    const isCurrentUser = lastMessage.senderId === currentUser?.id;
    const prefix = isCurrentUser ? "You: " : "";

    if (lastMessage.messageType === "TEXT") {
      return prefix + (lastMessage.content || "");
    } else if (lastMessage.messageType === "IMAGE") {
      return prefix + "📷 Photo";
    } else if (lastMessage.messageType === "FILE") {
      return prefix + "📎 " + (lastMessage.fileName || "File");
    } else if (lastMessage.messageType === "AUDIO") {
      return prefix + "🎤 Voice message";
    }
    return prefix + "Message";
  };

  // Get chat display name
  const getChatName = (chat: Chat): string => {
    if (chat.isGroup) {
      return chat.name || "Group Chat";
    }

    const otherParticipant = chat.participants.find(
      (p) => p.user?.id !== currentUser?.id
    );

    if (otherParticipant) {
      return (
        `${otherParticipant.user?.firstName || ""} ${
          otherParticipant.user?.lastName || ""
        }`.trim() || "User"
      );
    }

    return "Chat";
  };

  // Get chat avatar
  const getChatAvatar = (chat: Chat): string => {
    if (chat.isGroup) {
      return chat.groupAvatar || "/images/chat.png";
    }

    const otherParticipant = chat.participants.find(
      (p) => p.user?.id !== currentUser?.id
    );

    return otherParticipant?.user?.profile?.avatar || "/images/chat.png";
  };

  // Check if user is online
  const isUserOnline = (chat: Chat): boolean => {
    if (chat.isGroup) return false;

    const otherParticipant = chat.participants.find(
      (p) => p.user?.id !== currentUser?.id
    );

    return onlineUsers.includes(otherParticipant?.user?.id || 0);
  };

  // Sort and filter chats
  const sortedAndFilteredChats = useMemo(() => {
    const chats = chatsResponse?.chats || [];

    // Apply sort filter first
    let filtered = chats.filter((chat) => {
      if (sortFilter === "unread") return chat.unreadCount > 0;
      if (sortFilter === "groups") return chat.isGroup;
      if (sortFilter === "personal") return !chat.isGroup;
      return true; // 'all'
    });

    // Then filter by search term
    if (searchTerm) {
      filtered = filtered.filter((chat) => {
        const chatName = getChatName(chat).toLowerCase();
        const lastMessage = chat.lastMessage?.content?.toLowerCase() || "";
        return (
          chatName.includes(searchTerm.toLowerCase()) ||
          lastMessage.includes(searchTerm.toLowerCase())
        );
      });
    }

    // Sort: active chat first, then by most recent message
    return filtered.sort((a, b) => {
      // Active chat always first
      if (a.id === activeChat?.id) return -1;
      if (b.id === activeChat?.id) return 1;

      // Then by last message time
      const aTime = a.lastMessageTime || a.updatedAt;
      const bTime = b.lastMessageTime || b.updatedAt;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });
  }, [chatsResponse?.chats, searchTerm, sortFilter, activeChat?.id]);

  const handleChatSelect = (chat: Chat) => {
    setActiveChat(chat);
    onCloseSidebar();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            Loading Chats...
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading conversations...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            Error Loading Chats
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-red-600">
            <p className="text-sm">Failed to load chats</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-blue-600 underline text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f0f2f5]">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-white">
        <div className="flex items-center gap-2">
          <button
            onClick={handleGoBack}
            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            title="Go Back"
          >
            <IoArrowBack size={20} />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">Chats</h1>
        </div>
        <div className="flex items-center gap-1">
          <select
            value={sortFilter}
            onChange={(e) => setSortFilter(e.target.value as SortFilter)}
            className="text-sm px-2 py-1 border-0 bg-transparent text-gray-600 focus:outline-none cursor-pointer font-medium"
          >
            <option value="all">All Chats</option>
            <option value="unread">Unread</option>
            <option value="personal">Personal</option>
            <option value="groups">Groups</option>
          </select>
          <MdFilterList className="text-gray-500" size={18} />
        </div>
      </div>

      {/* Subtle separator */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

      {/* Search Bar */}
      <div className="p-2 bg-white">
        <div className="relative">
          <IoSearch
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 bg-[#f0f2f5] rounded-lg focus:outline-none focus:bg-white focus:shadow-sm transition-all text-sm"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto bg-white">
        {sortedAndFilteredChats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm
              ? "No chats found matching your search."
              : "No chats yet. Start a new conversation!"}
          </div>
        ) : (
          sortedAndFilteredChats.map((chat) => {
            const isActive = chat.id === activeChat?.id;
            const hasUnread = chat.unreadCount > 0;
            const isOnline = isUserOnline(chat);

            return (
              <div
                key={chat.id}
                onClick={() => handleChatSelect(chat)}
                className={`flex items-center gap-2.5 p-2.5 cursor-pointer transition-colors border-b border-gray-100 ${
                  isActive ? "bg-[#f0f2f5]" : "hover:bg-[#f5f6f6]"
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <img
                    src={getChatAvatar(chat)}
                    alt={getChatName(chat)}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>

                {/* Chat Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3
                      className={`truncate ${
                        hasUnread
                          ? "font-semibold text-gray-900"
                          : "font-medium text-gray-800"
                      }`}
                    >
                      {getChatName(chat)}
                    </h3>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {chat.lastMessageTime &&
                        formatTimestamp(chat.lastMessageTime)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p
                      className={`text-sm truncate ${
                        hasUnread
                          ? "text-gray-900 font-medium"
                          : "text-gray-600"
                      }`}
                    >
                      {(() => {
                        // Check if anyone is typing in this chat
                        const chatTypingUsers = chat.participants
                          .filter(
                            (p) =>
                              p.user?.id !== currentUser?.id &&
                              typingUsers.includes(p.user?.id || 0)
                          )
                          .map((p) => `${p.user?.firstName || "Someone"}`);

                        if (chatTypingUsers.length > 0) {
                          return (
                            <span className="text-blue-500 italic">
                              {chatTypingUsers.length === 1
                                ? `${chatTypingUsers[0]} typing...`
                                : "Someone typing..."}
                            </span>
                          );
                        }

                        return getLastMessagePreview(chat);
                      })()}
                    </p>
                    {hasUnread && (
                      <span className="ml-2 flex-shrink-0 bg-green-500 text-white text-xs font-semibold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                        {chat.unreadCount}
                      </span>
                    )}
                    {chat.lastMessage &&
                      chat.lastMessage.senderId === currentUser?.id &&
                      !hasUnread && (
                        <span className="ml-2 flex-shrink-0 text-blue-500">
                          {chat.lastMessage.isRead ? (
                            <MdDoneAll className="text-sm" />
                          ) : (
                            <MdCheck className="text-sm" />
                          )}
                        </span>
                      )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LeftSideInbox;
