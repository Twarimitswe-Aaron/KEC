import React from "react";
import { 
  Users, 
  BarChart3, 
  FileSpreadsheet,
  FileIcon
} from "lucide-react";
import { CourseAnalytics } from "../../state/api/quizApi";

interface UnifiedCourseAnalyticsProps {
  course: any;
  courseAnalytics?: CourseAnalytics;
  analyticsLoading: boolean;
  getGradeColor: (percentage: number) => string;
  getLetterGrade: (percentage: number) => string;
  isOpen: boolean;
  onClose: () => void;
}

const UnifiedCourseAnalytics: React.FC<UnifiedCourseAnalyticsProps> = ({
  course,
  courseAnalytics,
  analyticsLoading,
  getGradeColor,
  getLetterGrade,
  isOpen,
  onClose
}) => {
  // Export functions
  const exportToPDF = () => {
    if (!courseAnalytics || !course) return;
    
    // Create a comprehensive report content
    const reportContent = generateReportContent();
    
    // For now, we'll create a download link with the data
    // In a real application, you'd use a library like jsPDF
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${course.name}-Performance-Report.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    if (!courseAnalytics || !course) return;
    
    // Generate CSV content for Excel compatibility
    const csvContent = generateCSVContent();
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${course.name}-Performance-Data.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateReportContent = () => {
    if (!courseAnalytics || !course) return '';
    
    return `
COURSE PERFORMANCE REPORT
========================

Course: ${course.name} (${course.code})
Instructor: ${course.instructor}
Semester: ${course.semester}
Generated: ${new Date().toLocaleDateString()}

TOTAL OVERVIEW
--------------
Total Students: ${courseAnalytics.totalStudents}
Average Performance: ${courseAnalytics.courseAverage.toFixed(1)}%
Completion Rate: ${courseAnalytics.completionRate?.toFixed(1) || 0}%
Students at Risk: ${courseAnalytics.studentsAtRisk}

GRADE DISTRIBUTION
------------------
${courseAnalytics.gradeDistribution ? 
  Object.entries(courseAnalytics.gradeDistribution)
    .map(([grade, count]) => `${grade}: ${count} students`)
    .join('\n') : 'No grade data available'}

LESSON PERFORMANCE
------------------
${courseAnalytics.lessonsAnalytics?.map(lesson => 
  `${lesson.lessonTitle}:
   - Assignments: ${lesson.assignmentCount}
   - Average Performance: ${lesson.averagePerformance.toFixed(1)}%
   - Completion Rate: ${lesson.completionRate.toFixed(1)}%
   - Students at Risk: ${lesson.studentsAtRisk}`
).join('\n\n') || 'No lesson data available'}

TOP PERFORMERS
--------------
${courseAnalytics.topPerformingStudents?.slice(0, 5)
  .map((student, index) => 
    `${index + 1}. ${student.name} - ${student.overallAverage.toFixed(1)}% (${student.letterGrade})`
  ).join('\n') || 'No student performance data available'}

ASSIGNMENT TYPE BREAKDOWN
-------------------------
${courseAnalytics.assignmentTypeBreakdown?.map(typeStats => 
  `${typeStats.type.toUpperCase()}:
   - Count: ${typeStats.count}
   - Average Score: ${typeStats.averageScore.toFixed(1)}%
   - Completion Rate: ${typeStats.completionRate.toFixed(1)}%`
).join('\n\n') || 'No assignment type data available'}
    `.trim();
  };

  const generateCSVContent = () => {
    if (!courseAnalytics || !course) return '';
    
    let csv = 'Course Performance Data\n\n';
    
    // Course Info
    csv += 'Course Information\n';
    csv += 'Field,Value\n';
    csv += `Course Name,${course.name}\n`;
    csv += `Course Code,${course.code}\n`;
    csv += `Instructor,${course.instructor}\n`;
    csv += `Semester,${course.semester}\n`;
    csv += `Generated Date,${new Date().toLocaleDateString()}\n\n`;
    
    // Overview Stats
    csv += 'Overview Statistics\n';
    csv += 'Metric,Value\n';
    csv += `Total Students,${courseAnalytics.totalStudents}\n`;
    csv += `Average Performance,${courseAnalytics.courseAverage.toFixed(1)}%\n`;
    csv += `Completion Rate,${courseAnalytics.completionRate?.toFixed(1) || 0}%\n`;
    csv += `Students at Risk,${courseAnalytics.studentsAtRisk}\n\n`;
    
    // Lesson Performance
    if (courseAnalytics.lessonsAnalytics?.length) {
      csv += 'Lesson Performance\n';
      csv += 'Lesson Title,Assignment Count,Average Performance,Completion Rate,Students at Risk\n';
      courseAnalytics.lessonsAnalytics.forEach(lesson => {
        csv += `"${lesson.lessonTitle}",${lesson.assignmentCount},${lesson.averagePerformance.toFixed(1)}%,${lesson.completionRate.toFixed(1)}%,${lesson.studentsAtRisk}\n`;
      });
      csv += '\n';
    }
    
    // Top Performers
    if (courseAnalytics.topPerformingStudents?.length) {
      csv += 'Top Performing Students\n';
      csv += 'Rank,Student Name,Overall Average,Letter Grade,Assignments Completed,Total Assignments\n';
      courseAnalytics.topPerformingStudents.slice(0, 10).forEach((student, index) => {
        csv += `${index + 1},"${student.name}",${student.overallAverage.toFixed(1)}%,${student.letterGrade},${student.assignmentsCompleted},${student.totalAssignments}\n`;
      });
      csv += '\n';
    }
    
    // Grade Distribution
    if (courseAnalytics.gradeDistribution) {
      csv += 'Grade Distribution\n';
      csv += 'Grade,Student Count\n';
      Object.entries(courseAnalytics.gradeDistribution).forEach(([grade, count]) => {
        csv += `${grade},${count}\n`;
      });
    }
    
    return csv;
  };
  if (!isOpen) return null;

  if (analyticsLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading course analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  // Always show the modal layout, handle missing data in sections

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">{course.name} - Analytics</h2>
              <p className="text-blue-100">Performance insights</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-blue-100">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {course.instructor}
                </span>
                <span>{course.semester}</span>
                <span>{course.code}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Key Stats - Simplified */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{courseAnalytics?.totalStudents || 0}</div>
              <div className="text-sm text-blue-800">Students</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{courseAnalytics?.courseAverage?.toFixed(1) || '0.0'}%</div>
              <div className="text-sm text-green-800">Average</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">{courseAnalytics?.completionRate?.toFixed(1) || 0}%</div>
              <div className="text-sm text-yellow-800">Completed</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{courseAnalytics?.studentsAtRisk || 0}</div>
              <div className="text-sm text-red-800">At Risk</div>
            </div>
          </div>

          {/* Main Content - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Grades & Top Students */}
            <div className="space-y-6">
              {/* Grade Distribution - Simplified */}
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-semibold text-gray-900 mb-3">Grades</h4>
                <div className="space-y-2">
                  {courseAnalytics?.gradeDistribution ? (
                    Object.entries(courseAnalytics.gradeDistribution).map(([grade, count]) => (
                      <div key={grade} className="flex items-center justify-between">
                        <span className="font-medium">{grade}</span>
                        <span className="text-sm bg-gray-100 px-2 py-1 rounded">{count} students</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 text-center py-4">
                      Grade data will appear here when available
                    </div>
                  )}
                </div>
              </div>

              {/* Top Students - Simplified */}
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-semibold text-gray-900 mb-3">Top Students</h4>
                <div className="space-y-2">
                  {courseAnalytics?.topPerformingStudents?.length ? (
                    courseAnalytics.topPerformingStudents.slice(0, 3).map((student, index) => (
                      <div key={student.studentId} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center justify-center font-medium">
                            {index + 1}
                          </span>
                          <span className="text-sm">{student.name}</span>
                        </div>
                        <span className="text-sm font-medium text-green-600">{student.overallAverage.toFixed(1)}%</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 text-center py-4">
                      Top students will appear here when data is available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Lessons Performance */}
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-900 mb-3">Lesson Performance</h4>
              <div className="space-y-3">
                {courseAnalytics?.lessonsAnalytics?.length ? (
                  courseAnalytics.lessonsAnalytics.map((lesson) => (
                    <div key={lesson.lessonId} className="border-l-4 border-blue-200 pl-3 py-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{lesson.lessonTitle}</div>
                          <div className="text-xs text-gray-500">{lesson.assignmentCount} assignments</div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-bold ${
                            lesson.averagePerformance >= 85 ? 'text-green-600' :
                            lesson.averagePerformance >= 70 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {lesson.averagePerformance.toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-500">{lesson.completionRate.toFixed(1)}% done</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 text-center py-4">
                    Lesson performance data will appear here when available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Insights */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
            <h4 className="font-semibold text-gray-900 mb-2">Quick Insights</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="text-green-700">
                ✓ {(() => {
                  const bestLesson = courseAnalytics?.lessonsAnalytics?.reduce((best, current) => 
                    current.averagePerformance > best.averagePerformance ? current : best
                  );
                  return bestLesson ? `${bestLesson.lessonTitle} performing best` : 'Good overall performance';
                })()}
              </div>
              <div className="text-yellow-700">
                ⚠ {(courseAnalytics?.studentsAtRisk || 0) > 0 
                  ? `${courseAnalytics?.studentsAtRisk || 0} students need support`
                  : 'All students on track'
                }
              </div>
              <div className="text-blue-700">
                ℹ {courseAnalytics?.completionRate?.toFixed(0) || 0}% completion rate
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 p-4 rounded-b-xl border-t border-gray-200">
          <div className="flex justify-between items-center">
            {/* Export Options */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Export Report:</span>
              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                <FileIcon className="h-4 w-4" />
                PDF
              </button>
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Excel
              </button>
            </div>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedCourseAnalytics;
