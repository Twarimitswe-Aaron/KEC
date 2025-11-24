import { useState, useContext } from "react";
import { UserRoleContext } from "../UserRoleContext";
import {
  feedBackPost,
  useGetFeedBackQuery,
  usePostFeedBackMutation,
} from "../state/api/announcementsApi";
import { useUser } from "../hooks/useUser";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import {
  Filter,
  ArrowUpNarrowWide,
  Users,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";

// Skeleton Loader for feedback
const FeedbackSkeleton = () => {
  return (
    <div className="animate-pulse bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-6 mb-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 bg-gray-200 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
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
    <div className="flex gap-4 items-start mb-6 group">
      <Link to={`/profile/${id}`} className="flex-shrink-0 mt-2">
        <img
          src={avatar}
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
                    to={`/profile/${id}`}
                    className="flex items-center gap-3 group"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {name}
                      </h3>
                    </div>
                  </Link>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <button
                        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Options"
                      >
                        <MoreHorizontal className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-1 text-gray-700 leading-relaxed text-sm">
                  {message}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Users className="h-3 w-3" />
                    {role}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {new Date(date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
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
    <div className="w-full bg-gray-50 min-h-screen p-4">
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
                    <option value="all">All Feedback</option>
                    <option value="recent">Recent</option>
                    <option value="suggestions">Suggestions</option>
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
                {(feedBackFetched ?? []).length} items found
              </div>
            </div>
          </div>
        </div>

        {UserRole === "student" && (
          <div className="mb-6 p-6 transition-all duration-300">
            <div className="flex items-start gap-4">
              <img
                src={userData?.profile?.avatar}
                alt={userData?.firstName}
                className="w-10 h-10 rounded-full shadow-sm object-cover"
              />
              <div className="flex-1">
                <textarea
                  placeholder="Share your feedback or suggestions..."
                  value={formData.content}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  className="w-full min-h-[100px] p-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#034153]/20 focus:border-[#034153] transition-all resize-none text-sm"
                />
                <div className="flex justify-end mt-3">
                  <button
                    onClick={handleSubmit}
                    disabled={!formData.content.trim()}
                    className="px-6 py-2 bg-[#034153] text-white rounded-lg hover:bg-[#022f40] font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm"
                  >
                    Post Feedback
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {UserRole === "admin" && (
          <>
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
              <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/50">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <span className="text-3xl">💬</span>
                </div>
                <p className="text-gray-500 font-medium">
                  No feedback available yet.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Feedback;
