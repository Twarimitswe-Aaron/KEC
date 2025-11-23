import React, { useState, useRef, useContext } from "react";
import {
  X,
  Users,
  Edit2,
  Trash2,
  UserPlus,
  LogOut,
  Camera,
  MoreVertical,
  Check,
  Loader2,
} from "lucide-react";
import { ChatContext } from "./ChatContext";
import { useGetUsersQuery } from "../../state/api/chatApi";

interface GroupInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GroupInfoModal: React.FC<GroupInfoModalProps> = ({ isOpen, onClose }) => {
  const {
    activeChat,
    currentUser,
    renameChat,
    updateChatAvatar,
    addParticipants,
    removeParticipant,
    deleteChat,
  } = useContext(ChatContext)!;

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(activeChat?.name || "");
  const [isAddingParticipants, setIsAddingParticipants] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: usersData } = useGetUsersQuery(
    {
      search: searchQuery,
      excludeIds: activeChat?.participants.map((p) => p.userId) || [],
    },
    { skip: !isAddingParticipants }
  );

  if (!isOpen || !activeChat || !activeChat.isGroup) return null;

  const isAdmin = activeChat.participants.some(
    (p) => p.userId === currentUser?.id && p.isAdmin
  );

  const handleRename = async () => {
    if (!newName.trim() || newName === activeChat.name) {
      setIsEditingName(false);
      return;
    }

    setIsLoading(true);
    const success = await renameChat(activeChat.id, newName);
    setIsLoading(false);
    if (success) setIsEditingName(false);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In a real app, we would upload the file first and get a URL.
    // For this demo, we'll simulate it or assume the backend handles the file upload separately.
    // Since updateChatAvatar expects a URL string, we might need a separate upload endpoint
    // or modify the updateChatAvatar to accept a file.
    // For now, let's just log it as we don't have a direct file upload for avatar ready in context yet
    // apart from the general chat file upload.
    // We'll skip implementation for now or use a placeholder if we want to test UI.
    console.log("Avatar upload not fully implemented yet");
  };

  const handleAddParticipants = async () => {
    if (selectedUserIds.length === 0) return;

    setIsLoading(true);
    const success = await addParticipants(activeChat.id, selectedUserIds);
    setIsLoading(false);
    if (success) {
      setIsAddingParticipants(false);
      setSelectedUserIds([]);
    }
  };

  const handleRemoveParticipant = async (userId: number) => {
    if (!confirm("Are you sure you want to remove this participant?")) return;
    setIsLoading(true);
    await removeParticipant(activeChat.id, userId);
    setIsLoading(false);
  };

  const handleLeaveGroup = async () => {
    if (!confirm("Are you sure you want to leave this group?")) return;
    if (currentUser) {
      setIsLoading(true);
      await removeParticipant(activeChat.id, currentUser.id);
      setIsLoading(false);
      onClose();
    }
  };

  const handleDeleteGroup = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this group? This action cannot be undone."
      )
    )
      return;
    setIsLoading(true);
    await deleteChat(activeChat.id);
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
          <h2 className="text-xl font-semibold text-white">Group Info</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Group Header Info */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white overflow-hidden border-4 border-white/10">
                {activeChat.groupAvatar ? (
                  <img
                    src={activeChat.groupAvatar}
                    alt={activeChat.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  activeChat.name?.[0]?.toUpperCase() || "G"
                )}
              </div>
              {isAdmin && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera className="w-8 h-8 text-white" />
                </button>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </div>

            <div className="text-center w-full">
              {isEditingName ? (
                <div className="flex items-center justify-center gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-black/20 border border-white/10 rounded-lg px-3 py-1 text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    autoFocus
                  />
                  <button
                    onClick={handleRename}
                    disabled={isLoading}
                    className="p-1 hover:bg-green-500/20 text-green-400 rounded transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingName(false);
                      setNewName(activeChat.name || "");
                    }}
                    className="p-1 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 group">
                  <h3 className="text-2xl font-bold text-white">
                    {activeChat.name}
                  </h3>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setIsEditingName(true);
                        setNewName(activeChat.name || "");
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all text-gray-400 hover:text-white"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
              <p className="text-gray-400 text-sm mt-1">
                {activeChat.participants.length} participants
              </p>
            </div>
          </div>

          {/* Participants Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-300 uppercase tracking-wider">
                Participants
              </h4>
              {isAdmin && !isAddingParticipants && (
                <button
                  onClick={() => setIsAddingParticipants(true)}
                  className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <UserPlus className="w-3 h-3" />
                  Add Participants
                </button>
              )}
            </div>

            {isAddingParticipants && (
              <div className="bg-white/5 rounded-xl p-3 space-y-3 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white font-medium">
                    Add Users
                  </span>
                  <button
                    onClick={() => setIsAddingParticipants(false)}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <div className="max-h-40 overflow-y-auto space-y-1 custom-scrollbar">
                  {usersData?.map((user) => (
                    <div
                      key={user.id}
                      onClick={() =>
                        setSelectedUserIds((prev) =>
                          prev.includes(user.id)
                            ? prev.filter((id) => id !== user.id)
                            : [...prev, user.id]
                        )
                      }
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer ${
                        selectedUserIds.includes(user.id)
                          ? "bg-blue-500/20"
                          : "hover:bg-white/5"
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-xs text-white">
                        {user.firstName[0]}
                      </div>
                      <span className="text-sm text-gray-200 flex-1">
                        {user.firstName} {user.lastName}
                      </span>
                      {selectedUserIds.includes(user.id) && (
                        <Check className="w-3 h-3 text-blue-400" />
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleAddParticipants}
                  disabled={selectedUserIds.length === 0 || isLoading}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                >
                  Add Selected
                </button>
              </div>
            )}

            <div className="space-y-2">
              {activeChat.participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white font-medium">
                      {participant.user.profile?.avatar ? (
                        <img
                          src={participant.user.profile.avatar}
                          alt={participant.user.firstName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        `${participant.user.firstName[0]}${participant.user.lastName[0]}`
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">
                          {participant.user.firstName}{" "}
                          {participant.user.lastName}
                        </span>
                        {participant.isAdmin && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            Admin
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        {participant.user.email}
                      </span>
                    </div>
                  </div>

                  {isAdmin && participant.userId !== currentUser?.id && (
                    <button
                      onClick={() =>
                        handleRemoveParticipant(participant.userId)
                      }
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                      title="Remove participant"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <button
              onClick={handleLeaveGroup}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors border border-transparent hover:border-red-500/30"
            >
              <LogOut className="w-4 h-4" />
              Leave Group
            </button>

            {isAdmin && (
              <button
                onClick={handleDeleteGroup}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors border border-red-500/30"
              >
                <Trash2 className="w-4 h-4" />
                Delete Group
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupInfoModal;
