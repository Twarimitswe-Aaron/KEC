import React, { useState, useContext } from "react";
import { UserRoleContext as UserRoleContextImport } from "../UserRoleContext";
import { useUser } from "../hooks/useUser";
import { Link } from "react-router-dom";
import { HiDotsVertical } from "react-icons/hi";
import {
  useAnnounceMutation,
  useGetAnnounceQuery,
  useDeleteAnnounceMutation,
} from "../state/api/announcementsApi";
import { toast } from "react-toastify";
import ConfirmDialog from "./ConfirmDialog";

type AnnouncementCardProps = {
  id: number;
  name: string;
  message: string;
  avatar?: string | null;
  posterId: number;
  currentUserId: number | null;
  onDeleteClick: (
    id: number,
    userData: { avatar: string; name: string; role: string }
  ) => void;
};

const Announcements = () => {
  const UserRole = useContext(UserRoleContextImport);
  const { userData } = useUser();

  interface FormDataState {
    posterId: number | null;
    content: string;
  }

  const [formData, setFormData] = useState<FormDataState>({
    content: "",
    posterId: userData?.id ?? null,
  });

  const [showConfirm, setShowConfirm] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<{
    id: number;
    avatar: string;
    name: string;
    role: string;
  } | null>(null);

  const [announce] = useAnnounceMutation();
  const [deleteAnnouncement] = useDeleteAnnounceMutation();

  const {
    data: announcementsData = [],
    refetch,
    isLoading,
    isFetching,
  } = useGetAnnounceQuery();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      posterId: userData?.id ?? null,
      content: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.content.trim() || formData.posterId == null) return;

    try {
      const { message } = await announce({
        body: { content: formData.content, posterId: formData.posterId },
      }).unwrap();
      setFormData({ posterId: userData?.id ?? null, content: "" });
      toast.success(message);
      refetch();
    } catch (error: unknown) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ??
        "Failed to post announcement";
      toast.error(message);
      console.error("Failed to post announcement:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const { message } = await deleteAnnouncement({ id }).unwrap();
      toast.success(message || "Announcement deleted successfully");
      refetch();
    } catch (error: unknown) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ??
        "Failed to delete announcement";
      toast.error(message);
      console.error("Delete failed:", error);
    } finally {
      setShowConfirm(false);
      setAnnouncementToDelete(null);
    }
  };

  const handleDeleteClick = (
    id: number,
    userData: { avatar: string; name: string; role: string }
  ) => {
    setAnnouncementToDelete({ id, ...userData });
    setShowConfirm(true);
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setAnnouncementToDelete(null);
  };

  const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
    id,
    name,
    message,
    avatar,
    posterId,
    currentUserId,
    onDeleteClick,
  }) => {
    const [menuOpen, setMenuOpen] = useState(false);

    const isOwner = posterId === currentUserId;

    const getUserDataForDialog = () => {
      if (isOwner) {
        return {
          avatar: userData?.profile?.avatar || "",
          name: "You",
          role: UserRole || "User",
        };
      }

      return {
        avatar: avatar || "",
        name: name,
        role: "User",
      };
    };

    const userDialogData = getUserDataForDialog();

    return (
      <div className="group bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-4 mb-4 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 relative animate-fadeIn">
        {/* Gradient border effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#004e64]/10 via-transparent to-[#025d75]/10 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <Link
              to={`/profile/${posterId}`}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <img
                  src={avatar || ""}
                  alt={`${name} avatar`}
                  className="w-10 h-10 rounded-full border-2 border-white shadow-md object-cover ring-2 ring-[#004e64]/20 transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gradient-to-br from-[#004e64] to-[#025d75] rounded-full border-2 border-white"></div>
              </div>
            </Link>

            <div className="flex justify-between w-full items-center gap-2">
              <h3 className="font-semibold text-[#022F40] text-base tracking-tight">
                {name}
              </h3>

              {isOwner && (
                <div className="relative flex items-center gap-2">
                  <button
                    onClick={() => setMenuOpen((prev) => !prev)}
                    className="p-1.5 rounded-full hover:bg-white/60 transition-all duration-200 hover:shadow-md"
                  >
                    <HiDotsVertical size={18} className="text-gray-600" />
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-32 bg-white/90 backdrop-blur-md border border-white/50 rounded-xl shadow-xl z-30 overflow-hidden animate-fadeIn">
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onDeleteClick(id, userDialogData);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50/80 transition-colors duration-200 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <p className="text-gray-700 text-sm leading-relaxed tracking-wide ml-13 mt-2">
            {message}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Global Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Announcement"
        message="Are you sure you want to delete this announcement? This action cannot be undone."
        avatar={announcementToDelete?.avatar}
        name={announcementToDelete?.name}
        role={announcementToDelete?.role}
        onConfirm={() =>
          announcementToDelete && handleDelete(announcementToDelete.id)
        }
        onCancel={handleCancelDelete}
      />

      {(UserRole === "admin" || UserRole === "teacher") && (
        <div className="max-w-3xl mx-auto px-4 pt-6 pb-4">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-4 mb-6 hover:shadow-2xl transition-all duration-300">
            {/* Gradient border effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#004e64]/5 via-transparent to-[#025d75]/5 pointer-events-none"></div>

            <div className="flex items-start gap-3 relative z-10">
              <div className="relative">
                <img
                  src={
                    userData?.profile?.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      `${userData?.firstName ?? ""} ${userData?.lastName ?? ""}`
                    )}&background=022F40&color=ffffff&rounded=true&size=40`
                  }
                  alt={userData?.firstName ?? "User"}
                  className="w-10 h-10 rounded-full ring-2 ring-[#004e64]/20 shadow-md"
                />
              </div>

              <div className="flex-1">
                <div className="bg-gradient-to-br from-gray-50/80 to-white/80 rounded-xl p-3 border border-gray-200/50 shadow-inner">
                  <textarea
                    placeholder="Share an announcement with everyone..."
                    value={formData.content}
                    onChange={handleChange}
                    className="w-full min-h-[90px] p-3 rounded-lg border-none resize-none bg-transparent focus:outline-none text-sm placeholder:text-gray-400"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleSubmit}
                      disabled={!formData.content.trim()}
                      className="px-5 py-2 bg-gradient-to-r from-[#004e64] to-[#025d75] text-white rounded-lg cursor-pointer hover:from-[#025d75] hover:to-[#004e64] text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-4">
        <h2 className="text-2xl font-bold text-[#022F40] mb-6 tracking-tight flex items-center gap-2">
          <div className="w-1 h-8 bg-gradient-to-b from-[#004e64] to-[#025d75] rounded-full"></div>
          Announcements
        </h2>

        {isLoading || isFetching ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-32 mb-2"></div>
                  </div>
                </div>
                <div className="space-y-2 ml-13">
                  <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-full"></div>
                  <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : announcementsData && announcementsData.length > 0 ? (
          announcementsData.map((announcement: any) => {
            const isCurrentUser = announcement.poster?.id === userData?.id;
            const nameToShow = isCurrentUser
              ? "You"
              : `${announcement.poster?.firstName ?? ""} ${
                  announcement.poster?.lastName ?? ""
                }`.trim() || "Unknown";

            return (
              <AnnouncementCard
                key={announcement.id}
                id={announcement.id}
                name={nameToShow}
                message={announcement.content}
                avatar={announcement.poster?.profile?.avatar || null}
                posterId={announcement.poster?.id}
                currentUserId={userData?.id ?? null}
                onDeleteClick={handleDeleteClick}
              />
            );
          })
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-4">
              <span className="text-3xl">📢</span>
            </div>
            <p className="text-gray-400 text-sm">No announcements available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
