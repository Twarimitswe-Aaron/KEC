// src/quiz/dto/update-quiz.dto.ts
export class UpdateQuizDto {
  name?: string;
  description?: string;
  questions?: UpdateQuizQuestionDto[];

}

export class UpdateQuizQuestionDto {
  id?: number;
  type?: 'multiple' | 'checkbox' | 'truefalse' | 'short' | 'long' | 'number';
  question?: string;
  description?: string;
  options?: string[];
  required?: boolean;
  points?: number;
}