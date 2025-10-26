// frontend/src/api/quizApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { apiSlice } from './apiSlice';

export interface QuizQuestion {
  id?: number;
  type: 'multiple' | 'checkbox' | 'truefalse' | 'short' | 'long' | 'number' | 'labeling';
  question: string;
  description?: string;
  options?: string[];
  correctAnswers?: (string | number)[]; // Array of correct answers (indices or values)
  correctAnswer?: string | number; // For single correct answer types
  labelAnswers?: { label: string; answer: string }[]; // For labeling questions
  required?: boolean;
  points?: number;
  order?: number;
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
  createdAt?: string;
  updatedAt?: string;
  courseId?: number;
  lessonId?: number;
}

export interface CreateQuizRequest {
  name: string;
  description?: string;
  courseId: number;
  lessonId: number;
}

export interface UpdateQuizRequest {
  name?: string;
  description?: string;
  questions?: QuizQuestion[];
  settings?: QuizSettings;
  courseId?: number;
  lessonId?: number;
}

export interface QuizAttempt {
  quizId: number;
  responses: {
    questionId: number;
    answer: string | string[];
  }[];
}

export interface QuizAttemptResult {
  id: number;
  quizId: number;
  userId: number;
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  submittedAt: string;
  responses: {
    questionId: number;
    question: string;
    userAnswer: string | string[];
    correctAnswer: string | string[];
    isCorrect: boolean;
    points: number;
    earnedPoints: number;
  }[];
}

export interface CreateQuizResourceRequest {
  resourceData: {
    moduleId?: number;
    lessonId?: number;
    name: string;
    description?: string;
    type: 'quiz';
  };
  quizData: CreateQuizRequest;
}

export interface quizHelper{
  courseId:number;
  lessonId:number;
  quizId:number;
}

