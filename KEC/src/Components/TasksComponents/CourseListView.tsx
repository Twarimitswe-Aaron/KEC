import React from "react";
import { 
  BookOpen, 
  MoreHorizontal, 
  ChevronDown, 
  ChevronUp,
  Users,
  BarChart3,
  FileText
} from "lucide-react";
import { MdAssignmentAdd } from "react-icons/md";

interface CourseListViewProps {
  filteredData: any[];
  expandedCourses: Record<number, boolean>;
  expandedLessons: Record<string, boolean>;
  searchQuery: string;
  toggleCourseAccordion: (courseId: number, event?: React.MouseEvent) => void;
  toggleLessonAccordion: (lessonId: number, event?: React.MouseEvent) => void;
  handleCreateQuiz: (course: any, lessonId?: number, lessonTitle?: string, quizType?: string) => void;
  onQuizSelect: (course: any, lesson: any, quiz: any) => void;
  onCoursePerformanceSelect: (course: any) => void;
  toggleCourseMenu: (courseId: number) => void;
  courseMenus: Record<number, boolean>;
  getGradeColor: (percentage: number) => string;
  getLetterGrade: (percentage: number) => string;
  calculateLessonTotalScore: (lesson: any) => number;
  calculateLessonTotalMaxPoints: (lesson: any) => number;
}

