import React, { useState, useContext } from "react";
import { UserRoleContext as UserRoleContextImport } from "../UserRoleContext";
import { useUser } from "../hooks/useUser";
import { Link } from "react-router-dom";
import { Filter, ArrowUpNarrowWide, MoreHorizontal } from "lucide-react";
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
  date: string;
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
    date,
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
      <div className="flex gap-4 items-start mb-6 group">
        <Link to={`/profile/${posterId}`} className="flex-shrink-0 mt-2">
          <img
            src={
              avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                name
              )}&background=022F40&color=ffffff&rounded=true&size=48`
            }
            alt={`${name} avatar`}
            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm group-hover:scale-105 transition-transform"
          />
        </Link>

        <div className="flex-1 relative">
          {/* Speech bubble tail */}
          <div className="absolute top-6 -left-2 w-4 h-4 bg-white/80 backdrop-blur-sm transform rotate-45 border-l border-b border-white/50 z-10"></div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden transition-all duration-300 hover:shadow-2xl relative z-0">
            <div className="p-4 cursor-pointer hover:bg-gray-50/50 transition-all duration-300 border-b border-gray-200/50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <Link
                      to={`/profile/${posterId}`}
                      className="flex items-center gap-3 group"
                    >
                      <span className="font-bold text-gray-900 group-hover:text-[#034153] transition-colors">
                        {name}
                      </span>
                      {userDialogData.role && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                          {userDialogData.role}
                        </span>
                      )}
                    </Link>

                    {(isOwner || UserRole === "admin") && (
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setMenuOpen(!menuOpen);
                          }}
                          className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>

                        {menuOpen && (
                          <div className="absolute right-0 top-full mt-2 w-32 bg-white/90 backdrop-blur-md border border-white/50 rounded-xl shadow-xl z-30 overflow-hidden animate-fadeIn">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setMenuOpen(false);
                                onDeleteClick(id, userDialogData);
                              }}
                              className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50/80 transition-colors duration-200 font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="mt-1 text-gray-700 leading-relaxed text-sm">
                    {message}
                  </div>
                  <div className="flex justify-end mt-2">
                    <p className="text-[10px] text-gray-400 font-medium">
                      {new Date(date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen p-4">
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

      <div className="max-w-4xl mx-auto">
        {/* Filter Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 mb-6">
          <div className="p-4">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Filter:
                  </span>
                  <select className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent">
                    <option value="all">All Types</option>
                    <option value="general">General</option>
                    <option value="important">Important</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">
                    Sort by:
                  </span>
                  <select className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent">
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
                <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                  <ArrowUpNarrowWide className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              <div className="text-sm text-gray-500">
                {announcementsData.length} announcements found
              </div>
            </div>
          </div>
        </div>

        {UserRole === "admin" && (
          <div className="mb-6 p-6 transition-all duration-300">
            <div className="flex items-start gap-4">
              <img
                src={
                  userData?.profile?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    `${userData?.firstName ?? ""} ${userData?.lastName ?? ""}`
                  )}&background=022F40&color=ffffff&rounded=true&size=40`
                }
                alt={userData?.firstName ?? "User"}
                className="w-10 h-10 rounded-full shadow-sm"
              />
              <div className="flex-1">
                <textarea
                  placeholder="Share an announcement with everyone..."
                  value={formData.content}
                  onChange={handleChange}
                  className="w-full min-h-[100px] p-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#034153]/20 focus:border-[#034153] transition-all resize-none text-sm"
                />
                <div className="flex justify-end mt-3">
                  <button
                    onClick={handleSubmit}
                    disabled={!formData.content.trim()}
                    className="px-6 py-2 bg-[#034153] text-white rounded-lg hover:bg-[#022f40] font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm"
                  >
                    Post Announcement
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {isLoading || isFetching ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
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

              // Generate fallback avatar if poster doesn't have one
              const posterAvatar =
                announcement.poster?.profile?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  `${announcement.poster?.firstName ?? ""} ${
                    announcement.poster?.lastName ?? ""
                  }`
                )}&background=022F40&color=ffffff&rounded=true&size=48`;

              return (
                <AnnouncementCard
                  key={announcement.id}
                  id={announcement.id}
                  name={nameToShow}
                  message={announcement.content}
                  avatar={posterAvatar}
                  posterId={announcement.poster?.id}
                  currentUserId={userData?.id ?? null}
                  date={announcement.createdAt}
                  onDeleteClick={handleDeleteClick}
                />
              );
            })
          ) : (
            <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/50">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <span className="text-3xl">📢</span>
              </div>
              <p className="text-gray-500 font-medium">
                No announcements available yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Announcements;
