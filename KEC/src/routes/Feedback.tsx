import React, { useState, useContext } from "react";
import { UserRoleContext } from "../UserRoleContext";
import {
  feedBackPost,
  useGetFeedBackQuery,
  usePostFeedBackMutation,
} from "../state/api/announcementsApi";
import { useUser } from "../hooks/useUser";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

// Skeleton Loader for feedback
const FeedbackSkeleton = () => {
  return (
    <div className="animate-pulse bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-4 mb-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-24"></div>
        </div>
        <div className="h-3 w-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-full"></div>
        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4"></div>
      </div>
    </div>
  );
};

// Feedback Card
type FeedbackCardProps = {
  name: string;
  role: string;
  message: string;
  date: string;
  avatar: string;
  id: number;
};

const FeedbackCard = ({
  name,
  role,
  message,
  date,
  avatar,
  id,
}: FeedbackCardProps) => {
  return (
    <div className="group bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-4 mb-4 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 relative animate-fadeIn">
      {/* Gradient border effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#004e64]/10 via-transparent to-[#025d75]/10 pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <Link to={`/profile/${id}`}>
            <div className="relative">
              <img
                src={avatar}
                alt={`${name} avatar`}
                className="w-11 h-11 cursor-pointer rounded-full border-2 border-white shadow-md ring-2 ring-[#004e64]/20 transition-transform duration-300 group-hover:scale-105 object-cover"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-gradient-to-br from-green-400 to-green-600 rounded-full border-2 border-white"></div>
            </div>
          </Link>

          <div className="flex justify-between w-full items-center gap-2">
            <div>
              <h3 className="font-semibold text-[#022F40] text-base tracking-tight">
                {name}
              </h3>
              <p className="text-xs text-gray-500 font-medium">{role}</p>
            </div>
            <div className="text-xs text-gray-400 font-medium bg-gray-50/50 px-2 py-1 rounded-lg">
              {new Date(date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>
        </div>

        <p className="text-gray-700 text-sm leading-relaxed tracking-wide">
          {message}
        </p>
      </div>
    </div>
  );
};

// Main Feedback Component
const Feedback = () => {
  const UserRole = useContext(UserRoleContext);
  const [sendFeedBack] = usePostFeedBackMutation();
  const {
    data: feedBackFetched,
    refetch,
    isLoading,
    isFetching,
  } = useGetFeedBackQuery();
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {(UserRole === "student" || UserRole === "teacher") && (
          <div className="mb-6">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-4 hover:shadow-2xl transition-all duration-300">
              {/* Gradient border effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#004e64]/5 via-transparent to-[#025d75]/5 pointer-events-none"></div>

              <div className="flex items-start gap-3 relative z-10">
                <div className="relative">
                  <img
                    src={userData?.profile?.avatar}
                    alt={userData?.firstName}
                    className="w-11 h-11 rounded-full ring-2 ring-[#004e64]/20 shadow-md object-cover"
                  />
                </div>

                <div className="flex-1">
                  <div className="bg-gradient-to-br from-gray-50/80 to-white/80 rounded-xl p-3 border border-gray-200/50 shadow-inner">
                    <textarea
                      placeholder="Share your feedback or suggestions..."
                      value={formData.content}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          content: e.target.value,
                        }))
                      }
                      className="w-full min-h-[100px] p-3 rounded-lg resize-none bg-transparent focus:outline-none text-sm placeholder:text-gray-400"
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={handleSubmit}
                        disabled={!formData.content.trim()}
                        className="px-5 py-2 bg-gradient-to-r from-[#004e64] to-[#025d75] text-white text-sm rounded-lg hover:from-[#025d75] hover:to-[#004e64] font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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

        {(UserRole === "admin" || UserRole === "teacher") && (
          <>
            <h2 className="text-2xl font-bold text-[#022F40] mb-6 tracking-tight flex items-center gap-2">
              <div className="w-1 h-8 bg-gradient-to-b from-[#004e64] to-[#025d75] rounded-full"></div>
              Feedback
            </h2>

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
                  avatar={fb.poster.avatar}
                  id={fb.poster.id}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-4">
                  <span className="text-3xl">💬</span>
                </div>
                <p className="text-gray-400 text-sm">No feedback available.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Feedback;
