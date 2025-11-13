import React, { useState, useMemo, useEffect, useContext } from "react";
import { Search, Download, Plus, Edit2, Trash2, Filter, BarChart3, Users, BookOpen, TrendingUp, X, MoreHorizontal, FileText, FileSpreadsheet, ArrowLeft, ChevronRight } from "lucide-react";
import { FaUser } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { MdAssignmentAdd } from "react-icons/md";
import { SearchContext } from "../SearchContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  useGetCoursesWithDataQuery,
  useGetLessonsWithQuizzesQuery,
  useGetQuizParticipantsQuery,
  useCreateManualQuizMutation,
  useUpdateManualMarksMutation,
  type CourseWithData,
} from "../state/api/quizApi";
import QuizCreationModal from "./QuizCreation/QuizCreationModal";

// Enhanced mock data with comprehensive structure
const initialMockData = [
  {
    id: 1,
    name: "Mechanical Engineering 101",
    code: "ME101",
    semester: "Fall 2024",
    credits: 3,
    instructor: "Dr. Smith",
    lessons: [
      {
        id: 1,
        title: "Introduction to Mechanics",
        description: "Basic concepts and principles",
        quizzes: [
          {
            id: 101,
            title: "Thermodynamics Assignment",
            type: "assignment",
            dueDate: "2024-10-15",
            maxPoints: 100,
            weight: 0.2,
            students: [
              { id: 1, name: "Alice Johnson", email: "alice@university.edu", mark: 82, submissionDate: "2024-10-14" },
              { id: 2, name: "Bob Wilson", email: "bob@university.edu", mark: 91, submissionDate: "2024-10-13" },
              { id: 3, name: "Charlie Brown", email: "charlie@university.edu", mark: 76, submissionDate: "2024-10-15" },
              { id: 4, name: "Diana Prince", email: "diana@university.edu", mark: 88, submissionDate: "2024-10-14" },
            ],
          },
          {
            id: 102,
            title: "Fluid Mechanics Lab Report",
            type: "lab",
            dueDate: "2024-10-25",
            maxPoints: 100,
            weight: 0.15,
            students: [
              { id: 1, name: "Alice Johnson", email: "alice@university.edu", mark: 88, submissionDate: "2024-10-24" },
              { id: 2, name: "Bob Wilson", email: "bob@university.edu", mark: 79, submissionDate: "2024-10-25" },
              { id: 3, name: "Charlie Brown", email: "charlie@university.edu", mark: 92, submissionDate: "2024-10-23" },
              { id: 4, name: "Diana Prince", email: "diana@university.edu", mark: 85, submissionDate: "2024-10-24" },
            ],
          },
          {
            id: 103,
            title: "Midterm Exam",
            type: "exam",
            dueDate: "2024-11-05",
            maxPoints: 150,
            weight: 0.3,
            students: [
              { id: 1, name: "Alice Johnson", email: "alice@university.edu", mark: 128, submissionDate: "2024-11-05" },
              { id: 2, name: "Bob Wilson", email: "bob@university.edu", mark: 142, submissionDate: "2024-11-05" },
              { id: 3, name: "Charlie Brown", email: "charlie@university.edu", mark: 115, submissionDate: "2024-11-05" },
              { id: 4, name: "Diana Prince", email: "diana@university.edu", mark: 135, submissionDate: "2024-11-05" },
            ],
          },
        ]
      },
      {
        id: 2,
        title: "Advanced Thermodynamics",
        description: "Heat transfer and energy systems",
        quizzes: [
          {
            id: 201,
            title: "Heat Transfer Quiz",
            type: "quiz",
            dueDate: "2024-11-20",
            maxPoints: 80,
            weight: 0.1,
            students: [
              { id: 1, name: "Alice Johnson", email: "alice@university.edu", mark: 68, submissionDate: "2024-11-19" },
              { id: 2, name: "Bob Wilson", email: "bob@university.edu", mark: 74, submissionDate: "2024-11-20" },
              { id: 3, name: "Charlie Brown", email: "charlie@university.edu", mark: 62, submissionDate: "2024-11-20" },
              { id: 4, name: "Diana Prince", email: "diana@university.edu", mark: 71, submissionDate: "2024-11-19" },
            ],
          }
        ]
      }
    ],
    enrolledStudents: [
      { id: 1, name: "Alice Johnson", email: "alice@university.edu" },
      { id: 2, name: "Bob Wilson", email: "bob@university.edu" },
      { id: 3, name: "Charlie Brown", email: "charlie@university.edu" },
      { id: 4, name: "Diana Prince", email: "diana@university.edu" },
    ]
  },
  {
    id: 2,
    name: "Mechanical Engineering 202",
    code: "ME202",
    semester: "Fall 2024",
    credits: 4,
    instructor: "Prof. Johnson",
    lessons: [
      {
        id: 3,
        title: "Machine Design Fundamentals",
        description: "Basic principles of machine design",
        quizzes: [
          {
            id: 301,
            title: "Machine Design Project",
            type: "project",
            dueDate: "2024-11-15",
            maxPoints: 200,
            weight: 0.4,
            students: [
              { id: 5, name: "David Chen", email: "david@university.edu", mark: 172, submissionDate: "2024-11-15" },
              { id: 6, name: "Eve Martinez", email: "eve@university.edu", mark: 160, submissionDate: "2024-11-13" },
              { id: 7, name: "Frank Davis", email: "frank@university.edu", mark: 195, submissionDate: "2024-11-14" },
              { id: 8, name: "Grace Lee", email: "grace@university.edu", mark: 188, submissionDate: "2024-11-14" },
            ],
          },
          {
            id: 302,
            title: "Material Science Test",
            type: "quiz",
            dueDate: "2024-10-30",
            maxPoints: 50,
            weight: 0.15,
            students: [
              { id: 5, name: "David Chen", email: "david@university.edu", mark: 39, submissionDate: "2024-10-30" },
              { id: 6, name: "Eve Martinez", email: "eve@university.edu", mark: 42, submissionDate: "2024-10-30" },
              { id: 7, name: "Frank Davis", email: "frank@university.edu", mark: 45, submissionDate: "2024-10-30" },
              { id: 8, name: "Grace Lee", email: "grace@university.edu", mark: 47, submissionDate: "2024-10-30" },
            ],
          },
        ]
      }
    ],
    enrolledStudents: [
      { id: 5, name: "David Chen", email: "david@university.edu" },
      { id: 6, name: "Eve Martinez", email: "eve@university.edu" },
      { id: 7, name: "Frank Davis", email: "frank@university.edu" },
      { id: 8, name: "Grace Lee", email: "grace@university.edu" },
    ]
  }
];

