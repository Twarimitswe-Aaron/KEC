// src/Components/QuizEditorComponents/types.ts

export type QuestionType = "multiple" | "checkbox" | "truefalse" | "labeling";

export interface QuestionProp {
  id?: string;
  type: QuestionType;
  question: string;
  description?: string;
  options?: string[];
  correctAnswers: (string | number)[];
  imageUrl?: string;
  labelAnswers?: { label: string; answer: string }[];
  points?: number;
  required?: boolean;
}

export interface BaseQuestion extends Omit<QuestionProp, 'type' | 'correctAnswers'> {
  type: QuestionType;
  correctAnswers: (string | number)[];
  correctAnswer?: number | number[];
  imageFile?: File;
  labelAnswers?: { label: string; answer: string }[];
  label: string;
  answer: string;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple' | 'truefalse';
  options: string[];
  correctAnswer: number;
  correctAnswers: [number];
  labelAnswers?: never;
}

export interface CheckboxQuestion extends BaseQuestion {
  type: 'checkbox';
  options: string[];
  correctAnswers: number[];
  labelAnswers?: never;
}

export interface LabelingQuestion extends BaseQuestion {
  type: 'labeling';
  options?: never;
  correctAnswers: string[];
  labelAnswers: { label: string; answer: string }[];
  imageUrl: string;
}

export type Question = MultipleChoiceQuestion | CheckboxQuestion | LabelingQuestion | (BaseQuestion & {
  type: QuestionType;
  options?: string[];
  correctAnswer?: number | number[];
  correctAnswers?: (string | number)[];
  labelAnswers?: { label: string; answer: string }[];
  imageUrl?: string;
});

export interface QuizSettings {
  title: string;
  description?: string;
  showResults?: boolean;
  allowRetakes?: boolean;
  passingScore?: number;
}

export interface QuizProps {
  courseId: string;
  lessonId: string;
  quizId: string;
  onClose: () => void;
}

export interface QuizEditorProps {
  resource: QuizProps;
  onClose: () => void;
}

export interface NewQuestionState {
  type?: QuestionType;
  question?: string;
  description?: string;
  options?: string[];
  required?: boolean;
  points?: number;
  imageFile?: File;
  labelAnswers?: { label: string; answer: string }[];
  label: string;
  answer: string;
  correctAnswers?: (string | number)[];
  correctAnswer?: number | number[];
  imageUrl?: string;
}
