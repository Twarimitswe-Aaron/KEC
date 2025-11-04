// src/quiz/dto/create-quiz.dto.ts
export class CreateQuizDto {
  name: string;
  description?: string;
}

export class CreateQuizQuestionDto {
  type: 'multiple' | 'checkbox' | 'truefalse' | 'short' | 'long' | 'number';
  question: string;
  description?: string;
  options?: string[];
  correctAnswer?: number; // For single-answer questions (index)
  correctAnswers?: number[]; // For multi-answer questions (array of indices)
  required?: boolean;
  points?: number;
}

export class QuizSettingsDto {
  title: string;
  description?: string;
  shuffleQuestions?: boolean;
  showResults?: boolean;
  allowRetakes?: boolean;
  passingScore?: number;
}
