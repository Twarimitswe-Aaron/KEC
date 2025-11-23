import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Camera,
  Edit2,
  Users,
  LogOut,
  Trash2,
  Check,
  UserPlus,
  Loader2,
  Upload,
} from "lucide-react";
import { Chat, useGetUsersQuery } from "../../state/api/chatApi";
import { useGetUserQuery } from "../../state/api/authApi";
import { useChat } from "../../hooks/useChat";
import axios from "axios";

interface GroupInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeChat: Chat | null;
}

const GroupInfoModal: React.FC<GroupInfoModalProps> = ({
  isOpen,
  onClose,
  activeChat,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [isAddingParticipants, setIsAddingParticipants] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: currentUser } = useGetUserQuery();
  const {
    renameChat,
    updateChatAvatar,
    addParticipants,
    removeParticipant,
    deleteChat,
  } = useChat();

  const { data: usersData, isLoading: isLoadingUsers } = useGetUsersQuery(
    {
      search: searchQuery,
      excludeIds: activeChat
        ? [
            ...activeChat.participants.map((p) => p.userId),
            ...(currentUser ? [currentUser.id] : []),
          ]
        : [],
    },
    { skip: !isAddingParticipants }
  );

  useEffect(() => {
    if (activeChat) {
      setNewGroupName(activeChat.name || "");
      setAvatarPreview(activeChat.groupAvatar || null);
    }
  }, [activeChat]);

  if (!isOpen || !activeChat) return null;

  const isAdmin = activeChat.participants.find(
    (p) => p.userId === currentUser?.id
  )?.isAdmin;

  const handleRename = async () => {
    if (!newGroupName.trim() || newGroupName === activeChat.name) {
      setIsEditingName(false);
      return;
    }

    setIsProcessing(true);
    try {
      await renameChat(activeChat.id, newGroupName);
      setIsEditingName(false);
    } catch (error) {
      console.error("Failed to rename group:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload immediately
      setIsProcessing(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/chat/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        await updateChatAvatar(activeChat.id, response.data.fileUrl);
      } catch (error) {
        console.error("Failed to update group avatar:", error);
        // Revert preview on error
        setAvatarPreview(activeChat.groupAvatar || null);
      } finally {
        setIsProcessing(false);
        setAvatarFile(null);
      }
    }
  };

  const handleAddParticipants = async () => {
    if (selectedUserIds.length === 0) return;

    setIsProcessing(true);
    try {
      await addParticipants(activeChat.id, selectedUserIds);
      setIsAddingParticipants(false);
      setSelectedUserIds([]);
      setSearchQuery("");
    } catch (error) {
      console.error("Failed to add participants:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveParticipant = async (userId: number) => {
    if (
      !confirm(
        "Are you sure you want to remove this participant? They will no longer be able to see this chat."
      )
    )
      return;

    setIsProcessing(true);
    try {
      await removeParticipant(activeChat.id, userId);
    } catch (error) {
      console.error("Failed to remove participant:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!currentUser) return;
    if (
      !confirm(
        "Are you sure you want to leave this group? You won't be able to rejoin unless added by an admin."
      )
    )
      return;

    setIsProcessing(true);
    try {
      await removeParticipant(activeChat.id, currentUser.id);
      onClose();
    } catch (error) {
      console.error("Failed to leave group:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this group? This action cannot be undone and all messages will be lost for everyone."
      )
    )
      return;

    setIsProcessing(true);
    try {
      await deleteChat(activeChat.id);
      onClose();
    } catch (error) {
      console.error("Failed to delete group:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="relative h-32 bg-gradient-to-r from-blue-600 to-purple-600">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={activeChat.name || "Group"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <Users className="w-10 h-10 text-gray-400" />
                  </div>
                )}
              </div>

              {isAdmin && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors border-2 border-white"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pt-14 pb-4 px-4">
          {/* Group Name */}
          <div className="text-center mb-6">
            {isEditingName ? (
              <div className="flex items-center justify-center gap-2">
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-center font-semibold text-lg w-full max-w-[200px]"
                  autoFocus
                />
                <button
                  onClick={handleRename}
                  disabled={isProcessing}
                  className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setIsEditingName(false);
                    setNewGroupName(activeChat.name || "");
                  }}
                  className="p-1.5 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 group">
                <h2 className="text-xl font-bold text-gray-900">
                  {activeChat.name || "Group Chat"}
                </h2>
                {isAdmin && (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
            <p className="text-sm text-gray-500 mt-1">
              {activeChat.participants.length} participants
            </p>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {isAdmin && (
              <button
                onClick={() => setIsAddingParticipants(true)}
                className="flex items-center justify-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-colors font-medium text-sm"
              >
                <UserPlus className="w-4 h-4" />
                Add Members
              </button>
            )}
            <button
              onClick={handleLeaveGroup}
              className="flex items-center justify-center gap-2 p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors font-medium text-sm"
            >
              <LogOut className="w-4 h-4" />
              Leave Group
            </button>
          </div>

          {/* Add Participants Section */}
          {isAddingParticipants && (
            <div className="mb-6 bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-sm">
                  Add Members
                </h3>
                <button
                  onClick={() => setIsAddingParticipants(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />

              <div className="max-h-40 overflow-y-auto space-y-2 mb-3 custom-scrollbar">
                {isLoadingUsers ? (
                  <div className="flex justify-center py-2">
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                  </div>
                ) : usersData && usersData.length > 0 ? (
                  usersData.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => toggleUserSelection(user.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedUserIds.includes(user.id)
                          ? "bg-blue-100 text-blue-700"
                          : "hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium overflow-hidden">
                        {user.profile?.avatar ? (
                          <img
                            src={user.profile.avatar}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          user.firstName[0]
                        )}
                      </div>
                      <span className="text-sm font-medium flex-1">
                        {user.firstName} {user.lastName}
                      </span>
                      {selectedUserIds.includes(user.id) && (
                        <Check className="w-4 h-4" />
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 text-xs py-2">
                    No users found
                  </p>
                )}
              </div>

              <button
                onClick={handleAddParticipants}
                disabled={selectedUserIds.length === 0 || isProcessing}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? "Adding..." : "Add Selected"}
              </button>
            </div>
          )}

          {/* Participants List */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 px-1">
              Participants
            </h3>
            <div className="space-y-1">
              {activeChat.participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium overflow-hidden">
                        {participant.user.profile?.avatar ? (
                          <img
                            src={participant.user.profile.avatar}
                            alt={participant.user.firstName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          participant.user.firstName[0]
                        )}
                      </div>
                      {participant.isAdmin && (
                        <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full border-2 border-white">
                          Admin
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {participant.user.firstName} {participant.user.lastName}
                        {participant.user.id === currentUser?.id && " (You)"}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {participant.user.email}
                      </p>
                    </div>
                  </div>

                  {isAdmin && participant.user.id !== currentUser?.id && (
                    <button
                      onClick={() =>
                        handleRemoveParticipant(participant.user.id)
                      }
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Remove user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Delete Group (Admin Only) */}
          {isAdmin && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={handleDeleteGroup}
                className="w-full flex items-center justify-center gap-2 p-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors font-medium text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Delete Group
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupInfoModal;
