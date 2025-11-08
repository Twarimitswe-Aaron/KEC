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

export interface QuizQuestion {
  id: number;
  type: string;
  question: string;
  options: string[];
  correctAnswer?: number;
  correctAnswers?: string[];
  required: boolean;
  points: number;
}

export interface Quiz {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  questions: QuizQuestion[];
}

export interface FormData {
  id: number;
  createdAt: string;
  quizzes: Quiz[];
}

export interface LessonResource {
  id: number;
  name: string;
  lessonId: number;
  type: string; // could be 'VIDEO' | 'PDF' | 'QUIZ' | etc.
  size?: string;
  createdAt: string;
  url?: string;
  form?: FormData; // present if resource type is QUIZ
}

export interface LessonData {
  id: number;
  title: string;
  description: string;
  isUnlocked: boolean;
  createdAt: string;
  resources: LessonResource[];
}


export interface CourseSummary {
  id: number;
  title: string;
  description: string;
  price: string;
  image_url: string;
  no_lessons: number | string;
  open?: boolean;
  uploader: UploaderInfo;
}

export interface CourseDetails extends CourseSummary {
  isConfirmed: boolean;
  maximum?: number | null;
  lesson: LessonData[];
  createdAt: string;
  updatedAt: string;
}


export const courseApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create Course
    createCourse: builder.mutation<{ message: string }, CreateCourseDto>({
      query: (body) => ({
        url: "/course/create-course",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Course", id: "LIST" }],
    }),

    // Get All Courses
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

    // Confirm Course
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

    // Delete Course
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

    // Update Course
    updateCourse: builder.mutation<{ message: string }, FormData>({
      query: (formData) => ({
        url: "/course/update-course",
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, error, formData) => {
        const id = formData.id;
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
  useGetCoursesQuery: useCoursesQuery,
  useConfirmCourseMutation,
  useDeleteCourseMutation,
  useUpdateCourseMutation,
  useGetCourseDataQuery,
} = courseApi;

