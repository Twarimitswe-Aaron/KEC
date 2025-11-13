import React, { useState, useRef, useEffect } from "react";

import { MdOutlinePhoneInTalk } from "react-icons/md";
import { FiSend } from "react-icons/fi";
import { GoDeviceCameraVideo } from "react-icons/go";
import { GoPaperclip } from "react-icons/go";
import { BsEmojiSmile } from "react-icons/bs";
import { MdInfoOutline } from "react-icons/md";
import { CiMenuKebab } from "react-icons/ci";
import { useChat } from './ChatContext';
import { Message } from '../../state/api/chatApi';

interface ChatProps {
  onToggleRightSidebar: () => void;
}

const Chat: React.FC<ChatProps> = ({ onToggleRightSidebar }) => {
  const { 
    activeChat, 
    messages, 
    currentUser, 
    sendMessage, 
    isTyping, 
    setIsTyping, 
    typingUsers,
    onlineUsers,
    isLoading,
    isConnected 
  } = useChat();
  
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Format time display
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}hr ago`;
    if (diffInDays < 7) return `${Math.floor(diffInDays)} days ago`;
    
    return date.toLocaleDateString();
  };

  const handleSendMessage = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    if (newMessage.trim() && activeChat) {
      const success = await sendMessage(newMessage.trim());
      if (success) {
        setNewMessage("");
        setIsTyping(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    // Handle typing indicator
    if (!isTyping) {
      setIsTyping(true);
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  // Get chat participant info (excluding current user)
  const getChatParticipant = () => {
    if (!activeChat) return null;
    
    if (activeChat.isGroup) {
      return {
        name: activeChat.name || 'Group Chat',
        avatar: activeChat.groupAvatar,
        isOnline: false,
        lastSeen: 'Group'
      };
    }
    
    const participant = activeChat.participants.find(p => p.user.id !== currentUser?.id);
    if (participant) {
      return {
        name: `${participant.user.firstName} ${participant.user.lastName}`,
        avatar: participant.user.profile?.avatar,
        isOnline: onlineUsers.includes(participant.user.id),
        lastSeen: participant.user.isOnline ? 'Online' : participant.user.lastSeen || 'Last seen recently'
      };
    }
    
    return null;
  };

  const participant = getChatParticipant();

  // Show loading state if no active chat
  if (!activeChat) {
    return (
      <div className="flex w-full flex-col h-full bg-white">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
            <p className="text-sm">Choose from your existing conversations or start a new one</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white text-black border-b">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={participant?.avatar || '/images/chat.png'}
              alt={participant?.name || 'Chat'}
              className="w-10 h-10 rounded-full object-cover"
            />
            {participant?.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div>
            <h3 className="font-semibold">{participant?.name || 'Unknown'}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {typingUsers.length > 0 ? (
                <span className="text-blue-500">Typing...</span>
              ) : (
                <span>{participant?.lastSeen}</span>
              )}
              {!isConnected && (
                <span className="text-red-500">• Offline</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xl">
          <GoDeviceCameraVideo className="cursor-pointer hover:text-blue-600 transition-colors" />
          <MdOutlinePhoneInTalk className="cursor-pointer hover:text-blue-600 transition-colors" />
          <MdInfoOutline
            className="cursor-pointer hover:text-blue-600 transition-colors"
            onClick={onToggleRightSidebar}
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-white space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
            <p className="text-sm">Start the conversation by sending a message</p>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isCurrentUser = message.senderId === currentUser?.id;
              return (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    isCurrentUser ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isCurrentUser && (
                    <img
                      src={message.sender?.profile?.avatar || '/images/chat.png'}
                      className="h-8 w-8 rounded-full object-cover"
                      alt={`${message.sender?.firstName} Avatar`}
                    />
                  )}

                  <div className={`max-w-[70%] ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                    <div
                      className={`inline-block px-4 py-2 rounded-lg ${
                        isCurrentUser
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      {message.messageType === "TEXT" && (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                      {message.messageType === "IMAGE" && (
                        <img
                          src={message.fileUrl}
                          alt="Shared image"
                          className="max-w-[250px] rounded-md"
                        />
                      )}
                      {message.messageType === "FILE" && (
                        <div className="flex items-center gap-2 p-2 bg-white bg-opacity-20 rounded-md">
                          <GoPaperclip className="h-4 w-4" />
                          <span className="text-sm">{message.fileName}</span>
                        </div>
                      )}
                      {message.messageType === "LINK" && (
                        <a
                          href={message.content}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-200 underline hover:text-blue-100"
                        >
                          {message.content}
                        </a>
                      )}
                    </div>
                    
                    <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${
                      isCurrentUser ? 'justify-end' : 'justify-start'
                    }`}>
                      <span>{formatTime(message.createdAt)}</span>
                      {isCurrentUser && (
                        <span>
                          {message.isRead ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>

                  {isCurrentUser && (
                    <img
                      src={currentUser?.profile?.avatar || '/images/user-avatar.png'}
                      className="h-8 w-8 rounded-full object-cover"
                      alt="Your Avatar"
                    />
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-50 border-t">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={!isConnected}
            className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          />
          
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-500 hover:text-blue-600 transition-colors">
              <BsEmojiSmile className="h-5 w-5" />
            </button>
            
            <button className="p-2 text-gray-500 hover:text-blue-600 transition-colors">
              <GoPaperclip className="h-5 w-5" />
            </button>
            
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || !isConnected}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white p-2 rounded-full transition-colors"
            >
              <FiSend className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;