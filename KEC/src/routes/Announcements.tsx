import React, { useState, useContext } from "react";
import { UserRoleContext as UserRoleContextImport } from "../UserRoleContext";
import { useUser } from "../hooks/useUser";
import {
  useAnnounceMutation,
  useGetAnnounceQuery,
} from "../state/api/announcementsApi";
import { toast } from "react-toastify";

type AnnouncementCardProps = {
  name: string;
  message: string;
  date: string;
  avatar?: string | null;
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

  const [announce] = useAnnounceMutation();
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
        body: {
          content: formData.content,
          posterId: formData.posterId,
        },
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

  const AnnouncementCard = ({ name, message, date, avatar }: AnnouncementCardProps) => {
    console.log(name,avatar)
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=022F40&color=ffffff&rounded=true&size=32`;

    return (
      <div className="bg-white/60 backdrop-blur-md rounded-lg shadow-md border border-gray-200 p-3 mb-3 hover:shadow-lg transition duration-300">
        <div className="flex items-center gap-2 mb-2">
          <img
            src={avatar || fallbackUrl}
            alt={`${name} avatar`}
            className="w-8 h-8 rounded-full border-none shadow-sm"
          />
          <div className="flex justify-between w-full items-center gap-2">
            <div className="inline-block">
              <h3 className="font-semibold text-[#022F40] text-sm tracking-wide">
                {name}
              </h3>
            </div>
            <div className="text-xs">
              <p>{date}</p>
            </div>
          </div>
        </div>
        <p className="text-gray-800 text-sm leading-relaxed tracking-wide ml-10">
          {message}
        </p>
      </div>
    );
  };

  const AnnouncementSkeleton = () => (
    <div className="bg-white/60 backdrop-blur-md rounded-lg shadow-md border border-gray-200 p-3 mb-3 animate-pulse">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-gray-300" />
        <div className="flex-1">
          <div className="h-3 w-24 bg-gray-300 rounded mb-1"></div>
          <div className="h-2 w-16 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="h-3 w-full bg-gray-200 rounded mb-1 ml-10"></div>
      <div className="h-3 w-3/4 bg-gray-200 rounded ml-10"></div>
    </div>
  );

  return (
    <div>
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
        <h2 className="text-xl font-bold text-[#022F40] mb-4 tracking-tight">
          Announcements
        </h2>

        {isLoading || isFetching ? (
          <>
            <AnnouncementSkeleton />
            <AnnouncementSkeleton />
            <AnnouncementSkeleton />
          </>
        ) : announcementsData && announcementsData.length > 0 ? (
          announcementsData.map((announcement: any, index: number) => {
            const isCurrentUser = announcement.poster?.id === userData?.id;
            const nameToShow = isCurrentUser ? "You" : `${announcement.poster?.firstName ?? ""} ${announcement.poster?.lastName ?? ""}`.trim() || "Unknown";

            return (
              <AnnouncementCard
                key={index}
                name={nameToShow}
                message={announcement.content}
                date={new Date(announcement.createdAt).toLocaleDateString()}
                avatar={announcement.poster?.profile?.avatar || null}
              />
            );
          })
        ) : (
          <p className="text-gray-400 text-center text-sm">
            No announcements available.
          </p>
        )}
      </div>
    </div>
  );
};

export default Announcements;
