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
  date: string;
  avatar?: string | null;
  posterId: number;
  currentUserId: number | null;
  onDeleteClick: (id: number, userData: { avatar: string; name: string; role: string }) => void;
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
      const { message } = await deleteAnnouncement({id}).unwrap();
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

  const handleDeleteClick = (id: number, userData: { avatar: string; name: string; role: string }) => {
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
    date,
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
          role: UserRole || "User"
        };
      }
      

      return {
        avatar: avatar || "",
        name: name,
        role: "User"
      };
    };

    const userDialogData = getUserDataForDialog();

    return (
      <div className="bg-white/60 backdrop-blur-md rounded-lg shadow-md border border-gray-200 p-3 mb-3 hover:shadow-lg transition duration-300 relative">
        <div className="flex items-center gap-2 mb-2">
          <Link to={`/profile/${posterId}`} className="flex items-center gap-2">
            <img
              src={avatar || ""}
              alt={`${name} avatar`}
              className="w-8 h-8 rounded-full border-none shadow-sm object-cover"
            />
          </Link>

          <div className="flex justify-between w-full items-center gap-2">
            <h3 className="font-semibold text-[#022F40] text-sm tracking-wide">{name}</h3>

            {isOwner && (
              <div className="relative flex items-center gap-2">
                <button
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <HiDotsVertical size={16} />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-28 bg-white border border-gray-200 rounded-lg shadow-lg z-30">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onDeleteClick(id, userDialogData);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                    >Del
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <p className="text-gray-800 text-sm leading-relaxed tracking-wide ml-10">{message}</p>
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Global Confirmation Dialog - Rendered at the root level */}
      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Announcement"
        message="Are you sure you want to delete this announcement? This action cannot be undone."
        avatar={announcementToDelete?.avatar}
        name={announcementToDelete?.name}
        role={announcementToDelete?.role}
        onConfirm={() => announcementToDelete && handleDelete(announcementToDelete.id)}
        onCancel={handleCancelDelete}
      />

      {(UserRole === "admin" || UserRole === "teacher") && (
        <div className="flex items-top p-2">
          <img
            src={
              userData?.profile?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                `${userData?.firstName ?? ""} ${userData?.lastName ?? ""}`
              )}&background=022F40&color=ffffff&rounded=true&size=32`
            }
            alt={userData?.firstName ?? "User"}
            className="w-8 h-8 rounded-full mr-2"
          />
          <div className="flex-1 bg-gray-100 rounded-lg p-2">
            <div className="flex flex-col h-full">
              <textarea
                placeholder="Type your announcement here"
                value={formData.content}
                onChange={handleChange}
                className="w-full min-h-[80px] p-2 rounded-lg border-none resize-none bg-gray-100 focus:outline-none text-md"
              />
              <div className="flex justify-end mt-1">
                <button
                  onClick={handleSubmit}
                  className="px-3 py-1 bg-[#022F40] text-white rounded-lg cursor-pointer hover:bg-[#033549] text-xs"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-4">
        <h2 className="text-xl font-bold text-[#022F40] mb-4 tracking-tight">Announcements</h2>

        {isLoading || isFetching ? (
          <div className="space-y-2">
            <div className="animate-pulse h-24 bg-gray-200 rounded-lg" />
            <div className="animate-pulse h-24 bg-gray-200 rounded-lg" />
            <div className="animate-pulse h-24 bg-gray-200 rounded-lg" />
          </div>
        ) : announcementsData && announcementsData.length > 0 ? (
          announcementsData.map((announcement: any) => {
            const isCurrentUser = announcement.poster?.id === userData?.id;
            const nameToShow =
              isCurrentUser
                ? "You"
                : `${announcement.poster?.firstName ?? ""} ${announcement.poster?.lastName ?? ""}`.trim() ||
                  "Unknown";

            return (
              <AnnouncementCard
                key={announcement.id}
                id={announcement.id}
                name={nameToShow}
                message={announcement.content}
                date={new Date(announcement.createdAt).toLocaleDateString()}
                avatar={announcement.poster?.profile?.avatar || null}
                posterId={announcement.poster?.id}
                currentUserId={userData?.id ?? null}
                onDeleteClick={handleDeleteClick}
              />
            );
          })
        ) : (
          <p className="text-gray-400 text-center text-sm">No announcements available.</p>
        )}
      </div>
    </div>
  );
};

export default Announcements;