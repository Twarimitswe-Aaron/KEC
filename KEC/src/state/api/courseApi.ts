import { apiSlice } from "./apiSlice";

interface CreateCourseDto {
  title: string;
  description: string;
  image_url: string;
  price: string;
  uploader: { id: number };
}

export interface UploaderInfo {
  id: number;
  email: string;
  name: string;
  avatar_url: string;
}

export interface CourseSummary {
  id: number;
  title: string;
  description: string;
  price: string;
  image_url: string;
  no_lessons: string;
  open: boolean;
  uploader: UploaderInfo;
}

export interface LessonResource {
  id: number;
  url: string | null;
}

export interface LessonData {
  id: number;
  title: string;
  content: string;
  resources: LessonResource[];
}

export interface CourseDetails extends CourseSummary {
  isConfirmed: boolean;
  maximum: number;
  lesson: LessonData[];
}

export const courseApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createCourse: builder.mutation<{ message: string }, CreateCourseDto>({
      query: (body) => ({
        url: "/course/create-course",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Course", id: "LIST" }],
    }),

    getCourses: builder.query<CourseSummary[], { unconfirmed?: boolean } | void>({
      query: (params) =>
        params?.unconfirmed
          ? "/course/get-unconfirmed-courses"
          : "/course/get-uploaded-courses",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Course" as const, id })),
              { type: "Course", id: "LIST" },
            ]
          : [{ type: "Course", id: "LIST" }],
    }),

    confirmCourse: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: "/course/confirm-course",
        method: "POST",
        body: { id },
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Course", id },
        { type: "Course", id: "LIST" },
      ],
    }),

    deleteCourse: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: "/course/delete-course",
        method: "POST",
        body: { id },
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Course", id },
        { type: "Course", id: "LIST" },
      ],
    }),

    updateCourse: builder.mutation<{ message: string }, FormData>({
      query: (formData) => ({
        url: "/course/update-course",
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, error, formData) => {
        const id = formData.get("id");
        return [
          { type: "Course", id: typeof id === "string" || typeof id === "number" ? id : "LIST" },
        ];
      },
    }),

    getCourseData: builder.query<CourseDetails, number>({
      query: (id) => `/course/course/${id}`,
      providesTags: (result, error, id) => [
        { type: "Course", id },
        ...(result?.lesson.map((lesson) => ({ type: "Lesson" as const, id: lesson.id })) || []),
      ],
    }),
  }),
});

export const {
  useCreateCourseMutation,
 useGetCoursesQuery: useCoursesQuery, // versatile: both uploaded and unconfirmed
  useConfirmCourseMutation,
  useDeleteCourseMutation,
  useUpdateCourseMutation,
  useGetCourseDataQuery,
} = courseApi;
