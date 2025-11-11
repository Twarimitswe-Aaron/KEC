import { FaRegCircle, FaCheckSquare, FaRegSquare, FaEdit, FaList } from 'react-icons/fa';

export const QUESTION_TYPES = [
  {
    value: "multiple",
    label: "Multiple Choice",
    icon: FaRegCircle,
    description: "Single correct answer from multiple options"
  },
  {
    value: "checkbox",
    label: "Multiple Select",
    icon: FaCheckSquare,
    description: "Multiple correct answers from options"
  },
  {
    value: "truefalse",
    label: "True/False",
    icon: FaRegSquare,
    description: "Simple true or false question"
  },
  {
    value: "shortanswer",
    label: "Short Answer",
    icon: FaEdit,
    description: "Short text response"
  },
  {
    value: "essay",
    label: "Essay",
    icon: FaEdit,
    description: "Long form written response"
  },
  {
    value: "labeling",
    label: "Labeling",
    icon: FaList,
    description: "Label parts of an image"
  }
] as const;

export type QuestionType = typeof QUESTION_TYPES[number]['value'];

// Helper function to get question type by value
export const getQuestionType = (value: string) => {
  return QUESTION_TYPES.find(type => type.value === value);
};