const CourseListView: React.FC<CourseListViewProps> = ({
  filteredData,
  expandedCourses,
  expandedLessons,
  searchQuery,
  toggleCourseAccordion,
  toggleLessonAccordion,
  handleCreateQuiz,
  onQuizSelect,
  onCoursePerformanceSelect,
  toggleCourseMenu,
  courseMenus,
  getGradeColor,
  getLetterGrade,
  calculateLessonTotalScore,
  calculateLessonTotalMaxPoints
}) => {
  return (
    <>
      {filteredData.map((course: any) => {
        const isCourseExpanded = expandedCourses[course.id];
        return (
          <div key={course.id} className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
            {/* Course Header */}
            <div 
              className="p-6 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100" 
              onClick={(e) => toggleCourseAccordion(course.id, e)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-xl font-bold text-gray-900">{course.name}</h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {course.code}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {course.instructor}
                    </span>
                    <span>{course.semester}</span>
                    <span>{course.credits} Credits</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {/* Course Three Dots Menu */}
                  <div className="relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCourseMenu(course.id);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      aria-label="Course options"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    
                    {/* Course Dropdown Menu */}
                    {courseMenus[course.id] && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-30">
                        <div className="py-0.5">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onCoursePerformanceSelect(course);
                            }}
                            className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <BarChart3 className="mr-2 h-4 w-4 text-blue-600" />
                            <div>
                              <div className="font-medium text-sm">Analytics</div>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {isCourseExpanded ? 
                    <ChevronUp className="h-5 w-5 text-gray-500" /> : 
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  }
                </div>
              </div>
            </div>

            {/* Lessons Accordion */}
            {isCourseExpanded && (
              <div className="bg-gray-50">
                {course.lessons && course.lessons.length > 0 ? (
                  <div className="p-4 space-y-4">
                    {course.lessons.map((lesson: any) => {
                      const isLessonExpanded = expandedLessons[lesson.id.toString()];
                      return (
                        <div key={lesson.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                          {/* Lesson Header */}
                          <div 
                            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors flex justify-between items-center"
                            onClick={(e) => toggleLessonAccordion(lesson.id, e)}
                          >
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-900">{lesson.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {/* Three Dots Menu */}
                              <div className="relative">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleLessonAccordion(lesson.id);
                                  }}
                                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                  aria-label="Lesson options"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </button>
                                
                                {/* Dropdown Menu */}
                                {expandedLessons[`menu_${lesson.id}`] && (
                                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                                    <div className="py-1">
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCreateQuiz(course, lesson.id, lesson.title, 'assignment');
                                        }}
                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                      >
                                        <MdAssignmentAdd className="mr-2 h-4 w-4" />
                                        Create Assignment
                                      </button>
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCreateQuiz(course, lesson.id, lesson.title, 'quiz');
                                        }}
                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                      >
                                        <FileText className="mr-2 h-4 w-4" />
                                        Create Quiz
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {isLessonExpanded ? 
                                <ChevronUp className="h-4 w-4 text-gray-500" /> : 
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              }
                            </div>
                          </div>

                          {/* Lesson Content (Quizzes) */}
                          {isLessonExpanded && (
                            <div className="border-t border-gray-200 bg-gray-50 p-4">
                              {lesson.quizzes && lesson.quizzes.length > 0 ? (
                                <div className="bg-white rounded-md shadow-sm overflow-hidden">
                                  {/* Quizzes Table Header */}
                                  <div className="p-3 border-b border-gray-200 bg-gray-50">
                                    <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-700">
                                      <div className="col-span-4">Quiz Title</div>
                                      <div className="col-span-2 text-center">Type</div>
                                      <div className="col-span-2 text-center">Due Date</div>
                                      <div className="col-span-2 text-center">Max Points</div>
                                      <div className="col-span-2 text-center">Actions</div>
                                    </div>
                                  </div>
                                  
                                  {/* Quiz Rows */}
                                  <div className="divide-y divide-gray-200">
                                    {lesson.quizzes.map((quiz: any) => (
                                      <div key={quiz.id} className="p-3 hover:bg-gray-50 transition-colors">
                                        <div className="grid grid-cols-12 gap-2 items-center text-sm">
                                          <div className="col-span-4 font-medium text-gray-900">{quiz.title}</div>
                                          <div className="col-span-2 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${
                                              quiz.type === 'exam' ? 'bg-red-100 text-red-800' :
                                              quiz.type === 'project' ? 'bg-purple-100 text-purple-800' :
                                              quiz.type === 'lab' ? 'bg-blue-100 text-blue-800' :
                                              quiz.type === 'quiz' ? 'bg-yellow-100 text-yellow-800' :
                                              'bg-gray-100 text-gray-800'
                                            }`}>
                                              {quiz.type}
                                            </span>
                                          </div>
                                          <div className="col-span-2 text-center text-gray-600 text-xs">{quiz.dueDate}</div>
                                          <div className="col-span-2 text-center font-medium">{quiz.maxPoints}</div>
                                          <div className="col-span-2 text-center">
                                            <button 
                                              onClick={() => onQuizSelect(course, lesson, quiz)}
                                              className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 transition-colors"
                                            >
                                              View Details
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  
                                  {/* Lesson Summary */}
                                  <div className="p-3 bg-gray-50 border-t border-gray-200">
                                    <div className="flex justify-between items-center text-sm">
                                      <span className="font-medium text-gray-700">Lesson Total:</span>
                                      <div className="flex items-center space-x-2">
                                        <span className="font-bold">{calculateLessonTotalScore(lesson)} / {calculateLessonTotalMaxPoints(lesson)}</span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                          getGradeColor((calculateLessonTotalScore(lesson) / calculateLessonTotalMaxPoints(lesson)) * 100)
                                        }`}>
                                          {((calculateLessonTotalScore(lesson) / calculateLessonTotalMaxPoints(lesson)) * 100).toFixed(1)}%
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-white rounded-md shadow-sm">
                                  {/* Quizzes Table Header */}
                                  <div className="p-3 border-b border-gray-200 bg-gray-50">
                                    <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-700">
                                      <div className="col-span-4">Quiz Title</div>
                                      <div className="col-span-2 text-center">Type</div>
                                      <div className="col-span-2 text-center">Due Date</div>
                                      <div className="col-span-2 text-center">Max Points</div>
                                      <div className="col-span-2 text-center">Actions</div>
                                    </div>
                                  </div>
                                  
                                  {/* Empty State */}
                                  <div className="text-center py-4 text-gray-500">
                                    <BookOpen className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                                    <p className="text-xs">No assignments or quizzes yet</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm">
                    {/* Lessons Table Header */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                      <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                        <div className="col-span-5">Lesson Title</div>
                        <div className="col-span-3">Description</div>
                        <div className="col-span-2">Quizzes</div>
                        <div className="col-span-2">Actions</div>
                      </div>
                    </div>
                    
                    {/* Empty State */}
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                      <p className="text-sm">No lessons available for this course</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Empty State for No Courses */}
      {filteredData.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm">
          {/* Table Header Structure */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-900">Courses</h2>
            <p className="text-sm text-gray-600 mt-1">Manage your course content and assignments</p>
          </div>
          
          {/* Table Column Headers */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
              <div className="col-span-4">Course Name</div>
              <div className="col-span-2">Instructor</div>
              <div className="col-span-2">Lessons</div>
              <div className="col-span-2">Students</div>
              <div className="col-span-2">Actions</div>
            </div>
          </div>
          
          {/* Empty State Message */}
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? "No Matching Results" : "No Courses Available"}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery 
                ? `No courses, lessons, or quizzes match "${searchQuery}"` 
                : "No courses are currently available in the system"
              }
            </p>
            {!searchQuery && (
              <p className="text-sm text-gray-500">
                Courses will appear here once they are added to the system
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CourseListView;
