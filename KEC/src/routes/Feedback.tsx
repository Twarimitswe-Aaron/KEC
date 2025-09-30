import React, { useState, useContext } from "react";
import { UserRoleContext } from "../UserRoleContext";
import {
  feedBackPost,
  useGetFeedBackQuery,
  usePostFeedBackMutation,
} from "../state/api/announcementsApi";
import { useUser } from "../hooks/useUser";
import { toast } from "react-toastify";

// Skeleton Loader for feedback
const FeedbackSkeleton = () => {
  return (
    <div className="animate-pulse bg-white/40 backdrop-blur-md rounded-xl shadow border border-gray-200 p-3 mb-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
        <div className="flex-1">
          <div className="h-3 bg-gray-300 rounded w-28 mb-1"></div>
          <div className="h-2 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="h-3 w-12 bg-gray-200 rounded"></div>
      </div>
      <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
    </div>
  );
};

// Feedback Card
type FeedbackCardProps = {
  name: string;
  role: string;
  message: string;
  date: string;
};

const FeedbackCard = ({ name, role, message, date }: FeedbackCardProps) => {
  return (
    <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-md border border-gray-200 p-3 mb-4 hover:shadow-lg transition duration-300">
      <div className="flex items-center gap-3 mb-2">
        <img
          src={`https://ui-avatars.com/api/?name=${name}&background=022F40&color=ffffff&rounded=true&size=48`}
          alt={`${name} avatar`}
          className="w-10 h-10 rounded-full shadow-sm"
        />
        <div className="flex justify-between w-full items-center gap-2">
          <div>
            <h3 className="font-semibold text-[#022F40] text-sm">{name}</h3>
            <p className="text-xs text-gray-500">{role}</p>
          </div>
          <div className="text-xs text-gray-400">{new Date(date).toLocaleString()}</div>
        </div>
      </div>
      <p className="text-gray-700 text-sm leading-relaxed">{message}</p>
    </div>
  );
};

// Main Feedback Component
const Feedback = () => {
  const UserRole = useContext(UserRoleContext);
  const [sendFeedBack] = usePostFeedBackMutation();
  const { data: feedBackFetched, refetch, isLoading, isFetching } = useGetFeedBackQuery();
  const { userData } = useUser();

  const [formData, setFormData] = useState<feedBackPost>({
    content: "",
    posterId: userData?.id ?? 0,
  });

  const handleSubmit = async () => {
    if (!formData.content.trim() || formData.posterId == null) return;
    try {
      const { data } = await sendFeedBack({
        content: formData.content,
        posterId: formData.posterId,
      });
      toast.success(data && data.message);
      setFormData({ ...formData, content: "" });
      refetch();
    } catch (error: unknown) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ??
        "Failed to send Feedback";
      toast.error(message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {(UserRole === "student" || UserRole === "teacher") && (
        <div className="flex items-start mb-6">
          <img
            src={userData?.profile?.avatar}
            alt={userData?.firstName}
            className="w-10 h-10 rounded-full mr-2.5"
          />
          <div className="flex-1 bg-gray-100 rounded-lg p-3">
            <textarea
              placeholder="Write your feedback here..."
              value={formData.content}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, content: e.target.value }))
              }
              className="w-full min-h-[100px] p-2 rounded-lg resize-none bg-gray-100 focus:outline-none text-sm"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleSubmit}
                className="px-3 py-1 bg-[#022F40] text-white text-sm rounded-md hover:bg-[#033549]"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-xl font-semibold text-[#022F40] mb-4">Feedback</h2>

      {isLoading || isFetching ? (
        <>
          <FeedbackSkeleton />
          <FeedbackSkeleton />
          <FeedbackSkeleton />
        </>
      ) : (feedBackFetched ?? []).length > 0 ? (
        (feedBackFetched ?? []).map((fb, index) => (
          <FeedbackCard
            key={index}
            name={`${fb.poster.firstName} ${fb.poster.lastName}`}
            role={fb.poster.email}
            message={fb.content}
            date={fb.createdAt}
          />
        ))
      ) : (
        <p className="text-gray-400 text-center">No feedback available.</p>
      )}
    </div>
  );
};

export default Feedback;
