// src/quiz/dto/create-quiz.dto.ts
export class CreateQuizDto {
  name: string;
  description?: string;
  questions: CreateQuizQuestionDto[];
  settings?: QuizSettingsDto;
}

export class CreateQuizQuestionDto {
  type: 'multiple' | 'checkbox' | 'truefalse' | 'short' | 'long' | 'number';
  question: string;
  description?: string;
  options?: string[];
  required?: boolean;
  points?: number;
}

export class QuizSettingsDto {
  title: string;
  description?: string;
  shuffleQuestions?: boolean;
  timeLimit?: number;
  showResults?: boolean;
  allowRetakes?: boolean;
  passingScore?: number;
}