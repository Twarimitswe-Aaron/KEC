// Quiz related types
export interface QuizSettings {
  title: string;
  description?: string;
  passingScore?: number | null;
  allowRetakes: boolean;
  showResult: boolean;
}

export interface QuizQuestion {
  id: number;
  type: string;
  question: string;
  options?: string[];
  correctAnswer?: string | string[] | number | number[];
  points?: number;
  required?: boolean;
  description?: string;
}

export interface QuizFormData {
  id: number;
  name: string;
  description?: string;
  questions: QuizQuestion[];
  settings: QuizSettings;
  createdAt?: string;
  updatedAt?: string;
}

// Resource types
export type ResourceType = 'pdf' | 'word' | 'video' | 'quiz' | string;

export interface BaseResource {
  id: number;
  name: string;
  type: ResourceType;
  url: string | null;
  size?: number | null;
  duration?: number | null;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  lessonId: number;
  courseId?: number;
}

export interface FileResource extends BaseResource {
  type: 'pdf' | 'word' | 'video';
}

export interface QuizResource extends BaseResource {
  type: 'quiz';
  form?: {
    id: number;
    quizzes: QuizFormData[];
  };
  quizData?: QuizFormData;
}

export type IncomingResource = FileResource | QuizResource;

// Lesson types
export interface Lesson {
  id: number;
  title: string;
  content: string;
  description: string;
  courseId?: number;
  resources?: IncomingResource[];
  createdAt: string;
  updatedAt?: string;
  isUnlocked: boolean;
  order?: number;
}

export interface QuizResponse {
  questionId: number;
  answer: string | string[];
}
