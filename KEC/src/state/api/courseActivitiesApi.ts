import { apiSlice } from "./apiSlice";

export interface StudentQuizAttempt {
  id: number;
  quizId: number;
  quizTitle: string;
  quizType: string;
  courseId: number;
  courseTitle: string;
  lessonId: number;
  lessonTitle: string;
  score: number;
  totalPoints: number;
  percentage: number;
  submittedAt: string;
  marksFileUrl: string | null;
  isManual: boolean;
  feedback: string | null;
}

export const courseActivitiesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStudentQuizAttempts: builder.query<
      StudentQuizAttempt[],
      { studentId: number; courseId?: string }
    >({
      query: ({ studentId, courseId }) => {
        let url = `quizzes/student/${studentId}`;
        if (courseId) {
          url += `?courseId=${courseId}`;
        }
        return url;
      },
      providesTags: ["Quiz"],
    }),
  }),
});

export const { useGetStudentQuizAttemptsQuery } = courseActivitiesApi;