export const quizApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Quiz Management
    getQuiz: builder.query<Quiz, number>({
      query: (id) => `quizzes/${id}`,
      providesTags: (result, error, id) => [{ type: 'Quiz', id }],
      transformResponse: (response: any) => {
        // Transform the response to ensure correctAnswers and correctAnswer are properly handled
        if (response.questions) {
          response.questions = response.questions.map((q: any) => ({
            ...q,
            correctAnswers: q.correctAnswers || [],
            correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : undefined
          }));
        }
        return response;
      },
    }),
    getQuizDataByQuizId: builder.query<Quiz, quizHelper>({
      query: (quizHelper) => ({
        url: `quizzes/quiz/?courseId=${quizHelper.courseId}&lessonId=${quizHelper.lessonId}&quizId=${quizHelper.quizId}`,
      }),
      transformResponse: (response: any): Quiz => {
        if (!response) {
          throw new Error('No response data received');
        }
        
        // Transform the response to match the Quiz interface
        return {
          id: response.id,
          name: response.name || '',
          description: response.description || '',
          questions: Array.isArray(response.questions) 
            ? response.questions.map((q: any) => ({
                id: q.id || Date.now(),
                type: q.type || 'multiple',
                question: q.question || '',
                description: q.description || '',
                options: q.options || [],
                correctAnswers: q.correctAnswers || [],
                correctAnswer: q.correctAnswer,
                required: q.required || false,
                points: q.points || 1,
                imageUrl: q.imageUrl,
                labelAnswers: q.labelAnswers,
                label: q.label || '',
                answer: q.answer || '',
                order: q.order
              }))
            : [],
          settings: response.settings || {
            title: response.name || '',
            description: response.description || '',
            shuffleQuestions: false,
            timeLimit: 0,
            showResults: true,
            allowRetakes: false,
            passingScore: 0
          },
          courseId: response.courseId,
          lessonId: response.lessonId
        };
      }
    })
    ,

    createQuiz: builder.mutation<{message: string; id: number}, CreateQuizRequest>({
      query: (quizData) => ({
            url: `/lesson/course/${quizData.courseId}/lesson/${quizData.lessonId}/quiz`,
        method: 'POST',
        body: {
          name: quizData.name,
          description: quizData.description || ''
        },
      }),
      invalidatesTags: ['Quiz'],
    }),

    updateQuiz: builder.mutation<{message:string}, { id: number; data: UpdateQuizRequest }>({
      query: ({ id, data }) => ({
        url: `quizzes/${id}`,
        method: 'PATCH',
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
    submitQuizAttempt: builder.mutation<QuizAttemptResult, QuizAttempt>({
      query: (attemptData) => ({
        url: `quizzes/${attemptData.quizId}/attempts`,
        method: 'POST',
        body: attemptData,
      }),
      invalidatesTags: (result, error, { quizId }) => [
        { type: 'QuizAttempt', id: quizId },
      ],
    }),

    getQuizAttempts: builder.query<QuizAttemptResult[], number>({
      query: (quizId) => `quizzes/${quizId}/attempts`,
      providesTags: (result, error, quizId) => [
        { type: 'QuizAttempt', id: quizId },
      ],
    }),

    getUserQuizAttempts: builder.query<QuizAttemptResult[], { quizId: number; userId: number }>({
      query: ({ quizId, userId }) => `quizzes/${quizId}/attempts?userId=${userId}`,
      providesTags: (result, error, { quizId }) => [
        { type: 'QuizAttempt', id: quizId },
      ],
    }),



    // getQuizzesByLesson: builder.query<Quiz[], number>({
    //   query: (lessonId) => `quizzes?lessonId=${lessonId}`,
    //   providesTags: (result) =>
    //     result
    //       ? [
    //           ...result.map(({ id }) => ({ type: 'Quiz' as const, id })),
    //           'Quiz',
    //         ]
    //       : ['Quiz'],
    //   transformResponse: (response: any) => {
    //     // Transform each quiz in the response
    //     if (Array.isArray(response)) {
    //       return response.map(quiz => ({
    //         ...quiz,
    //         questions: quiz.questions?.map((q: any) => ({
    //           ...q,
    //           correctAnswers: q.correctAnswers || [],
    //           correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : undefined
    //         })) || []
    //       }));
    //     }
    //     return response;
    //   },
    // }),

    // Create quiz with resource linkage
    createQuizResource: builder.mutation<Quiz, CreateQuizResourceRequest>({
      query: ({ resourceData, quizData }) => ({
        url: 'resources/quiz',
        method: 'POST',
        body: { resourceData, quizData },
      }),
      invalidatesTags: ['Quiz', 'Resource'],
    }),



    // Get quiz statistics
    getQuizStatistics: builder.query<{
      totalAttempts: number;
      averageScore: number;
      passingRate: number;
      questionStatistics: Array<{
        questionId: number;
        question: string;
        correctAnswers: number;
        totalAttempts: number;
        successRate: number;
      }>;
    }, number>({
      query: (quizId) => `quizzes/${quizId}/statistics`,
      providesTags: (result, error, quizId) => [
        { type: 'Quiz', id: quizId },
      ],
    }),

    // Validate quiz answers (for manual review of text/number questions)
    validateQuizAnswers: builder.mutation<{
      score: number;
      totalPoints: number;
      results: Array<{
        questionId: number;
        isCorrect: boolean;
        earnedPoints: number;
        feedback?: string;
      }>;
    }, { quizId: number; responses: Array<{ questionId: number; answer: string }> }>({
      query: ({ quizId, responses }) => ({
        url: `quizzes/${quizId}/validate`,
        method: 'POST',
        body: { responses },
      }),
    }),

    // // Duplicate quiz
    // duplicateQuiz: builder.mutation<Quiz, { id: number; name: string }>({
    //   query: ({ id, name }) => ({
    //     url: `quizzes/${id}/duplicate`,
    //     method: 'POST',
    //     body: { name },
    //   }),
    //   invalidatesTags: ['Quiz'],
    // }),

    // Bulk update questions
    bulkUpdateQuestions: builder.mutation<Quiz, { id: number; questions: QuizQuestion[] }>({
      query: ({ id, questions }) => ({
        url: `quizzes/${id}/questions`,
        method: 'PUT',
        body: { questions },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Quiz', id },
        'Quiz',
      ],
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
  useGetUserQuizAttemptsQuery,
  
 
  useCreateQuizResourceMutation,
  useGetQuizStatisticsQuery,
  useValidateQuizAnswersMutation,
 useGetQuizDataByQuizIdQuery,
  useBulkUpdateQuestionsMutation,
} = quizApi;