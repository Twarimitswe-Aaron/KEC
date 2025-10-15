import { apiSlice } from "./apiSlice";

// Types
interface Lesson {
  id: number;
  title: string;
  content: string;
  description: string;
  courseId: number;
  resources?: Resource[];
  createdAt?: string;
  updatedAt?: string;
}

interface Resource {
  id: number;
  url: string;
  title?: string;
  type?: string;
}

interface CreateLessonRequest {
  courseId: number;
  title: string;
  description: string;
}

interface UpdateLessonRequest {
  id: number;
  title?: string;
  description?: string;
  content?: string;
}

interface DeleteLessonRequest {
  id: number;
  courseId: number;
}

interface ApiResponse {
  message: string;
  data?: any;
}

export const lessonApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all lessons by course ID
    getLessonByCourseId: builder.query<Lesson[], number>({
      query: (id) => ({
        url: `/lesson/lesson-by-course/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        { type: "Lesson", id: "LIST" },
        { type: "Lesson", id },
      ],
    }),

    // Get single lesson by ID
    getLessonById: builder.query<Lesson, number>({
      query: (id) => ({
        url: `/lesson/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Lesson", id }],
    }),

    // Create new lesson
    createLesson: builder.mutation<ApiResponse, CreateLessonRequest>({
      query: ({ courseId, title, description }) => ({
        url: `/modules/${courseId}`,
        method: "POST",
        body: { title, description },
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Lesson", id: "LIST" },
        { type: "Lesson", id: courseId },
        { type: "Course", id: courseId },
      ],
    }),

    // Update existing lesson
    updateLesson: builder.mutation<ApiResponse, UpdateLessonRequest>({
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

    // Delete lesson
    deleteLesson: builder.mutation<ApiResponse, DeleteLessonRequest>({
      query: ({ id }) => ({
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

    // Reorder lessons (if you need drag & drop functionality)
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
    duplicateLesson: builder.mutation<ApiResponse, { id: number; courseId: number }>({
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

    // Toggle lesson visibility/lock status
    toggleLessonVisibility: builder.mutation<
      ApiResponse,
      { id: number; isVisible: boolean }
    >({
      query: ({ id, isVisible }) => ({
        url: `/lesson/${id}/visibility`,
        method: "PATCH",
        body: { isVisible },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Lesson", id },
        { type: "Lesson", id: "LIST" },
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
  useReorderLessonsMutation,
  useDuplicateLessonMutation,
  useToggleLessonVisibilityMutation,
} = lessonApi;