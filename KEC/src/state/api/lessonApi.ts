import { apiSlice } from "./apiSlice";

// Quiz related stuffs

// Backend Quiz Schema
interface Quiz {
  id: number;
  name: string;
  description?: string;
  questions: QuizQuestion[];
  settings: QuizSettings;
  createdAt: string;
  updatedAt: string;
}

interface QuizQuestion {
  id: number;
  type: 'multiple' | 'checkbox' | 'truefalse' | 'short' | 'long' | 'number';
  question: string;
  description?: string;
  options?: string[]; // For multiple choice, checkbox, true/false
  correctAnswers?: string[]; // For validation
  points: number;
  required: boolean;
  order: number;
}

interface QuizSettings {
  shuffleQuestions: boolean;
  timeLimit: number; // in minutes, 0 = no limit
  showResults: boolean;
  allowRetakes: boolean;
  passingScore: number; // 0-100 percentage
  maxAttempts: number; // 0 = unlimited
}

// API Response Structure
interface QuizResponse {
  success: boolean;
  message: string;
  data: {
    quiz: Quiz;
    totalPoints: number;
    questionCount: number;
  };
}


// Types
export interface Lesson {
  id: number;
  title: string;
  content: string;
  description: string;
  courseId: number;
  resources?: Resource[];
  createdAt?: string;
  updatedAt?: string;
  isUnlocked?: boolean;
  order?: number;
}

export interface Resource {
  id: number;
  url: string;
  title?: string;
  type?: string;
  size?: string;
  duration?: string;
  uploadedAt?: string;
  quiz?: any;
}

export interface CreateLessonRequest {
  courseId: number;
  title: string;
  description: string;
  content?: string;
  isUnlocked?: boolean;
  order?: number;
}

export interface UpdateLessonRequest {
  id: number;
  title?: string;
  description?: string;
  content?: string;
  isUnlocked?: boolean;
  order?: number;
}

export interface DeleteLessonRequest {
  id: number;
  courseId: number;
}

export interface ToggleLessonLockRequest {
  id: number;
  isUnlocked: boolean;
  courseId: number;
}

export interface AddResourceRequest {
  lessonId: number;
  title: string;
  file?: File;
  type: string;
  url?: string;
  description?: string;
  courseId?: number;
}

export interface DeleteResourceRequest {
  lessonId: number;
  resourceId: number;
}

export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  success: boolean;
}

export const lessonApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create new lesson
    createLesson: builder.mutation<ApiResponse<Lesson>, CreateLessonRequest>({
      query: ({ courseId, title, description }) => ({
        url: `/lesson`,
        method: "POST",
        body: { 
          courseId, 
          title, 
          description, 
        },
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Lesson", id: "LIST" },
        { type: "Lesson", id: courseId },
        { type: "Course", id: courseId },
      ],
    }),

    // Get all lessons by course ID
    getLessonByCourseId: builder.query<Lesson[], number>({
      query: (courseId) => ({
        url: `/lesson/lesson-by-course/${courseId}`,
        method: "GET",
      }),
      providesTags: (result, error, courseId) => [
        { type: "Lesson", id: "LIST" },
        { type: "Lesson", id: courseId },
      ],
      transformResponse: (response: any) => {
        return response || [];
      },
    }),

    // Get single lesson by ID
    getLessonById: builder.query<Lesson, number>({
      query: (id) => ({
        url: `/lesson/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Lesson", id }],
    }),

    // Delete lesson
    deleteLesson: builder.mutation<ApiResponse, DeleteLessonRequest>({
      query: ({ id, courseId }) => ({
        url: `/lesson/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id, courseId }) => [
        { type: "Lesson", id },
        { type: "Lesson", id: "LIST" },
        { type: "Lesson", id: courseId },
        { type: "Course", id: courseId },
      ],
    }),

    // Toggle lesson lock status
    toggleLessonLock: builder.mutation<ApiResponse<Lesson>, ToggleLessonLockRequest>({
      query: ({ id, isUnlocked, courseId }) => ({
        url: `/lesson/lock/${id}`,
        method: "PATCH",
        body: { isUnlocked, courseId },
      }),
      invalidatesTags: (result, error, { id, courseId }) => [
        { type: "Lesson", id },
        { type: "Lesson", id: "LIST" },
        { type: "Lesson", id: courseId },
      ],
    }),

    // Update existing lesson
    updateLesson: builder.mutation<ApiResponse<Lesson>, UpdateLessonRequest>({
      query: ({ id, ...patch }) => ({
        url: `/lesson/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Lesson", id },
        { type: "Lesson", id: "LIST" },
      ],
    }),

    // Add resource to lesson
    addResource: builder.mutation<{message:string},AddResourceRequest>({
      query: ({ lessonId, title, file, type, description, url, courseId }) => {
        if (file) {
          // File upload (PDF, Word)
          const formData = new FormData();
          formData.append("lessonId", lessonId.toString());
          formData.append("title", title);
          formData.append("file", file);
          formData.append("type", type);

          return {
            url: `/lesson/${lessonId}/resources`,
            method: "POST",
            body: formData,
          };
        } else if (type === "video" && url) {
          // Video link
          return {
            url: `/lesson/${lessonId}/video`,
            method: "POST",
            body: {
              name: title,
              url: url,
              type: "video"
            },
          };
        } else if (type === "quiz") {
          if (!courseId) {
            throw new Error("Course ID is required to create a quiz");
          }
          
          return {
            url: `/module/course/${courseId}/lesson/${lessonId}/quiz`,
            method: "POST",
            body: {
              name: title,
              description: description || ""
            },
          };
        } else {
          throw new Error("Invalid resource type or missing required fields");
        }
      },
      invalidatesTags: (result, error, { lessonId }) => [
        { type: "Lesson", id: lessonId },
        { type: "Lesson", id: "LIST" },
      ],
    }),

    // Delete resource from lesson
    deleteResource: builder.mutation<ApiResponse, DeleteResourceRequest>({
      query: ({ lessonId, resourceId }) => ({
        url: `/lesson/${lessonId}/resources/${resourceId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { lessonId }) => [
        { type: "Lesson", id: lessonId },
        { type: "Lesson", id: "LIST" },
      ],
    }),

    // Reorder lessons
    reorderLessons: builder.mutation<
      ApiResponse,
      { courseId: number; lessonIds: number[] }
    >({
      query: ({ courseId, lessonIds }) => ({
        url: `/lesson/reorder/${courseId}`,
        method: "PUT",
        body: { lessonIds },
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Lesson", id: "LIST" },
        { type: "Lesson", id: courseId },
      ],
    }),

    // Duplicate lesson
    duplicateLesson: builder.mutation<ApiResponse<Lesson>, { id: number; courseId: number }>({
      query: ({ id }) => ({
        url: `/lesson/${id}/duplicate`,
        method: "POST",
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Lesson", id: "LIST" },
        { type: "Lesson", id: courseId },
        { type: "Course", id: courseId },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetLessonByCourseIdQuery,
  useGetLessonByIdQuery,
  useCreateLessonMutation,
  useUpdateLessonMutation,
  useDeleteLessonMutation,
  useToggleLessonLockMutation,
  useAddResourceMutation,
  useDeleteResourceMutation,
  useReorderLessonsMutation,
  useDuplicateLessonMutation,
} = lessonApi;