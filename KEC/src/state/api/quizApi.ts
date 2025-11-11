// frontend/src/api/quizApi.ts
import { apiSlice } from "./apiSlice";
import { QuestionProp } from "./courseApi";

export interface QuizIdentifiers {
  courseId: number;
  lessonId: number;
  quizId: number;
  formId: number;
}


export interface QuizQuestion extends QuestionProp {}


export interface QuizSettings {
  title: string;
  description?: string;
  showResults?: boolean;
  allowRetakes?: boolean;
  passingScore?: number;
}

export interface Quiz {
  id: number;
  name: string;
  description?: string;
  courseId: number;
  lessonId: number;
  formId: number;
  questions?: QuizQuestion[];
  settings?: QuizSettings;
}

export interface UpdateQuizRequest {
  name?: string;
  description?: string;
  courseId: number;
  lessonId: number;
  quizId: number;
  formId: number;
  questions?: QuizQuestion[];
  settings?: QuizSettings;
}
export const quizApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get quiz data by identifiers
    getQuizDataByQuizId: builder.query<Quiz, QuizIdentifiers>({
      query: ({ courseId, lessonId, quizId, formId }) => ({
        url: `quizzes/quiz/?courseId=${courseId}&lessonId=${lessonId}&quizId=${quizId}&formId=${formId}`,
      }),
    }),

    // Update an existing quiz
    updateQuiz: builder.mutation<
      { message: string },
      { id: number; data: UpdateQuizRequest }
    >({
      query: ({ id, data }) => {
        const formData = new FormData();
        
        // Append all fields to formData
        Object.entries(data).forEach(([key, value]) => {
          if (key === 'questions' || key === 'settings') {
            // Stringify objects and arrays
            formData.append(key, JSON.stringify(value));
          } else if (value !== undefined && value !== null) {
            // Convert other values to strings
            formData.append(key, String(value));
          }
        });

        return {
          url: `quizzes/${id}`,
          method: 'PATCH',
          body: formData,
          // Don't set Content-Type header - let the browser set it with the correct boundary
          headers: {},
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Quiz", id },
        "Quiz",
      ],
    }),
  }),
});


export const {
  useUpdateQuizMutation,
  useGetQuizDataByQuizIdQuery,
} = quizApi;
