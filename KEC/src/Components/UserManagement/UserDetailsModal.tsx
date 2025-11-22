import React from "react";
import { useGetUserDetailsQuery } from "../../state/api/userApi";
import {
  X,
  User,
  Mail,
  Calendar,
  BookOpen,
  Award,
  AlertCircle,
  DollarSign,
  GraduationCap,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface UserDetailsModalProps {
  userId: number;
  onClose: () => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  userId,
  onClose,
}) => {
  const { data, isLoading, error } = useGetUserDetailsQuery(userId);

  if (!userId) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div
        className="bg-[#1e1e1e] rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl border border-white/10 flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-start bg-[#252525]">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-purple-500/50 shadow-lg bg-[#1a1a1a]">
                {data?.user?.avatar ? (
                  <img
                    src={data.user.avatar}
                    alt={data.user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20">
                    <User size={40} />
                  </div>
                )}
              </div>
              <div
                className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-[#252525] ${
                  data?.user?.role === "student"
                    ? "bg-green-500"
                    : data?.user?.role === "teacher"
                    ? "bg-blue-500"
                    : "bg-purple-500"
                }`}
              />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                {isLoading ? (
                  <div className="h-8 w-48 bg-white/10 rounded animate-pulse" />
                ) : (
                  <>
                    {data?.user?.name}
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${
                        data?.user?.role === "student"
                          ? "bg-green-500/10 border-green-500/30 text-green-400"
                          : data?.user?.role === "teacher"
                          ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                          : "bg-purple-500/10 border-purple-500/30 text-purple-400"
                      } uppercase tracking-wider font-medium`}
                    >
                      {data?.user?.role}
                    </span>
                  </>
                )}
              </h2>

              <div className="flex flex-col gap-1 text-gray-400 text-sm">
                <div className="flex items-center gap-2">
                  <Mail size={14} />
                  {isLoading ? (
                    <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
                  ) : (
                    data?.user?.email
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  {isLoading ? (
                    <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
                  ) : (
                    `Joined ${new Date(
                      data?.user?.joinedAt
                    ).toLocaleDateString()}`
                  )}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-red-400 gap-2">
              <AlertCircle size={48} />
              <p>Failed to load user details</p>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard
                  icon={<BookOpen className="text-blue-400" size={20} />}
                  label="Enrolled"
                  value={data?.stats?.enrolledCount}
                  subtext="Active Courses"
                  color="bg-blue-500/10 border-blue-500/20"
                />
                <StatCard
                  icon={<CheckCircle className="text-green-400" size={20} />}
                  label="Completed"
                  value={data?.stats?.completedCount}
                  subtext="Courses Finished"
                  color="bg-green-500/10 border-green-500/20"
                />
                <StatCard
                  icon={<XCircle className="text-red-400" size={20} />}
                  label="Failed"
                  value={data?.stats?.failedCount}
                  subtext="Courses Failed"
                  color="bg-red-500/10 border-red-500/20"
                />
                <StatCard
                  icon={<DollarSign className="text-yellow-400" size={20} />}
                  label="Total Paid"
                  value={`$${data?.stats?.totalPaid}`}
                  subtext="Lifetime Value"
                  color="bg-yellow-500/10 border-yellow-500/20"
                />
                <StatCard
                  icon={<Award className="text-purple-400" size={20} />}
                  label="Avg. Score"
                  value={`${data?.stats?.averageQuizScore}%`}
                  subtext="Quiz Performance"
                  color="bg-purple-500/10 border-purple-500/20"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Courses Section */}
                <div className="lg:col-span-1 space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <GraduationCap size={20} className="text-purple-400" />
                    Enrolled Courses
                  </h3>
                  <div className="bg-[#252525] rounded-xl border border-white/5 overflow-hidden">
                    {data?.courses?.enrolled?.length > 0 ? (
                      <div className="divide-y divide-white/5">
                        {data.courses.enrolled.map((course: any) => (
                          <div
                            key={course.id}
                            className="p-4 hover:bg-white/5 transition-colors"
                          >
                            <div className="font-medium text-white mb-1">
                              {course.title}
                            </div>
                            <div className="flex justify-between items-center text-sm text-gray-400">
                              <span>{course.price}</span>
                              <span className="text-blue-400">In Progress</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        No active enrollments
                      </div>
                    )}
                  </div>

                  {/* Completed/Failed Summary */}
                  {(data?.courses?.completed?.length > 0 ||
                    data?.courses?.failed?.length > 0) && (
                    <div className="space-y-4 mt-6">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Clock size={20} className="text-gray-400" />
                        History
                      </h3>
                      <div className="bg-[#252525] rounded-xl border border-white/5 overflow-hidden p-4 space-y-2">
                        {data?.courses?.completed?.map((c: any) => (
                          <div
                            key={c.id}
                            className="flex items-center gap-2 text-sm"
                          >
                            <CheckCircle size={14} className="text-green-500" />
                            <span className="text-gray-300 truncate">
                              {c.title}
                            </span>
                          </div>
                        ))}
                        {data?.courses?.failed?.map((c: any) => (
                          <div
                            key={c.id}
                            className="flex items-center gap-2 text-sm"
                          >
                            <XCircle size={14} className="text-red-500" />
                            <span className="text-gray-300 truncate">
                              {c.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Quizzes Section */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Award size={20} className="text-purple-400" />
                    Quiz Performance
                  </h3>
                  <div className="bg-[#252525] rounded-xl border border-white/5 overflow-hidden">
                    {data?.quizzes?.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-white/5 text-gray-400 font-medium">
                            <tr>
                              <th className="p-4">Quiz Title</th>
                              <th className="p-4">Course</th>
                              <th className="p-4">Date</th>
                              <th className="p-4 text-right">Score</th>
                              <th className="p-4 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {data.quizzes.map((quiz: any) => (
                              <tr
                                key={quiz.id}
                                className="hover:bg-white/5 transition-colors"
                              >
                                <td className="p-4 font-medium text-white">
                                  {quiz.title}
                                </td>
                                <td className="p-4 text-gray-400">
                                  {quiz.courseName}
                                </td>
                                <td className="p-4 text-gray-400">
                                  {quiz.submittedAt
                                    ? new Date(
                                        quiz.submittedAt
                                      ).toLocaleDateString()
                                    : "-"}
                                </td>
                                <td className="p-4 text-right">
                                  <div className="flex flex-col items-end">
                                    <span
                                      className={`font-bold ${
                                        quiz.percentage >= 80
                                          ? "text-green-400"
                                          : quiz.percentage >= 60
                                          ? "text-yellow-400"
                                          : "text-red-400"
                                      }`}
                                    >
                                      {quiz.score}/{quiz.maxPoints}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {quiz.percentage.toFixed(0)}%
                                    </span>
                                  </div>
                                </td>
                                <td className="p-4 text-center">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      quiz.status === "Completed"
                                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                        : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                                    }`}
                                  >
                                    {quiz.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-3">
                        <Award size={40} className="opacity-20" />
                        <p>No quiz attempts found</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, subtext, color }: any) => (
  <div className={`p-4 rounded-xl border ${color} flex flex-col gap-1`}>
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <span className="text-gray-400 text-sm font-medium">{label}</span>
    </div>
    <div className="text-2xl font-bold text-white">{value}</div>
    <div className="text-xs text-gray-500">{subtext}</div>
  </div>
);

export default UserDetailsModal;
