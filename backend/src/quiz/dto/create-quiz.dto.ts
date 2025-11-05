// src/quiz/dto/create-quiz.dto.ts
export class CreateQuizDto {
  name: string;
  description?: string;
}

export class CreateQuizQuestionDto {
  type: 'multiple' | 'checkbox' | 'truefalse' | 'labeling';
  question: string;
  description?: string;
  options?: string[];
  correctAnswer?: number; // For single-answer questions (index)
  correctAnswers?: number[]; // For multi-answer questions (array of indices)
  required?: boolean;
  points?: number;
}

export class QuizSettingsDto {
  [key: string]: any;  // Index signature for JSON serialization
  title: string;
  description?: string;
  shuffleQuestions?: boolean;
  showResults?: boolean;
  allowRetakes?: boolean;
  passingScore?: number;
}
