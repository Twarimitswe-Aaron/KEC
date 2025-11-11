// src/quiz/dto/update-quiz.dto.ts
import { QuizSettingsDto } from './create-quiz.dto';
import { Express } from 'express';

export class UpdateQuizDto {
  name?: string;
  description?: string;
  questions?: UpdateQuizQuestionDto[];
  settings?: any; // Changed from QuizSettingsDto to any to be more flexible
  lessonId: number;
  courseId: number;
  quizId?: number;
  formId?: number;
  imageUrl?: string; // For quiz cover image
  imageFile?: Express.Multer.File; // For file upload
}

export class LabelAnswerPair {
  label: string;
  answer: string;
}

export class UpdateQuizQuestionDto {
  id: number;
  type: 'multiple' | 'checkbox' | 'truefalse' | 'labeling';

  question?: string;
  description?: string;
  options?: string[];
  correctAnswer?: number | string; // For single-answer questions (index or text)
  correctAnswers?: (number | string)[]; // For multi-answer questions (array of indices or text)
  required?: boolean;
  points?: number;
  imageUrl?: string; // For storing the URL of the uploaded image
  imageFile?: Express.Multer.File; // For file upload
  labelAnswers?: LabelAnswerPair[]; // For labeling questions
}