import { apiSlice } from "./apiSlice";

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
  file: File;
  type: string;
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
      query: ({ courseId, title, description, content, isUnlocked, order }) => ({
        url: `/lesson`,
        method: "POST",
        body: { 
          courseId, 
          title, 
          description, 
          content: content || description,
          isUnlocked: isUnlocked ?? true,
          order: order || 0
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
        { type: "Lesson" as const, id: "LIST" },
        { type: "Lesson" as const, id: courseId },
      ],
    }),

    // Get single lesson by ID
    getLessonById: builder.query<Lesson, number>({
      query: (id) => ({
        url: `/lesson/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Lesson" as const, id }],
    }),

     // Delete lesson
    deleteLesson: builder.mutation<ApiResponse, DeleteLessonRequest>({
      query: ({ id }) => ({
        url: `/lesson/lesson/${id}`,
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
      query: ({ id, isUnlocked,courseId }) => ({
        url: `/lesson/lock/${id}`,
        method: "PATCH",
        body: { isUnlocked ,courseId},

      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Lesson", id },
        { type: "Lesson", id: "LIST" },
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
    addResource: builder.mutation<ApiResponse<Resource>, AddResourceRequest>({
      query: ({ lessonId, title, file, type }) => {
        const formData = new FormData();
        formData.append('lessonId', lessonId.toString());
        formData.append('title', title);
        formData.append('file', file);
        formData.append('type', type);
        
        return {
          url: `/lesson/${lessonId}/resources`,
          method: "POST",
          body: formData,
        };
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