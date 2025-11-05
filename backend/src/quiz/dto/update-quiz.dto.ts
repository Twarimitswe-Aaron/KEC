// src/quiz/dto/update-quiz.dto.ts
import { QuizSettingsDto } from './create-quiz.dto';

export class UpdateQuizDto {
  name?: string;
  description?: string;
  questions?: UpdateQuizQuestionDto[];
  settings?: QuizSettingsDto;
  lessonId: number;
  courseId: number;
  imageUrl?: string; // For quiz cover image
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
  imageFile?: any; // This will be used for upload but not stored in DB
}