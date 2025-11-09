import { apiSlice } from "./apiSlice";
import { AddResourceRequest } from "./lessonApi";

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

// FormData can be either the form fields or a browser FormData for file uploads
export type FormData = {
  id: number;
  title: string;
  description: string;
  coursePrice: string;
  maximum?: number | null;
  open: boolean;
  image?: File | string;
  imageChanged?: string;
  image_url?: string;
} | globalThis.FormData;

export interface LessonResource {
  id: number;
  name: string;
  lessonId: number;
  type: string;
  size?: string;
  createdAt: string;
  url?: string;
  form?: FormDataQuiz;
}

export interface FormDataQuiz{
  id:number;
  name:string;
  description:string;
  createdAt:string;
  updatedAt:string;
  questions:QuestionProp[];
}

export interface QuestionProp{
  id:number;
  type:string;
  question:string;
  options:any[];
  points:number;
  required:boolean;
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

export interface Resources{
  id:number;
  name:string;
  type:string;
  size:string;
  createdAt:string;
  url?:string;
  form?:FormData;
 

}

export interface Lessons{
  id:number;
  title:string;
  description:string;
  isUnlocked:string;
  createdAt:string;
  resources:Resources[];

}
export interface CourseData{
  id:number;
  title:string;
  description:string;
  price:string;
  image_url:string;
  no_lessons:string;
  open:boolean;
  isConfirmed:boolean;
  maximum:number;
  createdAt:string;
  updatedAt:string;
  lesson:Lessons[];
   uploader:UploaderInfo;
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

    // Get All Courses
    getCourses: builder.query<
      CourseSummary[],
      { unconfirmed?: boolean } | void
    >({
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
      query: (formData) => {
        // If it's already a FormData object, use it directly
        if (formData instanceof globalThis.FormData) {
          return {
            url: "/course/update-course",
            method: "PUT",
            body: formData,
            // Important: Don't set Content-Type, let the browser set it with the correct boundary
            headers: {},
          };
        }
        
        // Otherwise, send as JSON
        return {
          url: "/course/update-course",
          method: "PUT",
          body: formData,
          headers: {
            'Content-Type': 'application/json',
          },
        };
      },
      invalidatesTags: (_result, _error, formData) => {
        // Handle both FormData object and our custom form data type
        const id = formData instanceof globalThis.FormData 
          ? formData.get('id')
          : formData.id;
        
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
