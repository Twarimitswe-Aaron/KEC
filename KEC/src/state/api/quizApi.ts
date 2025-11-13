// frontend/src/api/quizApi.ts
import { apiSlice } from "./apiSlice";
import { QuestionProp } from "./courseApi";

export interface QuizIdentifiers {
  courseId: number;
  lessonId: number;
  quizId: number;
  formId: number;
}


export interface QuizQuestion extends QuestionProp {
  imageUrl?: string;
  imageFile?: File;
}


export interface QuizSettings {
  title: string;
  description?: string;
  showResults?: boolean;
  allowRetakes?: boolean;
  passingScore?: number;
}

export interface Quiz {
  id: number;
  name: string;
  description?: string;
  courseId: number;
  lessonId: number;
  formId: number;
  questions?: QuizQuestion[];
  settings?: QuizSettings;
}

export interface UpdateQuizRequest {
  name?: string;
  description?: string;
  courseId: number;
  lessonId: number;
  quizId: number;
  formId: number;
  questions?: QuizQuestion[];
  settings?: QuizSettings;
}

// New interfaces for Tasks component
export interface CourseWithData {
  id: number;
  name: string;
  code: string;
  instructor: string;
  semester: string;
  credits: number;
  lessons: LessonWithQuizzes[];
  enrolledStudents: EnrolledStudent[];
  analytics?: CourseAnalytics;
}

// Comprehensive course analytics interface
export interface CourseAnalytics {
  totalLessons: number;
  totalAssignments: number;
  totalStudents: number;
  courseAverage: number;
  completionRate: number;
  studentsAtRisk: number;
  lessonsAnalytics: LessonAnalytics[];
  topPerformingStudents: StudentPerformance[];
  assignmentTypeBreakdown: AssignmentTypeStats[];
  gradeDistribution: GradeDistribution;
}

// Individual lesson analytics within course
export interface LessonAnalytics {
  lessonId: number;
  lessonTitle: string;
  assignmentCount: number;
  averagePerformance: number;
  completionRate: number;
  studentsAtRisk: number;
  quizStats: QuizAnalyticsStats[];
}

// Student performance across entire course
export interface StudentPerformance {
  studentId: number;
  name: string;
  email: string;
  overallAverage: number;
  letterGrade: string;
  assignmentsCompleted: number;
  totalAssignments: number;
  lessonsProgress: LessonProgress[];
}

// Progress per lesson for a student
export interface LessonProgress {
  lessonId: number;
  lessonTitle: string;
  averageScore: number;
  assignmentsCompleted: number;
  totalAssignments: number;
}

// Assignment type statistics
export interface AssignmentTypeStats {
  type: string;
  count: number;
  averageScore: number;
  completionRate: number;
}

// Grade distribution across course
export interface GradeDistribution {
  A: number;
  B: number;
  C: number;
  D: number;
  F: number;
}

// Enhanced quiz analytics
export interface QuizAnalyticsStats {
  quizId: number;
  title: string;
  type: string;
  average: number;
  max: number;
  min: number;
  submissions: number;
  studentResults: StudentQuizResult[];
}

// Individual student result for a quiz
export interface StudentQuizResult {
  studentId: number;
  name: string;
  email: string;
  mark: number;
  maxPoints: number;
  percentage: number;
  letterGrade: string;
  submissionDate: string;
  status: 'completed' | 'pending' | 'late';
}

export interface LessonWithQuizzes {
  id: number;
  title: string;
  description: string;
  quizzes: QuizSummary[];
  analytics?: LessonAnalytics;
}

export interface QuizSummary {
  id: number;
  title: string;
  type: string;
  dueDate: string;
  maxPoints: number;
  weight: number;
  attempts: number;
  isEditable: boolean;
  students?: StudentQuizResult[];
  analytics?: QuizAnalyticsStats;
}

export interface EnrolledStudent {
  id: number;
  name: string;
  email: string;
}

export interface QuizParticipant {
  id: number;
  name: string;
  email: string;
  mark: number;
  maxPoints: number;
  percentage: number;
  submissionDate: string;
  hasSubmitted: boolean;
  isEditable: boolean;
}

export interface CreateManualQuizRequest {
  name: string;
  description: string;
  courseId: number;
  lessonId: number;
  maxPoints: number;
  type: string;
}

export interface UpdateManualMarksRequest {
  quizId: number;
  studentMarks: {
    userId: number;
    mark: number;
    maxPoints: number;
  }[];
}



