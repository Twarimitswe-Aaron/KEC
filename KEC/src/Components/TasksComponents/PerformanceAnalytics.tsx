import React from "react";
import {
  Users,
  BarChart3,
  TrendingUp,
  FileText,
  BookOpen,
  Award,
  AlertTriangle,
  X,
} from "lucide-react";
import { CourseAnalytics } from "../../state/api/quizApi";

interface PerformanceAnalyticsProps {
  selectedQuiz?: string | null;
  selectedCourse?: any;
  course?: any; // For modal usage
  courseAnalytics?: CourseAnalytics;
  analyticsLoading: boolean;
  getGradeColor: (percentage: number) => string;
  getLetterGrade: (percentage: number) => string;
  isOpen?: boolean; // For modal functionality
  onClose?: () => void; // For modal functionality
}

const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({
  selectedQuiz,
  selectedCourse,
  course,
  courseAnalytics,
  analyticsLoading,
  getGradeColor,
  getLetterGrade,
  isOpen,
  onClose,
}) => {
  // Use course prop for modal mode, selectedCourse for regular mode
  const currentCourse = course || selectedCourse;

  // For modal mode, always show if isOpen is true (even without data)
  // For regular mode, show if selectedQuiz and selectedCourse exist
  if (isOpen !== undefined) {
    // Modal mode
    if (!isOpen) {
      return null;
    }
  } else {
    // Regular mode
    if (!selectedQuiz || !selectedCourse) {
      return null;
    }
  }

  if (analyticsLoading) {
    const loadingContent = (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading analytics...</span>
      </div>
    );

    // Return loading in modal if modal mode
    if (isOpen && onClose) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/50 max-w-7xl w-full max-h-[90vh] overflow-y-auto m-4">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                  Course Analytics - {currentCourse?.name || "Loading..."}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6">{loadingContent}</div>
          </div>
        </div>
      );
    }

    return loadingContent;
  }

  // Show analytics content for both modal mode and regular mode (always show for modal)
  if (isOpen || (selectedQuiz === "course-analytics" && courseAnalytics)) {
    const content = (
      <div className="space-y-6 mt-8">
        {/* Course Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-xl p-4 hover:shadow-lg transition-all duration-300 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Total Students
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {courseAnalytics?.totalStudents || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-xl p-4 hover:shadow-lg transition-all duration-300 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Average Performance
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {courseAnalytics?.courseAverage?.toFixed(1) || "0.0"}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-xl p-4 hover:shadow-lg transition-all duration-300 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Students at Risk
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {courseAnalytics?.studentsAtRisk || 0}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-xl p-4 hover:shadow-lg transition-all duration-300 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Completion Rate
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {courseAnalytics?.completionRate?.toFixed(1) || "0.0"}%
                </p>
              </div>
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* All Students Enrollment & Performance Table */}
        <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h5 className="font-semibold text-gray-900 flex items-center gap-2 text-lg">
              <Users className="h-6 w-6 text-blue-600" />
              Enrolled Students Performance
            </h5>
            <p className="text-gray-600 text-sm mt-1">
              All enrolled students with their marks, progress, and performance
              details
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    #
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Student Name
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Total Marks
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Grade
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {courseAnalytics?.topPerformingStudents?.length ? (
                  courseAnalytics.topPerformingStudents.map(
                    (student, index) => (
                      <tr
                        key={student.studentId}
                        className="hover:bg-white transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-900">
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full border border-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {student.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {student.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                Student ID: {student.studentId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="text-sm text-gray-900">
                            {student.email || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-lg font-bold text-gray-900">
                              {Math.round(
                                (student.overallAverage *
                                  student.totalAssignments) /
                                  100
                              )}
                            </span>
                            <span className="text-xs text-gray-500">
                              / {student.totalAssignments * 100} pts
                            </span>
                            <span className="text-xs text-gray-500 mt-1">
                              {student.overallAverage.toFixed(1)}% avg
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-bold ${
                              student.letterGrade === "A" ||
                              student.letterGrade === "A+"
                                ? "bg-green-100 text-green-800"
                                : student.letterGrade === "B" ||
                                  student.letterGrade === "B+"
                                ? "bg-blue-100 text-blue-800"
                                : student.letterGrade === "C" ||
                                  student.letterGrade === "C+"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {student.letterGrade}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {student.overallAverage >= 85 ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Excellent
                            </span>
                          ) : student.overallAverage >= 70 ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Good
                            </span>
                          ) : student.overallAverage >= 60 ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Average
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              At Risk
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              onClick={() => {
                                // Handle view details
                                alert(`Viewing details for ${student.name}`);
                              }}
                            >
                              <FileText className="w-3 h-3 mr-1" />
                              View Details
                            </button>
                            <button
                              className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              onClick={() => {
                                // Handle view progress
                                alert(`Viewing progress for ${student.name}`);
                              }}
                            >
                              <BarChart3 className="w-3 h-3 mr-1" />
                              Progress
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Users className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No Student Data Available
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Student enrollment and performance data will appear
                          here once available.
                        </p>
                        <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                          <Users className="w-4 h-4 mr-2" />
                          Refresh Data
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Summary */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-6">
                <span>
                  <span className="font-medium text-gray-600">
                    Total Students:
                  </span>
                  <span className="ml-2 font-bold">
                    {courseAnalytics?.totalStudents || 0}
                  </span>
                </span>
                <span>
                  <span className="font-medium text-gray-600">
                    Class Average:
                  </span>
                  <span className="ml-2 font-bold">
                    {courseAnalytics?.courseAverage?.toFixed(1) || 0}%
                  </span>
                </span>
                <span>
                  <span className="font-medium text-gray-600">At Risk:</span>
                  <span className="ml-2 font-bold text-red-600">
                    {courseAnalytics?.studentsAtRisk || 0}
                  </span>
                </span>
              </div>
              <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Export Student Data
              </button>
            </div>
          </div>
        </div>

        {/* Grade Distribution */}
        {courseAnalytics?.gradeDistribution && (
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-white/50 shadow-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Grade Distribution
            </h4>
            <div className="space-y-3">
              {Object.entries(courseAnalytics.gradeDistribution).map(
                ([grade, count]) => (
                  <div
                    key={grade}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 text-center font-bold text-lg">
                        {grade}
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-3 min-w-[200px]">
                        <div
                          className={`h-3 rounded-full transition-all duration-300 ${
                            grade === "A" || grade === "A+"
                              ? "bg-green-500"
                              : grade === "B" || grade === "B+"
                              ? "bg-blue-500"
                              : grade === "C" || grade === "C+"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{
                            width: `${Math.max(
                              (count / (courseAnalytics?.totalStudents || 1)) *
                                100,
                              2
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-8">
                        {count}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    );

    // Return content wrapped in modal if in modal mode
    if (isOpen && onClose) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/50 max-w-7xl w-full max-h-[90vh] overflow-y-auto m-4">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                  Course Analytics - {currentCourse?.name || "Unknown Course"}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">{content}</div>
          </div>
        </div>
      );
    }

    // Return regular content for non-modal mode
    return content;
  }

  if (selectedQuiz === "overall-performance" && courseAnalytics) {
    return (
      <div className="space-y-6 mt-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-lg">
          <h4 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-3">
            <BarChart3 className="h-7 w-7 text-blue-600" />
            Overall Performance Analytics
          </h4>
          <p className="text-gray-700 text-base">
            Comprehensive performance insights and trends across all course
            content for{" "}
            <span className="font-semibold">{selectedCourse.name}</span>
          </p>
        </div>

        {/* Key Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-xl p-4 hover:shadow-lg transition-all duration-300 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-sm font-medium text-gray-600 mb-1">
                  Total Students
                </h5>
                <span className="text-2xl font-bold text-gray-900">
                  {courseAnalytics?.totalStudents || 0}
                </span>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-xl p-4 hover:shadow-lg transition-all duration-300 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-sm font-medium text-gray-600 mb-1">
                  Average Performance
                </h5>
                <span className="text-2xl font-bold text-gray-900">
                  {courseAnalytics?.courseAverage?.toFixed(1) || "0.0"}%
                </span>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-xl p-4 hover:shadow-lg transition-all duration-300 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-sm font-medium text-gray-600 mb-1">
                  Completion Rate
                </h5>
                <span className="text-2xl font-bold text-gray-900">
                  {courseAnalytics?.completionRate?.toFixed(1) || "0.0"}%
                </span>
              </div>
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-xl p-4 hover:shadow-lg transition-all duration-300 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-sm font-medium text-gray-600 mb-1">
                  Students at Risk
                </h5>
                <span className="text-2xl font-bold text-gray-900">
                  {courseAnalytics?.studentsAtRisk || 0}
                </span>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Detailed Lesson Performance Matrix */}
        <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h5 className="font-semibold text-gray-900 flex items-center gap-2 text-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
              Lesson Performance Matrix
            </h5>
            <p className="text-gray-600 text-sm mt-1">
              Detailed performance breakdown by lesson and assignment type
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Lesson
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Assignments
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Avg Performance
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Completion Rate
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    At Risk
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {courseAnalytics?.lessonsAnalytics?.map((lesson) => (
                  <tr
                    key={lesson.lessonId}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {lesson.lessonTitle}
                      </div>
                      <div className="text-sm text-gray-500">
                        {lesson.assignmentCount} total assignments
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 font-medium">
                        {lesson.assignmentCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-bold ${getGradeColor(
                            lesson.averagePerformance
                          )}`}
                        >
                          {lesson.averagePerformance.toFixed(1)}%
                        </span>
                        <span className="text-xs text-gray-500">
                          {getLetterGrade(lesson.averagePerformance)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${lesson.completionRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {lesson.completionRate.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          lesson.studentsAtRisk > 0
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {lesson.studentsAtRisk}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        {lesson.averagePerformance >= 85 ? (
                          <TrendingUp className="h-5 w-5 text-green-500" />
                        ) : lesson.averagePerformance >= 70 ? (
                          <BarChart3 className="h-5 w-5 text-yellow-500" />
                        ) : (
                          <TrendingUp className="h-5 w-5 text-red-500 transform rotate-180" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Comprehensive Student Marks Table */}
        <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h5 className="font-semibold text-gray-900 flex items-center gap-2 text-lg">
              <Users className="h-6 w-6 text-blue-600" />
              All Student Marks & Performance
            </h5>
            <p className="text-gray-600 text-sm mt-1">
              Complete overview of all students with quiz marks, totals, and
              rankings
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Student Name
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Completed
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Total Score
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Average
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Grade
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {courseAnalytics?.topPerformingStudents?.map(
                  (student, index) => (
                    <tr
                      key={student.studentId}
                      className={`hover:bg-gray-50 transition-colors ${
                        index < 3 ? "bg-green-50" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              index === 0
                                ? "bg-yellow-500 text-white"
                                : index === 1
                                ? "bg-gray-400 text-white"
                                : index === 2
                                ? "bg-orange-500 text-white"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {index + 1}
                          </div>
                          {index < 3 && (
                            <Award className="ml-2 h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {student.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-sm text-gray-600">
                          {student.email || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-medium">
                          {student.assignmentsCompleted}/
                          {student.totalAssignments}
                        </span>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${
                                (student.assignmentsCompleted /
                                  student.totalAssignments) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-lg font-bold text-gray-900">
                          {Math.round(
                            (student.overallAverage *
                              student.totalAssignments) /
                              100
                          )}
                        </span>
                        <div className="text-xs text-gray-500">
                          / {student.totalAssignments * 100} pts
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-bold ${getGradeColor(
                            student.overallAverage
                          )}`}
                        >
                          {student.overallAverage.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-bold ${
                            student.letterGrade === "A" ||
                            student.letterGrade === "A+"
                              ? "bg-green-100 text-green-800"
                              : student.letterGrade === "B" ||
                                student.letterGrade === "B+"
                              ? "bg-blue-100 text-blue-800"
                              : student.letterGrade === "C" ||
                                student.letterGrade === "C+"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {student.letterGrade}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {student.overallAverage >= 90 ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Excellent
                          </span>
                        ) : student.overallAverage >= 80 ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Good
                          </span>
                        ) : student.overallAverage >= 70 ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Average
                          </span>
                        ) : student.overallAverage >= 60 ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Needs Improvement
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            At Risk
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* Table Summary */}
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">
                  Total Students:
                </span>
                <span className="ml-2 font-bold">
                  {courseAnalytics?.totalStudents || 0}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">
                  Class Average:
                </span>
                <span className="ml-2 font-bold">
                  {courseAnalytics.courseAverage?.toFixed(1) || 0}%
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">
                  Completion Rate:
                </span>
                <span className="ml-2 font-bold">
                  {courseAnalytics.completionRate?.toFixed(1) || 0}%
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">
                  Students at Risk:
                </span>
                <span className="ml-2 font-bold text-red-600">
                  {courseAnalytics?.studentsAtRisk || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performers & Improvement Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performers */}
          <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-xl shadow-lg">
            <div className="p-4 border-b border-gray-200">
              <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Top 5 Performers
              </h5>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {courseAnalytics?.topPerformingStudents
                  ?.slice(0, 5)
                  .map((student, index) => (
                    <div
                      key={student.studentId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0
                              ? "bg-yellow-100 text-yellow-800"
                              : index === 1
                              ? "bg-gray-100 text-gray-800"
                              : index === 2
                              ? "bg-orange-100 text-orange-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {student.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {student.assignmentsCompleted}/
                            {student.totalAssignments} completed
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          {student.overallAverage.toFixed(1)}%
                        </div>
                        <div className="text-xs font-medium text-gray-600">
                          {student.letterGrade}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-xl shadow-lg">
            <div className="p-4 border-b border-gray-200">
              <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Performance Insights
              </h5>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                  <h6 className="font-medium text-green-800 mb-1">
                    Strong Areas
                  </h6>
                  <p className="text-sm text-green-700">
                    {(() => {
                      const bestLesson =
                        courseAnalytics?.lessonsAnalytics?.reduce(
                          (best, current) =>
                            current.averagePerformance > best.averagePerformance
                              ? current
                              : best
                        );
                      if (bestLesson) {
                        const percentage =
                          bestLesson.averagePerformance.toFixed(1);
                        return `${bestLesson.lessonTitle} shows excellent performance (${percentage}%)`;
                      }
                      return "Overall performance is good";
                    })()}
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                  <h6 className="font-medium text-yellow-800 mb-1">
                    Areas for Improvement
                  </h6>
                  <p className="text-sm text-yellow-700">
                    {courseAnalytics.studentsAtRisk > 0
                      ? `${courseAnalytics.studentsAtRisk} students need additional support`
                      : "All students are performing well"}
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <h6 className="font-medium text-blue-800 mb-1">
                    Course Progress
                  </h6>
                  <p className="text-sm text-blue-700">
                    {courseAnalytics.completionRate
                      ? `${courseAnalytics.completionRate.toFixed(
                          1
                        )}% overall completion rate`
                      : "Course is progressing steadily"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PerformanceAnalytics;
