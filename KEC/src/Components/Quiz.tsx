import React, { useState } from "react";
import { FaTimes, FaPlus, FaTrash, FaCheck, FaEllipsisV, FaArrowUp, FaArrowDown } from "react-icons/fa";

type Question = {
  id: number;
  type: "multiple" | "checkbox" | "truefalse" | "short";
  question: string;
  options?: string[];
  required?: boolean;
  correctAnswer?: string | string[];
};

type QuizProps = {
  resource: { id?: number; name?: string; quiz?: Question[] };
  setOpenQuiz: (value: number | null) => void;
  updateQuiz: (resourceId: number, newQuiz: Question[]) => void;
};

// Mock quiz used when resource.quiz is absent
const MOCK_QUIZ: Question[] = [
  {
    id: 1001,
    type: "multiple",
    question: "What does JSX stand for?",
    options: ["JavaScript XML", "JSON XML", "Java Syntax eXtension", "JS eXpression"],
    required: true,
    correctAnswer: "JavaScript XML",
  },
  {
    id: 1002,
    type: "checkbox",
    question: "Select state management options used with React:",
    options: ["Redux", "Context API", "MySQL", "MobX"],
    required: true,
    correctAnswer: ["Redux", "Context API", "MobX"],
  },
  {
    id: 1003,
    type: "truefalse",
    question: "React components must be class-based.",
    options: ["True", "False"],
    required: false,
    correctAnswer: "False",
  },
  {
    id: 1004,
    type: "short",
    question: "Name one hook used for side effects.",
    required: false,
    correctAnswer: "useEffect",
  },
];

