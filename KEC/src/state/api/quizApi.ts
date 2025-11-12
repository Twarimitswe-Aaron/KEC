// frontend/src/api/quizApi.ts
import { apiSlice } from "./apiSlice";
import { QuestionProp } from "./courseApi";

export interface QuizIdentifiers {
  courseId: number;
  lessonId: number;
  quizId: number;
  formId: number;
}


export interface QuizQuestion extends QuestionProp {
  imageUrl?: string;
  imageFile?: File;
}


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
        
        // Handle questions with image files
        const processedQuestions = data.questions?.map((question, index) => {
          const processedQuestion = { ...question };
          
          // If the question has an image file, add it to FormData and remove it from question data
          if (question.imageFile) {
            formData.append(`question-${index}-image`, question.imageFile);
            delete processedQuestion.imageFile; // Remove from question data
            delete processedQuestion.imageUrl;  // Remove preview URL (backend will generate proper URL)
          } else {
            // If no new image file, preserve existing imageUrl for backend
            // Remove imageFile key even if it doesn't exist to keep data clean
            delete processedQuestion.imageFile;
          }
          
          return processedQuestion;
        });
        
        // Append all non-file fields to formData
        Object.entries(data).forEach(([key, value]) => {
          if (key === 'questions') {
            // Use processed questions (without imageFile objects)
            formData.append(key, JSON.stringify(processedQuestions));
          } else if (key === 'settings') {
            // Stringify settings object
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
      invalidatesTags: (_, __, { id }) => [
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
