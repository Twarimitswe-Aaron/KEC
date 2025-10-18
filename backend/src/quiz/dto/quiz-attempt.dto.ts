// src/quiz/dto/quiz-attempt.dto.ts
export class CreateQuizAttemptDto {
  quizId: number;
  responses: QuizResponseDto[];
}

export class QuizResponseDto {
  questionId: number;
  answer: string | string[];
}