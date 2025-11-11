import { apiSlice } from "./apiSlice";

export interface CreateCourseDto {
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
export interface QuestionProp {
  id: number;
  type: "multiple" | "checkbox" | "truefalse" | "labeling";
  question: string;
  description?: string;
  correctAnswers?: (string|number)[];
  options?: string[];
  points: number;
  required: boolean;
  quizId: number;
  imageUrl?: string;
  labelAnswers?: { label: string; answer: string }[];
  order?: number;
}
export interface FormDataQuiz {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  quizzes: QuizData[];
}

export interface QuizData {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  required: boolean;
  points: number;
  questions: QuestionProp[];
}
export interface Resources {
  id: number;
  name: string;
  type: string;
  size?: string;
  uploadedAt: string;
  url?: string;
  form?: FormDataQuiz;
}

export interface Lessons {
  id: number;
  title: string;
  description: string;
  isUnlocked: boolean;
  createdAt: string;
  resources: Resources[];
  courseId?: number;
}
export interface CourseData {
  id: number;
  title: string;
  description: string;
  price: string;
  image_url: string;
  no_lessons: string;
  open: boolean;
  isConfirmed: boolean;
  maximum: number;
  createdAt: string;
  updatedAt: string;
  lesson: Lessons[];
  uploader: UploaderInfo;
}

export interface CourseToUpdate {
  id: number;
  title: string;
  description: string;
  coursePrice: string;
  maximum?: number;
  open: boolean;
  image?: File;
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

    getCourses: builder.query<CourseData[], { unconfirmed?: boolean } | void>({
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

    updateCourse: builder.mutation<{ message: string }, CourseToUpdate>({
      query: (formData) => {
        return {
          url: "/course/update-course",
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: (_result, _error, formData) => {
        const id = formData.id;

        return [
          {
            type: "Course" as const,
            id: id ? String(id) : "LIST",
          },
        ];
      },
    }),

    getCourseData: builder.query<CourseData, number>({
      query: (id) => `/course/course/${id}`,
      providesTags: (result, error, id) => [
        { type: "Course", id },
        ...(result?.lesson.map((lesson) => ({
          type: "Lesson" as const,
          id: lesson.id,
        })) || []),
      ],
    }),
  }),
});

export const {
  useCreateCourseMutation,
  useGetCoursesQuery: useCoursesQuery,
  useConfirmCourseMutation,
  useDeleteCourseMutation,
  useUpdateCourseMutation,
  useGetCourseDataQuery,
} = courseApi;