const QuizEditor = ({ resource, setOpenQuiz, updateQuiz }: QuizProps) => {
  const [questions, setQuestions] = useState<Question[]>(resource.quiz || MOCK_QUIZ);
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);

  // Add new question
  const addQuestion = (type: Question["type"]) => {
    const newQuestion: Question = {
      id: Date.now(),
      type,
      question: "",
      options:
        type === "multiple" || type === "checkbox"
          ? ["", ""]
          : type === "truefalse"
          ? ["True", "False"]
          : undefined,
      correctAnswer: type === "checkbox" ? [] : "",
    };
    setQuestions((prev) => [...prev, newQuestion]);
    setActiveQuestion(newQuestion.id);
  };

  // Update question text
  const updateQuestionText = (id: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, question: text } : q))
    );
  };

  // Update option text
  const updateOptionText = (qId: number, index: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? {
              ...q,
              options: q.options?.map((o, i) => (i === index ? value : o)),
            }
          : q
      )
    );
  };

  // Add option
  const addOption = (qId: number) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? { 
              ...q, 
              options: [...(q.options || []), ""], 
              correctAnswer: q.type === "checkbox" ? [...(q.correctAnswer as string[])] : q.correctAnswer 
            }
          : q
      )
    );
  };

  // Remove question
  const removeQuestion = (id: number) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  // Remove option
  const removeOption = (qId: number, index: number) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? {
              ...q,
              options: q.options?.filter((_, i) => i !== index),
              correctAnswer:
                q.type === "checkbox"
                  ? (q.correctAnswer as string[]).filter((_, i) => i !== index)
                  : q.correctAnswer,
            }
          : q
      )
    );
  };

  // Handle correct answer selection
  const handleCorrectAnswer = (q: Question, option: string) => {
    setQuestions((prev) =>
      prev.map((question) => {
        if (question.id !== q.id) return question;

        if (q.type === "multiple" || q.type === "truefalse") {
          return { ...question, correctAnswer: option };
        } else if (q.type === "checkbox") {
          const current = question.correctAnswer as string[];
          return {
            ...question,
            correctAnswer: current.includes(option)
              ? current.filter((o) => o !== option)
              : [...current, option],
          };
        }
        return question;
      })
    );
  };

  // Handle short answer correct text
  const handleShortCorrectAnswer = (qId: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, correctAnswer: value } : q))
    );
  };

  // Move question up
  const moveQuestionUp = (index: number) => {
    if (index === 0) return;
    const newQuestions = [...questions];
    [newQuestions[index], newQuestions[index - 1]] = [newQuestions[index - 1], newQuestions[index]];
    setQuestions(newQuestions);
  };

  // Move question down
  const moveQuestionDown = (index: number) => {
    if (index === questions.length - 1) return;
    const newQuestions = [...questions];
    [newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]];
    setQuestions(newQuestions);
  };

  // Duplicate question
  const duplicateQuestion = (question: Question) => {
    const newQuestion = {
      ...question,
      id: Date.now(),
    };
    setQuestions((prev) => [...prev, newQuestion]);
  };

  // Save changes to parent resource
  const saveQuiz = () => {
    if (resource.id) updateQuiz(resource.id, questions);
    setOpenQuiz(null);
  };

  return (
    <div className="fixed inset-0 bg-black/70 scroll-hide flex items-start justify-center z-50  p-4 overflow-y-auto">
      <div className="bg-white rounded-lg  shadow-xl max-w-3xl w-full my-8">
        {/* Header */}
        <div className="sticky -top-6 bg-white  p-6 rounded-t-lg flex justify-between items-center shadow-sm z-10">
          <div>
            <h2 className="text-2xl font-medium text-gray-800">
              {resource.name || "Untitled Quiz"}
            </h2>
            <p className="text-gray-500 mt-1">Quiz Editor</p>
          </div>
          <button
            onClick={() => setOpenQuiz(null)}
            className="text-gray-500 hover:text-gray-700 text-xl p-2 rounded-full hover:bg-gray-100"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Questions */}
          {questions.map((q, idx) => (
            <div 
              key={q.id} 
              className={`border rounded-lg p-5 transition-all duration-200 ${activeQuestion === q.id ? 'border-blue-400 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
              onClick={() => setActiveQuestion(q.id)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">Q{idx + 1}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); moveQuestionUp(idx); }}
                      disabled={idx === 0}
                      className={`p-1 rounded ${idx === 0 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                      <FaArrowUp />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); moveQuestionDown(idx); }}
                      disabled={idx === questions.length - 1}
                      className={`p-1 rounded ${idx === questions.length - 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                      <FaArrowDown />
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); duplicateQuestion(q); }}
                    className="text-gray-500 hover:text-blue-600 p-1 rounded hover:bg-gray-100"
                  >
                    <FaPlus size={14} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeQuestion(q.id); }}
                    className="text-gray-500 hover:text-red-600 p-1 rounded hover:bg-gray-100"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>

              <input
                type="text"
                placeholder="Question"
                value={q.question}
                onChange={(e) => updateQuestionText(q.id, e.target.value)}
                className="w-full p-3 border-b-2 border-transparent hover:border-gray-200 focus:border-blue-500 focus:outline-none text-lg font-normal mb-4"
              />

              {/* Options */}
              {(q.type === "multiple" || q.type === "checkbox" || q.type === "truefalse") && (
                <div className="space-y-3 ml-2">
                  {q.options?.map((opt, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`rounded-full border w-5 h-5 flex items-center justify-center ${q.type === "checkbox" ? "rounded" : "rounded-full"}`}>
                        {q.type === "checkbox" ? (
                          <input
                            type="checkbox"
                            checked={(q.correctAnswer as string[])?.includes(opt) || false}
                            onChange={() => handleCorrectAnswer(q, opt)}
                            className="opacity-0 absolute w-5 h-5 cursor-pointer"
                          />
                        ) : (
                          <input
                            type="radio"
                            name={`correct-${q.id}`}
                            checked={q.correctAnswer === opt}
                            onChange={() => handleCorrectAnswer(q, opt)}
                            className="opacity-0 absolute w-5 h-5 cursor-pointer"
                          />
                        )}
                        {q.type === "checkbox" ? (
                          <div className={`w-5 h-5 border rounded flex items-center justify-center ${(q.correctAnswer as string[])?.includes(opt) ? "bg-blue-500 border-blue-500" : "border-gray-400"}`}>
                            {(q.correctAnswer as string[])?.includes(opt) && <FaCheck className="text-white text-xs" />}
                          </div>
                        ) : (
                          <div className={`w-5 h-5 border rounded-full flex items-center justify-center ${q.correctAnswer === opt ? "border-blue-500" : "border-gray-400"}`}>
                            {q.correctAnswer === opt && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                          </div>
                        )}
                      </div>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => updateOptionText(q.id, i, e.target.value)}
                        className="flex-1 p-2 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none"
                        placeholder={`Option ${i + 1}`}
                      />
                      {q.type !== "truefalse" && q.options && q.options.length > 1 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); removeOption(q.id, i); }}
                          className="text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-gray-100"
                        >
                          <FaTimes size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  {q.type !== "truefalse" && (
                    <button
                      onClick={(e) => { e.stopPropagation(); addOption(q.id); }}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mt-3 ml-7 text-sm"
                    >
                      <FaPlus size={12} /> Add option
                    </button>
                  )}
                </div>
              )}

              {q.type === "short" && (
                <div className="mt-2 ml-2">
                  <div className="text-sm text-gray-600 mb-1">Correct answer</div>
                  <input
                    type="text"
                    placeholder="Type the correct answer"
                    value={q.correctAnswer as string}
                    onChange={(e) => handleShortCorrectAnswer(q.id, e.target.value)}
                    className="w-full p-2 border-b border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}
            </div>
          ))}

          {/* Add New Question */}
          <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
            <div className="flex gap-3 flex-wrap justify-center">
              <button
                onClick={() => addQuestion("multiple")}
                className="px-4 py-3 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 flex items-center gap-2 shadow-sm"
              >
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <FaPlus size={10} className="text-blue-600" />
                </div>
                Multiple Choice
              </button>
              <button
                onClick={() => addQuestion("checkbox")}
                className="px-4 py-3 bg-white rounded-lg border border-gray-200 hover:border-green-400 hover:bg-green-50 flex items-center gap-2 shadow-sm"
              >
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <FaPlus size={10} className="text-green-600" />
                </div>
                Checkbox
              </button>
              <button
                onClick={() => addQuestion("truefalse")}
                className="px-4 py-3 bg-white rounded-lg border border-gray-200 hover:border-purple-400 hover:bg-purple-50 flex items-center gap-2 shadow-sm"
              >
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                  <FaPlus size={10} className="text-purple-600" />
                </div>
                True/False
              </button>
              <button
                onClick={() => addQuestion("short")}
                className="px-4 py-3 bg-white rounded-lg border border-gray-200 hover:border-yellow-400 hover:bg-yellow-50 flex items-center gap-2 shadow-sm"
              >
                <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
                  <FaPlus size={10} className="text-yellow-600" />
                </div>
                Short Answer
              </button>
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-between mt-8 pt-5 border-t">
            <button
              onClick={() => setOpenQuiz(null)}
              className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={saveQuiz}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-md"
            >
              <FaCheck /> Save Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizEditor;