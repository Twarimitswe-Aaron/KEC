// src/quiz/dto/update-quiz.dto.ts
import { QuizSettingsDto } from './create-quiz.dto';

export class UpdateQuizDto {
  name?: string;
  description?: string;
  questions?: UpdateQuizQuestionDto[];
  settings?: QuizSettingsDto;
  courseId?: number;
  lessonId?: number;
}

export class UpdateQuizQuestionDto {
  id?: number;
  type?: 'multiple' | 'checkbox' | 'truefalse' | 'short' | 'long' | 'number';
  question?: string;
  description?: string;
  options?: string[];
  correctAnswer?: number; // For single-answer questions (index)
  correctAnswers?: number[]; // For multi-answer questions (array of indices)
  required?: boolean;
  points?: number;
}