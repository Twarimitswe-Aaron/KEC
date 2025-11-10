// frontend/src/api/quizApi.ts
import { apiSlice } from "./apiSlice";
import { FormDataQuiz, QuestionProp, QuizData } from "./courseApi";

export interface QuizQuestion extends  QuestionProp {
}

export interface QuizSettings {
  title: string;
  description?: string;
  showResults?: boolean;
  allowRetakes?: boolean;
  passingScore?: number;
}

export interface Quiz  extends QuizData,quizHelper{
  settings?: QuizSettings;
}


export interface UpdateQuizRequest extends quizHelper  {
  name?: string;
  description?: string;
  questions?: QuizQuestion[];
  settings?: QuizSettings;
}

export interface quizHelper {
  courseId: number;
  lessonId: number;
  quizId: number;
  formId:number;
}

export const quizApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getQuizDataByQuizId: builder.query<Quiz, quizHelper>({
      query: (quizHelper) => ({
        url: `quizzes/quiz/?courseId=${quizHelper.courseId}&lessonId=${quizHelper.lessonId}&quizId=${quizHelper.quizId}&formId=${quizHelper.formId}`,
      })
    }),

    updateQuiz: builder.mutation<
      { message: string },
      {
        id: number;
      
        data: UpdateQuizRequest;
      }
    >({
      query: ({  id, data }) => ({
        url: `quizzes/${id}`,
        method: "PATCH",
        body: data,
      }),
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
