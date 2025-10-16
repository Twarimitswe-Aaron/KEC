// frontend/src/api/quizApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { apiSlice } from './apiSlice';

export interface QuizQuestion {
  id?: number;
  type: 'multiple' | 'checkbox' | 'truefalse' | 'short' | 'long' | 'number';
  question: string;
  description?: string;
  options?: string[];
  required?: boolean;
  points?: number;
}

export interface QuizSettings {
  title: string;
  description?: string;
  shuffleQuestions?: boolean;
  timeLimit?: number;
  showResults?: boolean;
  allowRetakes?: boolean;
  passingScore?: number;
}

export interface Quiz {
  id: number;
  name: string;
  description?: string;
  questions: QuizQuestion[];
  settings?: QuizSettings;
  resource?: any;
  attempts?: any[];
}

export interface CreateQuizRequest {
  name: string;
  description?: string;
  questions: QuizQuestion[];
  settings?: QuizSettings;
}

export interface UpdateQuizRequest {
  name?: string;
  description?: string;
  questions?: QuizQuestion[];
  settings?: QuizSettings;
}

export interface QuizAttempt {
  quizId: number;
  responses: {
    questionId: number;
    answer: string | string[];
  }[];
}

export const quizApi = apiSlice.injectEndpoints({
  
  endpoints: (builder) => ({
    // Quiz Management
    getQuiz: builder.query<Quiz, number>({
      query: (id) => `quizzes/${id}`,
      providesTags: (result, error, id) => [{ type: 'Quiz', id }],
    }),

    createQuiz: builder.mutation<Quiz, CreateQuizRequest>({
      query: (quizData) => ({
        url: 'quizzes',
        method: 'POST',
        body: quizData,
      }),
      invalidatesTags: ['Quiz'],
    }),

    updateQuiz: builder.mutation<Quiz, { id: number; data: UpdateQuizRequest }>({
      query: ({ id, data }) => ({
        url: `quizzes/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Quiz', id },
        'Quiz',
      ],
    }),

    deleteQuiz: builder.mutation<void, number>({
      query: (id) => ({
        url: `quizzes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Quiz'],
    }),

    // Quiz Attempts
    submitQuizAttempt: builder.mutation<any, QuizAttempt>({
      query: (attemptData) => ({
        url: `quizzes/${attemptData.quizId}/attempts`,
        method: 'POST',
        body: attemptData,
      }),
      invalidatesTags: (result, error, { quizId }) => [
        { type: 'QuizAttempt', id: quizId },
      ],
    }),

    getQuizAttempts: builder.query<any[], number>({
      query: (quizId) => `quizzes/${quizId}/attempts`,
      providesTags: (result, error, quizId) => [
        { type: 'QuizAttempt', id: quizId },
      ],
    }),

    // Get quizzes by module/lesson
    getQuizzesByModule: builder.query<Quiz[], number>({
      query: (moduleId) => `quizzes?moduleId=${moduleId}`,
      providesTags: ['Quiz'],
    }),

    getQuizzesByLesson: builder.query<Quiz[], number>({
      query: (lessonId) => `quizzes?lessonId=${lessonId}`,
      providesTags: ['Quiz'],
    }),
  }),
});

export const {
  useGetQuizQuery,
  useCreateQuizMutation,
  useUpdateQuizMutation,
  useDeleteQuizMutation,
  useSubmitQuizAttemptMutation,
  useGetQuizAttemptsQuery,
  useGetQuizzesByModuleQuery,
  useGetQuizzesByLessonQuery,
} = quizApi;