export const quizApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get quiz data by identifiers
    getQuizDataByQuizId: builder.query<Quiz, QuizIdentifiers>({
      query: ({ courseId, lessonId, quizId, formId }) => ({
        url: `quizzes/quiz/?courseId=${courseId}&lessonId=${lessonId}&quizId=${quizId}&formId=${formId}`,
      }),
    }),

    // Update an existing quiz
    updateQuiz: builder.mutation<
      { message: string },
      { id: number; data: UpdateQuizRequest }
    >({
      query: ({ id, data }) => {
        const formData = new FormData();
        
        // Handle questions with image files
        const processedQuestions = data.questions?.map((question, index) => {
          const processedQuestion = { ...question };
          
          // If the question has an image file, add it to FormData and remove it from question data
          if (question.imageFile) {
            formData.append(`question-${index}-image`, question.imageFile);
            delete processedQuestion.imageFile; // Remove from question data
            delete processedQuestion.imageUrl;  // Remove preview URL (backend will generate proper URL)
          } else {
            // If no new image file, preserve existing imageUrl for backend
            // Remove imageFile key even if it doesn't exist to keep data clean
            delete processedQuestion.imageFile;
          }
          
          return processedQuestion;
        });
        
        // Append all non-file fields to formData
        Object.entries(data).forEach(([key, value]) => {
          if (key === 'questions') {
            // Use processed questions (without imageFile objects)
            formData.append(key, JSON.stringify(processedQuestions));
          } else if (key === 'settings') {
            // Stringify settings object
            formData.append(key, JSON.stringify(value));
          } else if (value !== undefined && value !== null) {
            // Convert other values to strings
            formData.append(key, String(value));
          }
        });

        return {
          url: `quizzes/${id}`,
          method: 'PATCH',
          body: formData,
          // Don't set Content-Type header - let the browser set it with the correct boundary
          headers: {},
        };
      },
      invalidatesTags: (_, __, { id }) => [
        { type: "Quiz", id },
        "Quiz",
      ],
    }),

    // New endpoints for Tasks component
    // Get all courses with lessons and quizzes
    getCoursesWithData: builder.query<CourseWithData[], void>({
      query: () => ({
        url: 'quizzes/courses-with-data',
      }),
      providesTags: ['Course', 'Quiz'],
    }),

    // Get lessons with quizzes for a specific course
    getLessonsWithQuizzes: builder.query<LessonWithQuizzes[], number>({
      query: (courseId) => ({
        url: `quizzes/course/${courseId}/lessons`,
      }),
      providesTags: (result, error, courseId) => [
        { type: 'Course', id: courseId },
        'Quiz',
      ],
    }),

    // Get quiz participants with marks
    getQuizParticipants: builder.query<QuizParticipant[], { quizId: number; courseId: number }>({
      query: ({ quizId, courseId }) => ({
        url: `quizzes/quiz/${quizId}/participants?courseId=${courseId}`,
      }),
      providesTags: (result, error, { quizId }) => [
        { type: 'Quiz', id: quizId },
        'QuizAttempt',
      ],
    }),

    // Create manual quiz for practical assessments
    createManualQuiz: builder.mutation<{ quiz: any; resource: any }, CreateManualQuizRequest>({
      query: (quizData) => ({
        url: 'quizzes/manual-quiz',
        method: 'POST',
        body: quizData,
      }),
      invalidatesTags: (result, error, { courseId, lessonId }) => [
        { type: 'Course', id: courseId },
        'Quiz',
      ],
    }),

    // Update manual marks for students
    updateManualMarks: builder.mutation<{ message: string; updates: any[] }, UpdateManualMarksRequest>({
      query: (marksData) => ({
        url: 'quizzes/update-manual-marks',
        method: 'PUT',
        body: marksData,
      }),
      invalidatesTags: (result, error, { quizId }) => [
        { type: 'Quiz', id: quizId },
        'QuizAttempt',
      ],
    }),

    // Get quiz details (bonus endpoint)
    getQuizDetails: builder.query<any, number>({
      query: (quizId) => ({
        url: `quizzes/quiz/${quizId}/details`,
      }),
      providesTags: (result, error, quizId) => [
        { type: 'Quiz', id: quizId },
      ],
    }),

    // Get comprehensive course analytics with all lesson data
    getCourseAnalytics: builder.query<CourseAnalytics, number>({
      query: (courseId) => ({
        url: `courses/${courseId}/analytics`,
      }),
      providesTags: (result, error, courseId) => [
        { type: 'Course', id: courseId },
        'Quiz',
        'QuizAttempt',
      ],
    }),
  }),
});

export const {
  // Existing hooks
  useUpdateQuizMutation,
  useGetQuizDataByQuizIdQuery,
  
  // New hooks for Tasks component
  useGetCoursesWithDataQuery,
  useGetLessonsWithQuizzesQuery,
  useGetQuizParticipantsQuery,
  useCreateManualQuizMutation,
  useUpdateManualMarksMutation,
  useGetQuizDetailsQuery,
  useGetCourseAnalyticsQuery,
} = quizApi;
