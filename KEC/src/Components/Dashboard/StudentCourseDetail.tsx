import React, { useState, useMemo } from "react";
import { useGetUserQuery } from "../../state/api/authApi";
import { useGetStudentQuizAttemptsQuery } from "../../state/api/courseActivitiesApi";
import { format } from "date-fns";

interface StudentCourseDetailProps {
  courseId?: string;
}

const StudentCourseDetail: React.FC<StudentCourseDetailProps> = ({
  courseId,
}) => {
  const { data: user } = useGetUserQuery();
  const studentId = user?.id;

  const { data: attempts = [], isLoading } = useGetStudentQuizAttemptsQuery(
    { studentId: studentId || 0, courseId },
    { skip: !studentId }
  );

  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const filteredAttempts = useMemo(() => {
    let result = [...attempts];

    // Filter
    if (filterType !== "all") {
      result = result.filter((a) => {
        if (filterType === "quiz") return a.quizType === "online";
        if (filterType === "assignment") return a.isManual;
        return true;
      });
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "newest") {
        return (
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        );
      }
      if (sortBy === "oldest") {
        return (
          new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
        );
      }
      if (sortBy === "score-high") {
        return b.percentage - a.percentage;
      }
      if (sortBy === "score-low") {
        return a.percentage - b.percentage;
      }
      return 0;
    });

    return result;
  }, [attempts, filterType, sortBy]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">Loading details...</div>
    );
  }

  if (!studentId) {
    return null;
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      {/* Filter Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 mb-6">
        <div className="p-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-funnel h-4 w-4 text-gray-500"
                  aria-hidden="true"
                >
                  <path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z"></path>
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  Filter:
                </span>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="assignment">Assignments</option>
                  <option value="quiz">Quizzes</option>
                </select>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">
                  Sort by:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="score-high">Highest Score</option>
                  <option value="score-low">Lowest Score</option>
                </select>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {filteredAttempts.length} result
              {filteredAttempts.length !== 1 && "s"} found
            </div>
          </div>
        </div>
      </div>

      {/* List Items */}
      <div className="space-y-6">
        {filteredAttempts.map((attempt) => (
          <div
            key={attempt.id}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden transition-all duration-300 hover:shadow-2xl"
          >
            <div className="p-6 cursor-pointer hover:bg-gray-100 transition-all duration-300 border-b border-gray-200/50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-xl font-bold text-gray-900">
                      {attempt.quizTitle}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        attempt.isManual
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {attempt.isManual ? "Assignment" : "Quiz"}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-calendar h-4 w-4"
                        aria-hidden="true"
                      >
                        <rect
                          width="18"
                          height="18"
                          x="3"
                          y="4"
                          rx="2"
                          ry="2"
                        />
                        <line x1="16" x2="16" y1="2" y2="6" />
                        <line x1="8" x2="8" y1="2" y2="6" />
                        <line x1="3" x2="21" y1="10" y2="10" />
                      </svg>
                      {format(new Date(attempt.submittedAt), "MMM d, yyyy")}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-award h-4 w-4"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="8" r="7" />
                        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                      </svg>
                      Score: {attempt.score} / {attempt.totalPoints} (
                      {attempt.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>

                {/* Action / Expand Button (Placeholder for now) */}
                <div className="flex items-center space-x-2">
                  {attempt.marksFileUrl && (
                    <a
                      href={attempt.marksFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Marks
                    </a>
                  )}
                  <div className="relative">
                    <button
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      aria-label="Options"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-ellipsis h-4 w-4"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="19" cy="12" r="1"></circle>
                        <circle cx="5" cy="12" r="1"></circle>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Feedback Section (if available) */}
            {attempt.feedback && (
              <div className="bg-gray-50/50 backdrop-blur-sm p-4 border-t border-gray-100">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-white/50 p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">
                    Feedback
                  </h4>
                  <p className="text-sm text-gray-600">{attempt.feedback}</p>
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredAttempts.length === 0 && (
          <div className="text-center py-12 bg-white/50 rounded-2xl border border-gray-200">
            <p className="text-gray-500">
              No results found matching your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCourseDetail;
