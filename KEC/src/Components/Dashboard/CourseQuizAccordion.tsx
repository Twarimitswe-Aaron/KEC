import React, { useState, useMemo } from "react";
import { useGetUserQuery } from "../../state/api/authApi";
import { useGetStudentQuizAttemptsQuery } from "../../state/api/courseActivitiesApi";
import { useGetStudentCoursesQuery } from "../../state/api/courseApi";
import { format } from "date-fns";
import {
  ChevronDown,
  ChevronUp,
  Ellipsis,
  Calendar,
  Award,
  Users,
} from "lucide-react";

interface CourseWithAttempts {
  courseId: number;
  courseTitle: string;
  instructorEmail: string;
  attempts: any[];
}

const CourseQuizAccordion: React.FC = () => {
  const { data: user } = useGetUserQuery();
  const studentId = user?.id;

  const { data: attempts = [], isLoading: attemptsLoading } =
    useGetStudentQuizAttemptsQuery(
      { studentId: studentId || 0 },
      { skip: !studentId }
    );

  const { data: studentCourses = [], isLoading: coursesLoading } =
    useGetStudentCoursesQuery();

  const [expandedCourses, setExpandedCourses] = useState<Set<number>>(
    new Set()
  );
  const [expandedLessons, setExpandedLessons] = useState<Set<number>>(
    new Set()
  );
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Group attempts by course
  const coursesWithAttempts = useMemo(() => {
    const courseMap = new Map<number, CourseWithAttempts>();

    // First, create entries for all enrolled courses
    studentCourses
      .filter((c: any) => c.enrolled)
      .forEach((course: any) => {
        courseMap.set(course.id, {
          courseId: course.id,
          courseTitle: course.title,
          instructorEmail: course.uploader?.email || "",
          attempts: [],
        });
      });

    // Then, add attempts to their respective courses
    attempts.forEach((attempt) => {
      if (courseMap.has(attempt.courseId)) {
        courseMap.get(attempt.courseId)!.attempts.push(attempt);
      }
    });

    return Array.from(courseMap.values());
  }, [attempts, studentCourses]);

  // Filter and sort attempts within each course
  const processedCourses = useMemo(() => {
    return coursesWithAttempts.map((course) => {
      let filteredAttempts = [...course.attempts];

      // Filter
      if (filterType !== "all") {
        filteredAttempts = filteredAttempts.filter((a) => {
          if (filterType === "quiz") return a.quizType === "online";
          if (filterType === "assignment") return a.isManual;
          return true;
        });
      }

      // Sort
      filteredAttempts.sort((a, b) => {
        if (sortBy === "newest") {
          return (
            new Date(b.submittedAt).getTime() -
            new Date(a.submittedAt).getTime()
          );
        }
        if (sortBy === "oldest") {
          return (
            new Date(a.submittedAt).getTime() -
            new Date(b.submittedAt).getTime()
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

      return { ...course, attempts: filteredAttempts };
    });
  }, [coursesWithAttempts, filterType, sortBy]);

  // Group attempts by lesson within each course
  const groupAttemptsByLesson = (courseAttempts: any[]) => {
    const lessonMap = new Map<
      number,
      { lessonTitle: string; attempts: any[] }
    >();

    courseAttempts.forEach((attempt) => {
      if (!lessonMap.has(attempt.lessonId)) {
        lessonMap.set(attempt.lessonId, {
          lessonTitle: attempt.lessonTitle,
          attempts: [],
        });
      }
      lessonMap.get(attempt.lessonId)!.attempts.push(attempt);
    });

    return Array.from(lessonMap.entries());
  };

  const toggleCourse = (courseId: number) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
    } else {
      newExpanded.add(courseId);
    }
    setExpandedCourses(newExpanded);
  };

  const toggleLesson = (lessonId: number) => {
    const newExpanded = new Set(expandedLessons);
    if (newExpanded.has(lessonId)) {
      newExpanded.delete(lessonId);
    } else {
      newExpanded.add(lessonId);
    }
    setExpandedLessons(newExpanded);
  };

  if (attemptsLoading || coursesLoading) {
    return (
      <div className="p-8 text-center text-gray-500">Loading courses...</div>
    );
  }

  if (!studentId) {
    return null;
  }

  const totalResults = processedCourses.reduce(
    (sum, course) => sum + course.attempts.length,
    0
  );

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
                  className="h-4 w-4 text-gray-500"
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
              {totalResults} result{totalResults !== 1 && "s"} found
            </div>
          </div>
        </div>
      </div>

      {/* Course Accordion */}
      <div className="space-y-6">
        {processedCourses.map((course) => {
          const isExpanded = expandedCourses.has(course.courseId);
          const lessonGroups = groupAttemptsByLesson(course.attempts);

          return (
            <div
              key={course.courseId}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden transition-all duration-300 hover:shadow-2xl"
            >
              {/* Course Header */}
              <div
                className="p-6 cursor-pointer hover:bg-gray-100 transition-all duration-300 border-b border-gray-200/50"
                onClick={() => toggleCourse(course.courseId)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        {course.courseTitle}
                      </h3>
                    </div>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {course.instructorEmail}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <button
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Course options"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Ellipsis className="h-4 w-4" />
                      </button>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* Lesson Groups (Expanded) */}
              {isExpanded && lessonGroups.length > 0 && (
                <div className="bg-gray-50/50 backdrop-blur-sm">
                  <div className="p-4 space-y-4">
                    {lessonGroups.map(([lessonId, lessonData]) => {
                      const isLessonExpanded = expandedLessons.has(lessonId);

                      return (
                        <div
                          key={lessonId}
                          className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 overflow-hidden transition-all duration-300 hover:shadow-xl"
                        >
                          {/* Lesson Header */}
                          <div
                            className="p-4 cursor-pointer hover:bg-gray-100 transition-all duration-300 flex justify-between items-center"
                            onClick={() => toggleLesson(lessonId)}
                          >
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-900">
                                {lessonData.lessonTitle}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {lessonData.attempts.length} test
                                {lessonData.attempts.length !== 1 && "s"}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="relative">
                                <button
                                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                  aria-label="Lesson options"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Ellipsis className="h-4 w-4" />
                                </button>
                              </div>
                              {isLessonExpanded ? (
                                <ChevronUp className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                          </div>

                          {/* Quiz Attempts (Expanded) */}
                          {isLessonExpanded && (
                            <div className="bg-gray-50/30 p-4 border-t border-gray-100">
                              <div className="space-y-3">
                                {lessonData.attempts.map((attempt) => (
                                  <div
                                    key={attempt.id}
                                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                          <h5 className="text-base font-semibold text-gray-900">
                                            {attempt.quizTitle}
                                          </h5>
                                          <span
                                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                              attempt.isManual
                                                ? "bg-purple-100 text-purple-800"
                                                : "bg-blue-100 text-blue-800"
                                            }`}
                                          >
                                            {attempt.isManual
                                              ? "Assignment"
                                              : "Quiz"}
                                          </span>
                                        </div>
                                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                                          <span className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {format(
                                              new Date(attempt.submittedAt),
                                              "MMM d, yyyy"
                                            )}
                                          </span>
                                          <span className="flex items-center gap-1">
                                            <Award className="h-4 w-4" />
                                            Score: {attempt.score} /{" "}
                                            {attempt.totalPoints} (
                                            {attempt.percentage.toFixed(1)}%)
                                          </span>
                                        </div>
                                        {attempt.feedback && (
                                          <div className="mt-2 text-sm text-gray-600 italic">
                                            Feedback: {attempt.feedback}
                                          </div>
                                        )}
                                      </div>
                                      {attempt.marksFileUrl && (
                                        <a
                                          href={attempt.marksFileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:text-blue-800 text-sm font-medium ml-4"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          View Marks
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {isExpanded && lessonGroups.length === 0 && (
                <div className="bg-gray-50/50 p-8 text-center text-gray-500">
                  No quiz attempts found for this course.
                </div>
              )}
            </div>
          );
        })}

        {/* No Courses State */}
        {processedCourses.length === 0 && (
          <div className="text-center py-12 bg-white/50 rounded-2xl border border-gray-200">
            <p className="text-gray-500">
              You are not enrolled in any courses yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseQuizAccordion;
