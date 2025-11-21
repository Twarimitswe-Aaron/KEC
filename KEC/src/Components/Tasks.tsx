import React, { useState, useMemo, useEffect, useContext } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Filter,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { SearchContext } from "../SearchContext";
import {
  useGetCoursesWithDataQuery,
  useGetCourseAnalyticsQuery,
  type CourseWithData,
} from "../state/api/quizApi";
import QuizCreationModal from "./QuizCreation/QuizCreationModal";
import CourseListView from "./TasksComponents/CourseListView";
import PerformanceAnalytics from "./TasksComponents/PerformanceAnalytics";
import QuizDetailsView from "./TasksComponents/QuizDetailsView";

// Mock data for fallback
const initialMockData = [
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
              {
                id: 5,
                name: "David Chen",
                email: "david@university.edu",
                mark: 172,
                submissionDate: "2024-11-15",
              },
              {
                id: 6,
                name: "Eve Martinez",
                email: "eve@university.edu",
                mark: 160,
                submissionDate: "2024-11-13",
              },
            ],
          },
        ],
      },
    ],
    enrolledStudents: [],
  },
];

const Tasks = () => {
  // RTK Query hooks
  const {
    data: coursesData,
    error: coursesError,
    isLoading: coursesLoading,
    refetch: refetchCourses,
  } = useGetCoursesWithDataQuery();

  const { searchQuery } = useContext(SearchContext);

  // State management
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [viewLevel, setViewLevel] = useState<"courses" | "lessons" | "quizzes">(
    "courses"
  );
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [expandedCourses, setExpandedCourses] = useState<
    Record<number, boolean>
  >({});
  const [expandedLessons, setExpandedLessons] = useState<
    Record<string, boolean>
  >({});
  const [courseMenus, setCourseMenus] = useState<Record<number, boolean>>({});
  const [isQuizCreationModalOpen, setIsQuizCreationModalOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<any>(null);
  const [selectedQuizDetails, setSelectedQuizDetails] = useState<any>(null);
  const [showUnifiedAnalytics, setShowUnifiedAnalytics] = useState(false);
  const [analyticsSelectedCourse, setAnalyticsSelectedCourse] =
    useState<any>(null);
  const [lessonMenus, setLessonMenus] = useState<Record<number, boolean>>({});
  const [selectedQuizType, setSelectedQuizType] =
    useState<string>("assignment");

  // Course analytics - fetch when analytics are selected
  const { data: courseAnalytics, isLoading: analyticsLoading } =
    useGetCourseAnalyticsQuery(selectedCourse?.id || 0, {
      skip:
        !selectedCourse?.id ||
        (!selectedQuiz?.includes("analytics") &&
          selectedQuiz !== "overall-performance"),
    });

  // Unified course analytics - fetch when unified modal is open
  const { data: unifiedCourseAnalytics, isLoading: unifiedAnalyticsLoading } =
    useGetCourseAnalyticsQuery(analyticsSelectedCourse?.id || 0, {
      skip: !analyticsSelectedCourse?.id || !showUnifiedAnalytics,
    });

  // Transform API data
  const transformApiDataToMockFormat = (apiData: CourseWithData[]) => {
    return apiData.map((course) => ({
      ...course,
      semester: course.semester || "Current Semester",
      credits: course.credits || 3,
      lessons:
        course.lessons?.map((lesson) => ({
          ...lesson,
          description: lesson.description || "Course lesson",
          quizzes:
            lesson.quizzes?.map((quiz) => ({
              ...quiz,
              type: quiz.type || "quiz",
              dueDate: quiz.dueDate || new Date().toISOString().split("T")[0],
              maxPoints: quiz.maxPoints || 100,
              students:
                quiz.students?.map((student) => ({
                  studentId: student.studentId,
                  name: student.name,
                  email: student.email,
                  mark: student.mark || 0,
                  submissionDate: student.submissionDate || null,
                })) || [],
            })) || [],
        })) || [],
      enrolledStudents: course.enrolledStudents || [],
    }));
  };

  const data = useMemo(() => {
    if (coursesData && coursesData.length > 0) {
      return transformApiDataToMockFormat(coursesData);
    }
    return initialMockData;
  }, [coursesData]);

  const loading = coursesLoading;
  const error = coursesError
    ? "Failed to load courses. Using demo data."
    : null;

  // Utility functions
  const getGradeColor = (percentage: number) => {
    if (percentage >= 85) return "bg-green-100 text-green-800";
    if (percentage >= 70) return "bg-blue-100 text-blue-800";
    if (percentage >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getLetterGrade = (percentage: number) => {
    if (percentage >= 95) return "A+";
    if (percentage >= 85) return "A";
    if (percentage >= 75) return "B";
    if (percentage >= 65) return "C";
    if (percentage >= 55) return "D";
    return "F";
  };

  const calculateLessonTotalScore = (lesson: any) => {
    return (
      lesson.quizzes?.reduce((total: number, quiz: any) => {
        const avgScore =
          quiz.students?.reduce(
            (sum: number, student: any) => sum + student.mark,
            0
          ) / quiz.students?.length || 0;
        return total + avgScore;
      }, 0) || 0
    );
  };

  const calculateLessonTotalMaxPoints = (lesson: any) => {
    return (
      lesson.quizzes?.reduce(
        (total: number, quiz: any) => total + quiz.maxPoints,
        0
      ) || 0
    );
  };

  function computeCourseAnalytics(course: any) {
    if (!course) return undefined;
    const lessons = course.lessons || [];
    const quizzes = lessons.flatMap((l: any) => l.quizzes || []);
    const totalLessons = lessons.length;
    const totalAssignments = quizzes.length;
    const enrolled = course.enrolledStudents || [];
    const studentMap: Record<number, any> = {};
    enrolled.forEach((s: any) => {
      if (s && typeof s.id === "number") {
        studentMap[s.id] = {
          studentId: s.id,
          name: s.name || "",
          email: s.email || "",
          assignmentsCompleted: 0,
          totalAssignments,
          _sumPerc: 0,
          _countPerc: 0,
        };
      }
    });
    quizzes.forEach((q: any) => {
      const maxPts = Number(q?.maxPoints) || 100;
      const students = q?.students || [];
      students.forEach((st: any) => {
        const id = typeof st?.studentId === "number" ? st.studentId : st?.id;
        if (typeof id !== "number") return;
        if (!studentMap[id]) {
          studentMap[id] = {
            studentId: id,
            name: st.name || "",
            email: st.email || "",
            assignmentsCompleted: 0,
            totalAssignments,
            _sumPerc: 0,
            _countPerc: 0,
          };
        }
        const mark = typeof st?.mark === "number" ? st.mark : null;
        if (mark !== null) {
          studentMap[id].assignmentsCompleted += 1;
          studentMap[id]._sumPerc += (mark / maxPts) * 100;
          studentMap[id]._countPerc += 1;
        }
      });
    });
    const topPerformingStudents = Object.values(studentMap).map((s: any) => {
      const overallAverage = s._countPerc > 0 ? s._sumPerc / s._countPerc : 0;
      return {
        studentId: s.studentId,
        name: s.name,
        email: s.email,
        overallAverage,
        letterGrade: getLetterGrade(overallAverage),
        assignmentsCompleted: s.assignmentsCompleted,
        totalAssignments: s.totalAssignments,
        lessonsProgress: [],
      };
    });
    const studentsWithMarks = topPerformingStudents.filter(
      (s: any) => s.assignmentsCompleted > 0
    );
    const courseAverage =
      studentsWithMarks.length > 0
        ? studentsWithMarks.reduce(
            (acc: number, s: any) => acc + s.overallAverage,
            0
          ) / studentsWithMarks.length
        : 0;
    const totalStudents =
      enrolled.length > 0 ? enrolled.length : Object.keys(studentMap).length;
    const completionRate =
      totalStudents > 0 && totalAssignments > 0
        ? (topPerformingStudents.reduce(
            (acc: number, s: any) => acc + s.assignmentsCompleted,
            0
          ) /
            (totalStudents * totalAssignments)) *
          100
        : 0;
    const studentsAtRisk = topPerformingStudents.filter(
      (s: any) => s.overallAverage < 65
    ).length;
    const gradeDistribution = topPerformingStudents.reduce(
      (acc: any, s: any) => {
        const g = s.letterGrade.startsWith("A")
          ? "A"
          : s.letterGrade.startsWith("B")
          ? "B"
          : s.letterGrade.startsWith("C")
          ? "C"
          : s.letterGrade.startsWith("D")
          ? "D"
          : "F";
        acc[g] = (acc[g] || 0) + 1;
        return acc;
      },
      { A: 0, B: 0, C: 0, D: 0, F: 0 } as any
    );
    const lessonsAnalytics = lessons.map((l: any) => {
      const lQuizzes = l.quizzes || [];
      const assignmentCount = lQuizzes.length;
      let sumPerc = 0;
      let countPerc = 0;
      let submissions = 0;
      lQuizzes.forEach((q: any) => {
        const maxPts = Number(q?.maxPoints) || 100;
        const students = q?.students || [];
        students.forEach((st: any) => {
          const mark = typeof st?.mark === "number" ? st.mark : null;
          if (mark !== null) {
            sumPerc += (mark / maxPts) * 100;
            countPerc += 1;
            submissions += 1;
          }
        });
      });
      const averagePerformance = countPerc > 0 ? sumPerc / countPerc : 0;
      const lessonCompletionRate =
        totalStudents > 0 && assignmentCount > 0
          ? (submissions / (totalStudents * assignmentCount)) * 100
          : 0;
      const perStudentMap: Record<number, { sum: number; cnt: number }> = {};
      lQuizzes.forEach((q: any) => {
        const maxPts = Number(q?.maxPoints) || 100;
        (q?.students || []).forEach((st: any) => {
          const id = typeof st?.studentId === "number" ? st.studentId : st?.id;
          if (typeof id !== "number") return;
          const mark = typeof st?.mark === "number" ? st.mark : null;
          if (mark !== null) {
            if (!perStudentMap[id]) perStudentMap[id] = { sum: 0, cnt: 0 };
            perStudentMap[id].sum += (mark / maxPts) * 100;
            perStudentMap[id].cnt += 1;
          }
        });
      });
      const studentsAtRiskLesson = Object.values(perStudentMap).filter(
        (v: any) => v.sum / v.cnt < 65
      ).length;
      return {
        lessonId: l.id,
        lessonTitle: l.title,
        assignmentCount,
        averagePerformance,
        completionRate: lessonCompletionRate,
        studentsAtRisk: studentsAtRiskLesson,
        quizStats: [],
      };
    });
    return {
      totalLessons,
      totalAssignments,
      totalStudents,
      courseAverage,
      completionRate,
      studentsAtRisk,
      lessonsAnalytics,
      topPerformingStudents,
      assignmentTypeBreakdown: [],
      gradeDistribution,
    };
  }

  const computedUnifiedAnalytics = useMemo(() => {
    if (!analyticsSelectedCourse) return undefined as any;
    const baseCourse =
      (data || []).find((c: any) => c.id === analyticsSelectedCourse.id) ||
      analyticsSelectedCourse;
    return computeCourseAnalytics(baseCourse);
  }, [analyticsSelectedCourse, data]);

  // Filter and search functionality
  const filteredData = useMemo(() => {
    let filtered = [...data];

    if (searchQuery && searchQuery.trim() !== "") {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter((course) => {
        return (
          course.name.toLowerCase().includes(searchLower) ||
          course.instructor?.toLowerCase().includes(searchLower) ||
          course.lessons?.some(
            (lesson: any) =>
              lesson.title.toLowerCase().includes(searchLower) ||
              lesson.quizzes?.some((quiz: any) =>
                quiz.title.toLowerCase().includes(searchLower)
              )
          )
        );
      });
    }

    if (filterType !== "all") {
      filtered = filtered.filter((course) =>
        course.lessons?.some((lesson: any) =>
          lesson.quizzes?.some((quiz: any) => quiz.type === filterType)
        )
      );
    }

    // Sort courses
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case "instructor":
          aValue = a.instructor || "";
          bValue = b.instructor || "";
          break;
        case "semester":
          aValue = a.semester || "";
          bValue = b.semester || "";
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      const result = aValue.localeCompare(bValue);
      return sortOrder === "asc" ? result : -result;
    });

    return filtered;
  }, [data, searchQuery, filterType, sortBy, sortOrder]);

  // Auto-expand accordions based on search results
  useEffect(() => {
    if (searchQuery && searchQuery.trim() !== "") {
      const searchLower = searchQuery.toLowerCase();
      const newExpandedCourses: Record<number, boolean> = {};
      const newExpandedLessons: Record<string, boolean> = {};

      filteredData.forEach((course) => {
        const hasMatchingContent = course.lessons?.some(
          (lesson: any) =>
            lesson.title.toLowerCase().includes(searchLower) ||
            lesson.quizzes?.some((quiz: any) =>
              quiz.title.toLowerCase().includes(searchLower)
            )
        );

        if (hasMatchingContent) {
          newExpandedCourses[course.id] = true;
          course.lessons?.forEach((lesson: any) => {
            if (
              lesson.title.toLowerCase().includes(searchLower) ||
              lesson.quizzes?.some((quiz: any) =>
                quiz.title.toLowerCase().includes(searchLower)
              )
            ) {
              newExpandedLessons[lesson.id.toString()] = true;
            }
          });
        }
      });

      setExpandedCourses(newExpandedCourses);
      setExpandedLessons(newExpandedLessons);
    }
  }, [searchQuery, filteredData]);

  // Event handlers
  const toggleCourseAccordion = (
    courseId: number,
    event?: React.MouseEvent
  ) => {
    if (event) event.stopPropagation();

    if (!searchQuery) {
      setExpandedCourses((prev) => ({
        [courseId]: !prev[courseId],
      }));
    } else {
      setExpandedCourses((prev) => ({
        ...prev,
        [courseId]: !prev[courseId],
      }));
    }
  };

  const toggleLessonAccordion = (
    lessonId: number,
    event?: React.MouseEvent
  ) => {
    if (event) event.stopPropagation();

    const lessonKey = lessonId.toString();
    if (!searchQuery) {
      setExpandedLessons((prev) => ({
        [lessonKey]: !prev[lessonKey],
      }));
    } else {
      setExpandedLessons((prev) => ({
        ...prev,
        [lessonKey]: !prev[lessonKey],
      }));
    }
  };

  const toggleLessonMenu = (lessonId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLessonMenus((prev) => ({
      ...prev,
      [lessonId]: !prev[lessonId],
    }));
  };

  const handleCreateQuiz = (
    course: any,
    lessonId?: number,
    lessonTitle?: string,
    quizType?: string
  ) => {
    setCurrentCourse(course);
    if (lessonId && lessonTitle) {
      setSelectedLesson({ lessonId, lessonTitle });
    }
    setSelectedQuizType(quizType ?? "assignment");
    setIsQuizCreationModalOpen(true);
  };

  const handleQuizCreated = () => {
    refetchCourses();
    setIsQuizCreationModalOpen(false);
  };

  const handleQuizSelect = (course: any, lesson: any, quiz: any) => {
    setSelectedQuizDetails({
      quiz,
      courseId: course.id,
      courseName: course.name,
      lessonTitle: lesson.title,
    });
  };

  const handleAnalyticsSelect = (type: string, course: any, lesson?: any) => {
    setSelectedCourse(course);
    setSelectedLesson(lesson);
    setSelectedQuiz(type);
  };

  const toggleCourseMenu = (courseId: number) => {
    setCourseMenus((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

  const closeAllLessonMenus = () => {
    setLessonMenus({});
  };

  const handleCoursePerformanceSelect = (course: any) => {
    setAnalyticsSelectedCourse(course);
    setShowUnifiedAnalytics(true);
    // Close the course menu
    setCourseMenus((prev) => ({
      ...prev,
      [course.id]: false,
    }));
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
    <div className="w-full bg-gray-50 min-h-screen">
      {/* Error banner */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
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
        <div className="mb-6 px-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <button
              onClick={handleBackToCourses}
              className="hover:text-blue-600 flex items-center space-x-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Courses</span>
            </button>
            {selectedCourse && (
              <>
                <ChevronRight className="h-4 w-4" />
                <span className="font-medium">{selectedCourse.name}</span>
              </>
            )}
            {selectedLesson && (
              <>
                <ChevronRight className="h-4 w-4" />
                <button
                  onClick={handleBackToLessons}
                  className="hover:text-blue-600"
                >
                  {selectedLesson.title}
                </button>
              </>
            )}
            {selectedQuiz && (
              <>
                <ChevronRight className="h-4 w-4" />
                <span className="font-medium">Analytics</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Filter and Sort Controls */}
      {viewLevel === "courses" && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 mb-6">
          <div className="p-4">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              {/* Filter Controls */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
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
                    <option value="exam">Exams</option>
                    <option value="project">Projects</option>
                    <option value="lab">Labs</option>
                  </select>
                </div>
              </div>

              {/* Sort Controls */}
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
                    <option value="name">Course Name</option>
                    <option value="instructor">Instructor</option>
                    <option value="semester">Semester</option>
                  </select>
                </div>
                <button
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {sortOrder === "asc" ? (
                    <SortAsc className="h-4 w-4" />
                  ) : (
                    <SortDesc className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Results Count */}
              <div className="text-sm text-gray-500">
                {filteredData.length}{" "}
                {filteredData.length === 1 ? "course" : "courses"} found
                {searchQuery && (
                  <span className="ml-1">for "{searchQuery}"</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {viewLevel === "courses" && (
        <CourseListView
          filteredData={filteredData}
          expandedCourses={expandedCourses}
          expandedLessons={expandedLessons}
          searchQuery={searchQuery}
          toggleCourseAccordion={toggleCourseAccordion}
          toggleLessonAccordion={toggleLessonAccordion}
          handleCreateQuiz={handleCreateQuiz}
          onQuizSelect={handleQuizSelect}
          onCoursePerformanceSelect={handleCoursePerformanceSelect}
          toggleCourseMenu={toggleCourseMenu}
          courseMenus={courseMenus}
          getGradeColor={getGradeColor}
          getLetterGrade={getLetterGrade}
          calculateLessonTotalScore={calculateLessonTotalScore}
          calculateLessonTotalMaxPoints={calculateLessonTotalMaxPoints}
          lessonMenus={lessonMenus}
          toggleLessonMenu={toggleLessonMenu}
          closeAllLessonMenus={closeAllLessonMenus}
        />
      )}

      {/* Performance Analytics */}
      <PerformanceAnalytics
        selectedQuiz={selectedQuiz}
        selectedCourse={selectedCourse}
        courseAnalytics={courseAnalytics}
        analyticsLoading={analyticsLoading}
        getGradeColor={getGradeColor}
        getLetterGrade={getLetterGrade}
      />

      {/* Quiz Details Modal */}
      {selectedQuizDetails && (
        <QuizDetailsView
          selectedQuizDetails={selectedQuizDetails}
          onBack={() => setSelectedQuizDetails(null)}
          getGradeColor={getGradeColor}
          getLetterGrade={getLetterGrade}
        />
      )}

      {/* Quiz Creation Modal */}
      {currentCourse && selectedLesson && (
        <QuizCreationModal
          isOpen={isQuizCreationModalOpen}
          onClose={() => setIsQuizCreationModalOpen(false)}
          courseId={currentCourse.id}
          courseName={currentCourse.name}
          lessonId={selectedLesson.lessonId}
          lessonTitle={selectedLesson.lessonTitle}
          enrolledStudents={currentCourse.enrolledStudents || []}
          onQuizCreated={handleQuizCreated}
          defaultType={selectedQuizType}
        />
      )}

      {/* Course Analytics Modal */}
      <PerformanceAnalytics
        course={analyticsSelectedCourse}
        courseAnalytics={unifiedCourseAnalytics || computedUnifiedAnalytics}
        analyticsLoading={unifiedAnalyticsLoading && !computedUnifiedAnalytics}
        getGradeColor={getGradeColor}
        getLetterGrade={getLetterGrade}
        isOpen={showUnifiedAnalytics}
        onClose={() => {
          setShowUnifiedAnalytics(false);
          setAnalyticsSelectedCourse(null);
        }}
      />
    </div>
  );
};

export default Tasks;
