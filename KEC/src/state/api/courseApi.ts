import { apiSlice } from "./apiSlice";
interface createCourseDto {
  title: string;
  description: string;
  image_url: string;
  price: string;
  uploader: {
    id: number;
  };
}

export interface getAllUploaded {
  id: number;
  title: string;
  description: string;
  price: string;
  image_url: string;
  no_lessons: string;
  open: boolean;

  uploader: {
    id: number;
    email: string;
    name: string;
    avatar_url: string;
  };
}

export interface getSpecificCourseData {
  id: number;
  title: string;
  description: string;
  price: string;
  image_url: string;
  no_lessons: string;
  open: boolean;
  isConfirmed: boolean;
  maximum: number;
  lesson: {
    id: number;
    title: string;
    content: string;
    resources: { id: number; url: string }[];
  }[];
  uploader: {
    id: number;
    email: string;
    name: string;
    avatar_url: string;
  };
}

export const courseApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createCourse: builder.mutation<{ message: string }, createCourseDto>({
      query: (body) => ({
        url: "/course/create-course",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Course"],
    }),
    getUploadedCourses: builder.query<getAllUploaded[], void>({
      query: () => "/course/get-uploaded-courses",
      providesTags: ["Course"],
    }),
    getUnconfirmedCourses: builder.query<getAllUploaded[], void>({
      query: () => "/course/get-unconfirmed-courses",
      providesTags: ["Course"],
    }),
    confirmCourse: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: "/course/confirm-course",
        method: "POST",
        body: { id },
      }),
      invalidatesTags: ["Course"],
    }),
    deleteCourse: builder.mutation<{ message: String }, number>({
      query: (id) => ({
        url: "/course/delete-course",
        method: "POST",
        body: { id },
      }),
      invalidatesTags: ["Course"],
    }),
    updateCourse: builder.mutation<{ message: string }, FormData>({
      query: (formData) => ({
        url: `/course/update-course`,
        method: "PUT",
        body: formData,
      }),
      // More specific invalidation (optional, better)
      invalidatesTags: (result, error, formData) => {
        const courseId = formData.get("id");
        return [
          {
            type: "Course",
            id:
              typeof courseId === "string" || typeof courseId === "number"
                ? courseId
                : undefined,
          },
        ];
      },
    }),

    getCourseData: builder.query<getSpecificCourseData, number>({
      query: (id) => `/course/course/${id}`,
      providesTags: ["Course"],
    }),
  }),
});

export const {
  useCreateCourseMutation,
  useGetUploadedCoursesQuery,
  useGetUnconfirmedCoursesQuery,
  useConfirmCourseMutation,
  useDeleteCourseMutation,
  useUpdateCourseMutation,
  useGetCourseDataQuery,
} = courseApi;