const Tasks = () => {
  // RTK Query hooks
  const {
    data: coursesData,
    error: coursesError,
    isLoading: coursesLoading,
    refetch: refetchCourses,
  } = useGetCoursesWithDataQuery();

  // State management for hierarchical navigation
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<number | "total" | "analytics" | null>(null);
  const [viewLevel, setViewLevel] = useState<"courses" | "lessons" | "quizzes">("courses");
  
  // Search context
  const { searchQuery, setSearchQuery } = useContext(SearchContext);
  
  // UI state
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [searchFilters, setSearchFilters] = useState({
    filterType: "all" as "all" | "courses" | "lessons" | "quizzes" | "instructors",
    sortBy: "name" as "name" | "instructor" | "lessons" | "students",
    sortOrder: "asc" as "asc" | "desc"
  });
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState<Record<number, boolean>>({});
  const [isQuizCreationModalOpen, setIsQuizCreationModalOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<any>(null);

  // Transform API data
  const transformApiDataToMockFormat = (apiData: CourseWithData[]) => {
    return apiData.map(course => ({
      id: course.id,
      name: course.name,
      code: course.code,
      semester: course.semester || "Current Semester",
      credits: course.credits || 3,
      instructor: course.instructor,
      lessons: (course.lessons || []).map(lesson => ({
        ...lesson,
        quizzes: (lesson.quizzes || []).map(quiz => ({
          ...quiz,
          students: [] // Add empty students array for API data
        }))
      })),
      enrolledStudents: course.enrolledStudents || []
    }));
  };

  // Get final data
  const data = useMemo(() => {
    if (coursesData && coursesData.length > 0) {
      const transformedData = transformApiDataToMockFormat(coursesData);
      return transformedData.length > 0 ? transformedData : initialMockData;
    }
    return initialMockData;
  }, [coursesData]);

  const loading = coursesLoading;
  const error = coursesError ? 'Failed to load courses. Using demo data.' : null;

  // Enhanced filtering and search logic
  const filteredData = useMemo(() => {
    let filtered = [...data];
    
    // Get the active search term from either context or local search
    const activeSearch = searchQuery || localSearchTerm;
    
    // Apply text search
    if (activeSearch) {
      filtered = filtered.filter(course => {
        const searchLower = activeSearch.toLowerCase();
        
        // Search in different contexts based on filter type
        switch (searchFilters.filterType) {
          case "courses":
            return course.name.toLowerCase().includes(searchLower);
          case "instructors":
            return course.instructor.toLowerCase().includes(searchLower);
          case "lessons":
            return course.lessons?.some(lesson => 
              lesson.title.toLowerCase().includes(searchLower) ||
              lesson.description.toLowerCase().includes(searchLower)
            );
          case "quizzes":
            return course.lessons?.some(lesson =>
              lesson.quizzes?.some(quiz =>
                quiz.title.toLowerCase().includes(searchLower) ||
                quiz.type.toLowerCase().includes(searchLower)
              )
            );
          case "all":
          default:
            return (
              course.name.toLowerCase().includes(searchLower) ||
              course.code.toLowerCase().includes(searchLower) ||
              course.instructor.toLowerCase().includes(searchLower) ||
              course.lessons?.some(lesson => 
                lesson.title.toLowerCase().includes(searchLower) ||
                lesson.description.toLowerCase().includes(searchLower) ||
                lesson.quizzes?.some(quiz => 
                  quiz.title.toLowerCase().includes(searchLower)
                )
              )
            );
        }
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let compareA: any, compareB: any;
      
      switch (searchFilters.sortBy) {
        case "name":
          compareA = a.name;
          compareB = b.name;
          break;
        case "instructor":
          compareA = a.instructor;
          compareB = b.instructor;
          break;
        case "lessons":
          compareA = a.lessons?.length || 0;
          compareB = b.lessons?.length || 0;
          break;
        case "students":
          compareA = a.enrolledStudents?.length || 0;
          compareB = b.enrolledStudents?.length || 0;
          break;
        default:
          compareA = a.name;
          compareB = b.name;
      }
      
      if (typeof compareA === 'string') {
        compareA = compareA.toLowerCase();
        compareB = compareB.toLowerCase();
      }
      
      const comparison = compareA < compareB ? -1 : compareA > compareB ? 1 : 0;
      return searchFilters.sortOrder === "asc" ? comparison : -comparison;
    });
    
    return filtered;
  }, [data, searchQuery, localSearchTerm, searchFilters]);

  // Navigation functions
  const handleCourseSelect = (course: any) => {
    setSelectedCourse(course);
    setSelectedLesson(null);
    setSelectedQuiz(null);
    setViewLevel("lessons");
    setCurrentCourse(course);
  };

  const handleLessonSelect = (lesson: any) => {
    setSelectedLesson(lesson);
    setSelectedQuiz(null);
    setViewLevel("quizzes");
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setSelectedLesson(null);
    setSelectedQuiz(null);
    setViewLevel("courses");
  };

  const handleBackToLessons = () => {
    setSelectedLesson(null);
    setSelectedQuiz(null);
    setViewLevel("lessons");
  };

  // Quiz creation functions
  const handleCreateQuiz = (course: any, lessonId?: number, lessonTitle?: string) => {
    setCurrentCourse(course);
    if (lessonId && lessonTitle) {
      setSelectedLesson({ lessonId, lessonTitle });
    } else {
      const firstLesson = course.lessons && course.lessons.length > 0 
        ? course.lessons[0] 
        : { id: 1, title: 'General Assignments' };
      setSelectedLesson({ lessonId: firstLesson.id, lessonTitle: firstLesson.title });
    }
    setIsQuizCreationModalOpen(true);
  };

  const handleQuizCreated = () => {
    refetchCourses();
  };

  // Export functions
  const toggleExportDropdown = (id: number) => {
    setExportDropdownOpen(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setExportDropdownOpen({});
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Sync local search with global search context
  useEffect(() => {
    if (searchQuery && searchQuery !== localSearchTerm) {
      setLocalSearchTerm(searchQuery);
    }
  }, [searchQuery]);

  // Highlight search text in results
  const highlightSearchText = (text: string, search: string) => {
    if (!search) return text;
    const regex = new RegExp(`(${search})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) => 
      regex.test(part) ? 
        <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark> : part
    );
  };

  const exportToExcel = (courseId: number) => {
    console.log('Export to Excel:', courseId);
    // Implementation would go here
  };

  const exportToPDF = (courseId: number) => {
    console.log('Export to PDF:', courseId);
    // Implementation would go here
  };

  // Calculate weighted total marks per student across all quizzes in a lesson
  const calculateWeightedTotalMarks = (quizzes: any[]) => {
    const totals: Record<number, { name: string; email: string; mark: number; maxPossible: number; percentage: number }> = {};
    
    quizzes.forEach((quiz) => {
      quiz.students?.forEach((student: any) => {
        if (!totals[student.id]) {
          totals[student.id] = { 
            name: student.name, 
            email: student.email,
            mark: 0, 
            maxPossible: 0,
            percentage: 0
          };
        }
        const weightedMark = (student.mark / quiz.maxPoints) * quiz.weight * 100;
        totals[student.id].mark += weightedMark;
        totals[student.id].maxPossible += quiz.weight * 100;
      });
    });

    // Calculate percentages
    Object.values(totals).forEach(student => {
      student.percentage = student.maxPossible > 0 ? (student.mark / student.maxPossible) * 100 : 0;
    });

    return Object.values(totals);
  };

  // Calculate comprehensive analytics
  const calculateAnalytics = (quizzes: any[]) => {
    const totalStudents = new Set();
    let totalSubmissions = 0;
    let totalPossiblePoints = 0;
    let totalEarnedPoints = 0;
    const quizStats: Array<{
      title: string;
      average: string;
      max: number;
      min: number;
      submissions: number;
      type: string;
    }> = [];

    quizzes.forEach(quiz => {
      quiz.students?.forEach((student: any) => {
        totalStudents.add(student.id);
        totalSubmissions++;
        totalPossiblePoints += quiz.maxPoints;
        totalEarnedPoints += student.mark;
      });

      if (quiz.students && quiz.students.length > 0) {
        const marks = quiz.students.map((s: any) => s.mark).filter((mark: number) => !isNaN(mark) && isFinite(mark));
        const avg = marks.length > 0 ? marks.reduce((a: number, b: number) => a + b, 0) / marks.length : 0;
        const max = marks.length > 0 ? Math.max(...marks) : 0;
        const min = marks.length > 0 ? Math.min(...marks) : 0;

        quizStats.push({
          title: quiz.title,
          average: avg.toFixed(1),
          max,
          min,
          submissions: quiz.students.length,
          type: quiz.type
        });
      }
    });

    return {
      totalStudents: totalStudents.size,
      totalSubmissions,
      averageScore: totalPossiblePoints > 0 ? ((totalEarnedPoints / totalPossiblePoints) * 100).toFixed(1) : '0',
      quizStats
    };
  };

  // Calculate completion rate
  const calculateCompletionRate = (quizzes: any[]) => {
    if (!quizzes || quizzes.length === 0) return 0;
    
    let totalAssignments = 0;
    let completedAssignments = 0;
    
    quizzes.forEach(quiz => {
      if (quiz.students) {
        quiz.students.forEach((student: any) => {
          totalAssignments++;
          if (student.submissionDate && student.mark > 0) {
            completedAssignments++;
          }
        });
      }
    });
    
    return totalAssignments > 0 ? ((completedAssignments / totalAssignments) * 100).toFixed(1) : '0';
  };

  // Calculate students at risk
  const calculateStudentsAtRisk = (quizzes: any[]) => {
    if (!quizzes || quizzes.length === 0) return 0;
    
    const studentAverages: Record<number, { total: number; count: number }> = {};
    
    quizzes.forEach(quiz => {
      quiz.students?.forEach((student: any) => {
        const percentage = (student.mark / quiz.maxPoints) * 100;
        if (!studentAverages[student.id]) {
          studentAverages[student.id] = { total: 0, count: 0 };
        }
        studentAverages[student.id].total += percentage;
        studentAverages[student.id].count++;
      });
    });
    
    let atRiskCount = 0;
    Object.values(studentAverages).forEach(student => {
      const average = student.count > 0 ? student.total / student.count : 0;
      if (average < 65) { // Below 65% is considered at risk
        atRiskCount++;
      }
    });
    
    return atRiskCount;
  };

  // Helper functions for grading
  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600 bg-green-50";
    if (percentage >= 80) return "text-blue-600 bg-blue-50";
    if (percentage >= 70) return "text-yellow-600 bg-yellow-50";
    if (percentage >= 60) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  const getLetterGrade = (percentage: number) => {
    if (percentage >= 97) return "A+";
    if (percentage >= 93) return "A";
    if (percentage >= 90) return "A-";
    if (percentage >= 87) return "B+";
    if (percentage >= 83) return "B";
    if (percentage >= 80) return "B-";
    if (percentage >= 77) return "C+";
    if (percentage >= 73) return "C";
    if (percentage >= 70) return "C-";
    if (percentage >= 67) return "D+";
    if (percentage >= 65) return "D";
    return "F";
  };

  // Update student marks
  const updateStudentMark = (lessonId: number, quizId: number, studentId: number, mark: number) => {
    // This would integrate with RTK Query mutations
    console.log('Update student mark:', { lessonId, quizId, studentId, mark });
    // Implementation would update the actual data through API
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto bg-gray-50 min-h-screen">
      {/* Error banner */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 mx-6">
          <div className="flex items-center">
            <div className="text-yellow-800">⚠️ {error}</div>
            <button 
              onClick={() => refetchCourses()}
              className="ml-auto px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      {viewLevel !== "courses" && (
        <div className="mb-6 px-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <button
              onClick={handleBackToCourses}
              className="hover:text-blue-600 flex items-center space-x-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>All Courses</span>
            </button>
            {selectedCourse && (
              <>
                <ChevronRight className="h-4 w-4" />
                <span className="font-medium text-gray-900">{selectedCourse.name}</span>
              </>
            )}
            {selectedLesson && viewLevel === "quizzes" && (
              <>
                <ChevronRight className="h-4 w-4" />
                <button
                  onClick={handleBackToLessons}
                  className="hover:text-blue-600"
                >
                  {selectedLesson.title || selectedLesson.lessonTitle}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Search Interface */}
      {viewLevel === "courses" && (
        <div className="bg-white rounded-xl shadow-sm mb-6 mx-6">
          <div className="p-6">
            {/* Main Search Bar */}
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search courses, lessons, quizzes, or instructors..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
              />
              {/* Clear search button */}
              {(localSearchTerm || searchQuery) && (
                <button
                  onClick={() => {
                    setLocalSearchTerm("");
                    setSearchQuery("");
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Filter and Sort Controls */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* Filter Type */}
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={searchFilters.filterType}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, filterType: e.target.value as any }))}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Content</option>
                  <option value="courses">Courses Only</option>
                  <option value="instructors">Instructors</option>
                  <option value="lessons">Lessons</option>
                  <option value="quizzes">Quizzes</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <select
                  value={searchFilters.sortBy}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="name">Name</option>
                  <option value="instructor">Instructor</option>
                  <option value="lessons">Lesson Count</option>
                  <option value="students">Student Count</option>
                </select>
              </div>

              {/* Sort Order */}
              <button
                onClick={() => setSearchFilters(prev => ({ ...prev, sortOrder: prev.sortOrder === "asc" ? "desc" : "asc" }))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 flex items-center space-x-1"
              >
                <span>{searchFilters.sortOrder === "asc" ? "↑" : "↓"}</span>
                <span>{searchFilters.sortOrder === "asc" ? "Ascending" : "Descending"}</span>
              </button>

              {/* Results Count */}
              <div className="text-sm text-gray-500 ml-auto">
                {filteredData.length} {filteredData.length === 1 ? "course" : "courses"} found
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Courses View */}
      {viewLevel === "courses" && (
        <>
          {filteredData.map((course) => (
            <div key={course.id} className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden mx-6">
              <div className="p-6 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handleCourseSelect(course)}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {highlightSearchText(course.name, searchQuery || localSearchTerm)}
                    </h2>
                    
                    <div className="flex gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <FaUser className="h-4 w-4 mr-1" />
                        <span>{highlightSearchText(course.instructor, searchQuery || localSearchTerm)}</span>
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-1" />
                        <span>{course.lessons?.length || 0} Lessons</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{course.enrolledStudents?.length || 0} Students</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-blue-600">
                    <span className="text-sm mr-2">View Lessons</span>
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Lessons View */}
      {viewLevel === "lessons" && selectedCourse && (
        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden mx-6">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-900">{selectedCourse.name} - Lessons</h2>
          </div>
          
          <div className="p-6">
            {selectedCourse.lessons && selectedCourse.lessons.length > 0 ? (
              <div className="space-y-4">
                {selectedCourse.lessons.map((lesson: any) => (
                  <div 
                    key={lesson.id} 
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleLessonSelect(lesson)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{lesson.title}</h3>
                        {lesson.description && (
                          <p className="text-gray-600 text-sm mb-3">{lesson.description}</p>
                        )}
                        
                        <div className="flex gap-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <BookOpen className="h-4 w-4 mr-1" />
                            <span>{lesson.quizzes?.length || 0} Assignments/Quizzes</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreateQuiz(selectedCourse, lesson.id, lesson.title);
                          }}
                          className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm flex items-center gap-1 hover:bg-blue-700 transition-colors"
                          title="Create Quiz"
                        >
                          <Plus className="h-4 w-4" />
                          Quiz
                        </button>
                        
                        <div className="flex items-center text-blue-600">
                          <span className="text-sm mr-2">View Quizzes</span>
                          <ChevronRight className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Lessons Found</h3>
                <p className="text-gray-600">This course doesn't have any lessons yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quizzes/Analytics View */}
      {viewLevel === "quizzes" && selectedLesson && (
        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden mx-6">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-900">{selectedLesson.title}</h2>
            <p className="text-sm text-gray-600 mt-1">{selectedCourse.name}</p>
          </div>
          
          <div className="p-6">
            {/* Quiz Selection and Export */}
            <div className="flex items-baseline flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Assignment/Quiz or View
                </label>
                <select
                  className="w-full rounded-md outline-none px-3 py-2 border border-slate-400"
                  value={selectedQuiz ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedQuiz(value === "total" ? "total" : 
                                   value === "analytics" ? "analytics" :
                                   value === "" ? null : Number(value));
                  }}
                >
                  <option value="">-- Choose Option --</option>
                  <optgroup label="Assignments/Quizzes">
                    {selectedLesson.quizzes && selectedLesson.quizzes.map((quiz: any) => (
                      <option key={quiz.id} value={quiz.id}>
                        {quiz.title} ({quiz.type})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Views">
                    <option value="total">Final Grades</option>
                    <option value="analytics">Course Analytics</option>
                  </optgroup>
                </select>
              </div>
              
              {selectedQuiz && (
                <div className="relative">
                  <button
                    onClick={() => toggleExportDropdown(selectedLesson.id)}
                    className="flex h-10 items-center justify-center w-10 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-300"
                  >
                    <MoreHorizontal className="h-5 w-5 text-gray-600" />
                  </button>
                  
                  {exportDropdownOpen[selectedLesson.id] && (
                    <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[160px]">
                      <button
                        onClick={() => {
                          exportToExcel(selectedCourse.id);
                          toggleExportDropdown(selectedLesson.id);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700"
                      >
                        <FileSpreadsheet className="h-4 w-4 text-green-600" />
                        Export to Excel
                      </button>
                      <button
                        onClick={() => {
                          exportToPDF(selectedCourse.id);
                          toggleExportDropdown(selectedLesson.id);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700"
                      >
                        <FileText className="h-4 w-4 text-red-600" />
                        Export to PDF
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Content based on selection */}
            {!selectedQuiz && (
              <div className="text-center py-12">
                <MdAssignmentAdd className="text-6xl mb-4 text-gray-400 mx-auto" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">Select an Assignment or View</h3>
                <p className="text-gray-600">Choose from the dropdown above to view detailed information</p>
              </div>
            )}
            
            {/* Individual Quiz Content */}
            {selectedQuiz && typeof selectedQuiz === 'number' && selectedLesson.quizzes && (
              (() => {
                const quiz = selectedLesson.quizzes.find((q: any) => q.id === selectedQuiz);
                if (!quiz) return null;
                
                return (
                  <div className="space-y-4">
                    {/* Quiz Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Type:</span>
                          <div className="font-medium capitalize">{quiz.type}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Due Date:</span>
                          <div className="font-medium">{quiz.dueDate}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Max Points:</span>
                          <div className="font-medium">{quiz.maxPoints}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Weight:</span>
                          <div className="font-medium">{(quiz.weight * 100)}%</div>
                        </div>
                      </div>
                    </div>

                    {/* Students Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border-b px-4 py-3 text-left font-medium text-gray-900">Student</th>
                            <th className="border-b px-4 py-3 text-left font-medium text-gray-900">Email</th>
                            <th className="border-b px-4 py-3 text-left font-medium text-gray-900">Score</th>
                            <th className="border-b px-4 py-3 text-left font-medium text-gray-900">Percentage</th>
                            <th className="border-b px-4 py-3 text-left font-medium text-gray-900">Grade</th>
                            <th className="border-b px-4 py-3 text-left font-medium text-gray-900">Submitted</th>
                          </tr>
                        </thead>
                        <tbody>
                          {quiz.students && quiz.students.map((student: any, index: number) => {
                            const percentage = (student.mark / quiz.maxPoints) * 100;
                            return (
                              <tr key={student.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                <td className="border-b px-4 py-3 font-medium">{student.name}</td>
                                <td className="border-b px-4 py-3 text-gray-600 text-sm">{student.email}</td>
                                <td className="border-b px-4 py-3">
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="number"
                                      value={student.mark}
                                      onChange={(e) => updateStudentMark(
                                        selectedLesson.id, 
                                        quiz.id, 
                                        student.id, 
                                        Number(e.target.value)
                                      )}
                                      className="w-20 px-2 py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      min="0"
                                      max={quiz.maxPoints}
                                    />
                                    <span className="text-gray-500 text-sm">/ {quiz.maxPoints}</span>
                                  </div>
                                </td>
                                <td className="border-b px-4 py-3">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(percentage)}`}>
                                    {percentage.toFixed(1)}%
                                  </span>
                                </td>
                                <td className="border-b px-4 py-3">
                                  <span className="font-bold text-lg">{getLetterGrade(percentage)}</span>
                                </td>
                                <td className="border-b px-4 py-3 text-sm text-gray-600">
                                  {student.submissionDate || "Not submitted"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()
            )}
            
            {/* Total/Final Grades View */}
            {selectedQuiz === "total" && selectedLesson.quizzes && (
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-lg font-bold text-blue-900 mb-2">Final Lesson Grades</h4>
                  <p className="text-blue-700 text-sm">
                    Calculated using weighted averages across all assignments in this lesson
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border-b border-gray-400 px-4 py-3 text-left font-medium text-gray-900">Student</th>
                        <th className="border-b border-gray-400 px-4 py-3 text-left font-medium text-gray-900">Email</th>
                        <th className="border-b border-gray-400 px-4 py-3 text-left font-medium text-gray-900">Total Score</th>
                        <th className="border-b border-gray-400 px-4 py-3 text-left font-medium text-gray-900">Percentage</th>
                        <th className="border-b border-gray-400 px-4 py-3 text-left font-medium text-gray-900">Letter Grade</th>
                        <th className="border-b border-gray-400 px-4 py-3 text-left font-medium text-gray-900">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculateWeightedTotalMarks(selectedLesson.quizzes)
                        .sort((a, b) => b.percentage - a.percentage)
                        .map((student, index) => (
                          <tr key={student.name} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="border-b border-gray-400 px-4 py-3 font-medium">{student.name}</td>
                            <td className="border-b border-gray-400 px-4 py-3 text-gray-600 text-sm">{student.email}</td>
                            <td className="border-b border-gray-400 px-4 py-3 font-medium">{student.mark.toFixed(2)}</td>
                            <td className="border-b border-gray-400 px-4 py-3">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(student.percentage)}`}>
                                {student.percentage.toFixed(1)}%
                              </span>
                            </td>
                            <td className="border-b border-gray-400 px-4 py-3">
                              <span className="font-bold text-xl">{getLetterGrade(student.percentage)}</span>
                            </td>
                            <td className="border-b border-gray-400 px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                student.percentage >= 65 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}>
                                {student.percentage >= 65 ? "Passing" : "At Risk"}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Analytics Dashboard */}
            {selectedQuiz === "analytics" && selectedLesson.quizzes && (
              <div className="space-y-6">
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="text-lg font-bold text-purple-900 mb-2">Lesson Analytics Dashboard</h4>
                  <p className="text-purple-700 text-sm">
                    Comprehensive statistics and performance metrics for {selectedLesson.title}
                  </p>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg border-slate-200 border">
                    <div className="flex items-center mb-2">
                      <Users className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Total Students</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{calculateAnalytics(selectedLesson.quizzes).totalStudents}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-slate-200 border">
                    <div className="flex items-center mb-2">
                      <BarChart3 className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Average Score</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">{calculateAnalytics(selectedLesson.quizzes).averageScore}%</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-slate-200 border">
                    <div className="flex items-center mb-2">
                      <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Total Submissions</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">{calculateAnalytics(selectedLesson.quizzes).totalSubmissions}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-slate-200 border">
                    <div className="flex items-center mb-2">
                      <BookOpen className="h-5 w-5 text-orange-600 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Completion Rate</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-600">{calculateCompletionRate(selectedLesson.quizzes)}%</div>
                  </div>
                </div>

                {/* Assignment Performance Table */}
                <div className="bg-white rounded-lg border-slate-200 border overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-slate-200">
                    <h5 className="font-medium text-gray-900">Assignment Performance Breakdown</h5>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Assignment</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Average</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Highest</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Lowest</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Submissions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {calculateAnalytics(selectedLesson.quizzes).quizStats.map((stat, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 font-medium">{stat.title}</td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                stat.type === 'exam' ? 'bg-red-100 text-red-800' :
                                stat.type === 'project' ? 'bg-purple-100 text-purple-800' :
                                stat.type === 'lab' ? 'bg-blue-100 text-blue-800' :
                                stat.type === 'quiz' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {stat.type}
                              </span>
                            </td>
                            <td className="px-4 py-2 font-semibold text-blue-600">{stat.average}</td>
                            <td className="px-4 py-2 text-green-600 font-medium">{stat.max}</td>
                            <td className="px-4 py-2 text-red-600 font-medium">{stat.min}</td>
                            <td className="px-4 py-2">{stat.submissions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Quick Insights */}
                <div className="border-slate-200 rounded-lg p-4 border">
                  <h5 className="font-medium text-gray-900 mb-3">Quick Insights</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-white/50 rounded border-slate-200 border p-3">
                      <div className="font-medium text-blue-800">Best Performing Assignment</div>
                      <div className="text-blue-600">
                        {calculateAnalytics(selectedLesson.quizzes).quizStats.length > 0 
                          ? calculateAnalytics(selectedLesson.quizzes).quizStats.reduce((best, current) => 
                              parseFloat(current.average) > parseFloat(best.average) ? current : best
                            ).title
                          : 'No data available'
                        }
                      </div>
                    </div>
                    <div className="bg-white/50 rounded p-3">
                      <div className="font-medium text-purple-800">Most Challenging</div>
                      <div className="text-purple-600">
                        {calculateAnalytics(selectedLesson.quizzes).quizStats.length > 0 
                          ? calculateAnalytics(selectedLesson.quizzes).quizStats.reduce((worst, current) => 
                              parseFloat(current.average) < parseFloat(worst.average) ? current : worst
                            ).title
                          : 'No data available'
                        }
                      </div>
                    </div>
                    <div className="bg-white/50 rounded border-slate-200 border md:border-0 p-3">
                      <div className="font-medium text-green-800">Completion Rate</div>
                      <div className="text-green-600">{calculateCompletionRate(selectedLesson.quizzes)}%</div>
                    </div>
                    <div className="bg-white/50 rounded border-slate-200 md:border p-3">
                      <div className="font-medium text-orange-800">Students at Risk</div>
                      <div className="text-orange-600">{calculateStudentsAtRisk(selectedLesson.quizzes)} student{calculateStudentsAtRisk(selectedLesson.quizzes) !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {filteredData.length === 0 && viewLevel === "courses" && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm mx-6">
          <div className="text-6xl mb-4"><FaSearch /></div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Courses Found</h3>
          <p className="text-gray-600">Try adjusting your search terms or filters</p>
        </div>
      )}
      
      {/* Quiz Creation Modal */}
      {currentCourse && selectedLesson && (
        <QuizCreationModal
          isOpen={isQuizCreationModalOpen}
          onClose={() => {
            setIsQuizCreationModalOpen(false);
            setSelectedLesson(null);
          }}
          courseId={currentCourse.id}
          lessonId={selectedLesson.lessonId || selectedLesson.id}
          courseName={currentCourse.name}
          lessonTitle={selectedLesson.lessonTitle || selectedLesson.title}
          enrolledStudents={currentCourse.enrolledStudents || []}
          onQuizCreated={handleQuizCreated}
        />
      )}
    </div>
  );
};

export default Tasks;
