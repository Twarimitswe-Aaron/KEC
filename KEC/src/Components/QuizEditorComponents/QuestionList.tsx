import React, { useState } from "react";
import QuestionEditForm from "./QuestionEditForm";
import { Question } from "../ModuleManagement";
import {
  FaCheckCircle,
  FaCheckSquare,
  FaEdit,
  FaTimes,
  FaTrashAlt,
} from "react-icons/fa";
import {
  FaArrowDown,
  FaArrowUp,
  FaPlus,
  FaRegCircle,
  FaRegSquare,
} from "react-icons/fa6";
import { QUESTION_TYPES } from "../QuizEditor";

// Question Settings Component
const QuestionSettings = ({
  question,
  onUpdate,
  disabled = false,
}: {
  question: any;
  onUpdate: (updates: Partial<Question>) => void;
  disabled?: boolean;
}) => (
  <div className="flex justify-end items-center gap-4 pt-3 border-t border-gray-100">
    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
      <input
        type="checkbox"
        checked={question.required}
        onChange={(e) => onUpdate({ required: e.target.checked })}
        className="h-4 w-4 text-[#034153] border-gray-300 rounded focus:ring-[#034153] border border-gray-200 hover:border-gray-300"
        disabled={disabled}
      />
      Required
    </label>

    <div className="flex items-center gap-1">
      <label
        htmlFor={`points-${question.id}`}
        className="text-sm font-medium text-gray-700"
      >
        Points:
      </label>
      <input
        id={`points-${question.id}`}
        type="number"
        min="1"
        value={question.points}
        onChange={(e) => onUpdate({ points: parseInt(e.target.value) || 1 })}
        disabled={disabled}
        className="w-16 px-2 py-1 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all focus:ring-2 focus:ring-[#034153] text-sm"
      />
    </div>
  </div>
);

interface QuestionListProps {
  questions: any[];
  editingQuestion: number | null;
  setEditingQuestion: (id: number | null) => void;
  updateQuestion: (questionId: number, updates: any) => void;
  deleteQuestion: (questionId: number) => void;
  moveQuestion: (index: number, direction: "up" | "down") => void;
  toggleCorrectAnswer: (questionId: number, optionIndex: number) => void;
  addOption: (questionId: number) => void;
  updateOption: (
    questionId: number,
    optionIndex: number,
    value: string
  ) => void;
  removeOption: (questionId: number, optionIndex: number) => void;
  updateLabelAnswer: (
    questionId: number,
    index: number,
    field: "label" | "answer",
    value: string
  ) => void;
  addLabelKey: (questionId: number) => void;
  removeLabelKey: (questionId: number, index: number) => void;
  isOptionCorrect: (question: any, optionIndex: number) => boolean;
  getQuestionIcon: (type: string) => any;
  newQuestion: any;
  onNewQuestionChange: (updates: any) => void;
  onAddQuestion: () => void;
  onNewQuestionAddOption: () => void;
  onNewQuestionUpdateOption: (index: number, value: string) => void;
  onNewQuestionRemoveOption: (index: number) => void;
  onNewQuestionToggleCorrectAnswer: (optionIndex: number) => void;
  isNewOptionCorrect: (optionIndex: number) => boolean;
  courseId: number;
  lessonId: number;
  quizId: number;
}

interface QuestionCardProps {
  question: Question;
  questions: Question[];
  index: number;
  onEdit: (question: Question) => void;
  onDelete: (id: number) => void;
  onMove: (index: number, direction: "up" | "down") => void;
  isOptionCorrect: (questionId: number, optionIndex: number) => boolean;
  getQuestionIcon: (
    type: string
  ) => React.ComponentType<{ className?: string }>;
}

const QuestionList = ({
  questions,
  editingQuestion,
  setEditingQuestion,
  updateQuestion,
  deleteQuestion,
  moveQuestion,
  toggleCorrectAnswer,
  addOption,
  updateOption,
  removeOption,
  updateLabelAnswer,
  addLabelKey,
  removeLabelKey,
  isOptionCorrect,
  getQuestionIcon,
  newQuestion,
  onNewQuestionChange,
  onAddQuestion,
  onNewQuestionAddOption,
  onNewQuestionUpdateOption,
  onNewQuestionRemoveOption,
  onNewQuestionToggleCorrectAnswer,
  isNewOptionCorrect,
  courseId,
  lessonId,
  quizId,
}: QuestionListProps) => {
  const [editingStates, setEditingStates] = useState<{ [key: number]: any }>(
    {}
  );

  const handleStartEdit = (question: any) => {
    setEditingStates((prev) => ({
      ...prev,
      [question.id]: { ...question },
    }));
    setEditingQuestion(question.id);
  };

  const handleCancelEdit = (questionId: number) => {
    const originalQuestion = editingStates[questionId];
    if (originalQuestion) {
      updateQuestion(questionId, originalQuestion);
    }
    setEditingQuestion(null);
    setEditingStates((prev) => {
      const newState = { ...prev };
      delete newState[questionId];
      return newState;
    });
  };

  const handleSaveEdit = (questionId: number, updatedQuestion: any) => {
    const questionData = {
      questionId,
      quizId,
      lessonId,
      courseId,
      updates: {
        type: updatedQuestion.type,
        question: updatedQuestion.question,
        description: updatedQuestion.description,
        options: updatedQuestion.options,
        correctAnswers: updatedQuestion.correctAnswers,
        correctAnswer: updatedQuestion.correctAnswer,
        imageUrl: updatedQuestion.imageUrl,
        labelAnswers: updatedQuestion.labelAnswers,
        required: updatedQuestion.required,
        points: updatedQuestion.points,
      },
    };

    updateQuestion(questionId, updatedQuestion);

    setEditingQuestion(null);
    setEditingStates((prev) => {
      const newState = { ...prev };
      delete newState[questionId];
      return newState;
    });

    console.log("Saving question updates:", questionData);
    // await updateQuestionAPI(questionData);
  };

  const handleQuestionUpdate = (questionId: number, updates: any) => {
    const currentQuestion = questions.find((q) => q.id === questionId);
    if (!currentQuestion) return;

    const updatedQuestion = { ...currentQuestion, ...updates };

    setEditingStates((prev) => ({
      ...prev,
      [questionId]: updatedQuestion,
    }));
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-800">
        Questions ({questions.length})
      </h2>

      <div className="space-y-6">
        {questions.map((question: any, index: number) => (
          <div key={question.id} className="relative">
            {editingQuestion === question.id ? (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-blue-800">
                    Editing Question {index + 1}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleSaveEdit(
                          question.id,
                          editingStates[question.id] || question
                        )
                      }
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => handleCancelEdit(question.id)}
                      className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                <QuestionEditForm
                  question={editingStates[question.id] || question}
                  onUpdate={(updates) =>
                    handleQuestionUpdate(question.id, updates)
                  }
                  onToggleCorrectAnswer={toggleCorrectAnswer}
                  onAddOption={addOption}
                  onUpdateOption={updateOption}
                  onRemoveOption={removeOption}
                  onUpdateLabelAnswer={updateLabelAnswer}
                  onAddLabelKey={addLabelKey}
                  onRemoveLabelKey={removeLabelKey}
                  isOptionCorrect={(q, optionIndex) =>
                    isOptionCorrect(q, optionIndex)
                  }
                />
                <QuestionSettings
                  question={editingStates[question.id] || question}
                  onUpdate={(updates) =>
                    handleQuestionUpdate(question.id, updates)
                  }
                  disabled={false}
                />
              </div>
            ) : (
              <QuestionCard
                question={question}
                index={index}
                questions={questions}
                onEdit={() => handleStartEdit(question)}
                onDelete={() => deleteQuestion(question.id)}
                onMove={moveQuestion}
                isOptionCorrect={isOptionCorrect}
                getQuestionIcon={getQuestionIcon}
              />
            )}
          </div>
        ))}
      </div>

      <hr className="my-8 border-t border-gray-200" />

      <NewQuestionForm
        newQuestion={newQuestion}
        onNewQuestionChange={onNewQuestionChange}
        onAddQuestion={onAddQuestion}
        onNewQuestionAddOption={onNewQuestionAddOption}
        onNewQuestionUpdateOption={onNewQuestionUpdateOption}
        onNewQuestionRemoveOption={onNewQuestionRemoveOption}
        onNewQuestionToggleCorrectAnswer={onNewQuestionToggleCorrectAnswer}
        isNewOptionCorrect={isNewOptionCorrect}
      />
    </div>
  );
};

const QuestionCard = ({
  question,
  index,
  questions,
  onEdit,
  onDelete,
  onMove,
  isOptionCorrect,
  getQuestionIcon,
}: any) => {
  const Icon = getQuestionIcon(question.type);

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMove(index, "up");
  };

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMove(index, "down");
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Icon className="h-5 w-5 text-[#034153] mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">
                {question.question || `Question ${index + 1}`}
              </h3>
              {question.description && (
                <p className="text-sm text-gray-500 mt-1">
                  {question.description}
                </p>
              )}
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                <span className="px-2 py-0.5 bg-gray-100 rounded-full">
                  {question.points || 1} point{question.points !== 1 ? "s" : ""}
                </span>
                {question.required && (
                  <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full">
                    Required
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleMoveUp}
              disabled={index === 0}
              className={`p-1.5 rounded-md ${
                index === 0
                  ? "text-gray-200 cursor-not-allowed"
                  : "text-gray-500 hover:bg-gray-100 hover:text-[#034153]"
              }`}
              title="Move up"
            >
              <FaArrowUp size={14} />
            </button>
            <button
              onClick={handleMoveDown}
              disabled={index === questions.length - 1}
              className={`p-1.5 rounded-md ${
                index === questions.length - 1
                  ? "text-gray-200 cursor-not-allowed"
                  : "text-gray-500 hover:bg-gray-100 hover:text-[#034153]"
              }`}
              title="Move down"
            >
              <FaArrowDown size={14} />
            </button>
            <button
              onClick={handleEdit}
              className="p-1.5 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors"
              title="Edit question"
            >
              <FaEdit size={14} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
              title="Delete question"
            >
              <FaTrashAlt size={14} />
            </button>
          </div>
        </div>

        <QuestionViewMode
          question={question}
          isOptionCorrect={isOptionCorrect}
        />
      </div>
    </div>
  );
};

const QuestionViewMode = ({ question, isOptionCorrect }: any) => (
  <div className="space-y-4">
    <h3 className="text-base sm:text-lg font-semibold text-gray-800">
      {question.question}
    </h3>

    {question.type === "labeling" ? (
      <div className="bg-gray-50 p-3  border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Answer Key:</h4>
        {question.imageUrl && (
          <img
            src={question.imageUrl}
            alt="Labeled Diagram"
            className="max-w-full h-auto max-h-32 object-contain mb-3 border border-gray-200 rounded-lg"
          />
        )}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          {(question.labelAnswers || []).map((la: any, laIndex: number) => (
            <div key={laIndex} className="flex gap-2">
              <span className="font-bold text-[#034153]">{la.label}:</span>
              <span className="text-gray-800">{la.answer}</span>
            </div>
          ))}
        </div>
      </div>
    ) : Array.isArray(question.options) ? (
      <ul className="space-y-1 text-sm">
        {question.options.map((option: string, optIndex: number) => (
          <li
            key={optIndex}
            className={`flex items-start gap-2 p-2 rounded-lg border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all ${
              isOptionCorrect(question, optIndex)
                ? "bg-green-50 text-green-700 font-medium"
                : "text-gray-700"
            }`}
          >
            {isOptionCorrect(question, optIndex) ? (
              question.type === "multiple" || question.type === "truefalse" ? (
                <FaCheckCircle className="mt-1 flex-shrink-0" />
              ) : (
                <FaCheckSquare className="mt-1 flex-shrink-0" />
              )
            ) : question.type === "multiple" ||
              question.type === "truefalse" ? (
              <FaRegCircle className="mt-1 flex-shrink-0 text-gray-400" />
            ) : (
              <FaRegSquare className="mt-1 flex-shrink-0 text-gray-400" />
            )}
            <span className="flex-1">{option}</span>
          </li>
        ))}
      </ul>
    ) : (
      <div className="bg-gray-50 p-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all">
        <h4 className="text-sm font-medium text-gray-700 mb-1">
          Correct Answer:
        </h4>
        <p className="text-base font-semibold text-gray-800">
          {question.correctAnswer}
        </p>
      </div>
    )}
  </div>
);

const NewQuestionForm = ({
  newQuestion,
  onNewQuestionChange,
  onAddQuestion,
  onNewQuestionAddOption,
  onNewQuestionUpdateOption,
  onNewQuestionRemoveOption,
  onNewQuestionToggleCorrectAnswer,
  isNewOptionCorrect,
}: any) => (
  <div className="bg-white border-dashed  p-5 sm:p-6 shadow-lg border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all">
    <h3 className="text-lg font-bold text-[#034153] mb-4">Add New Question</h3>

    <div className="space-y-4">
      <div>
        <label
          htmlFor="newQuestionType"
          className="block text-sm font-medium text-gray-700"
        >
          Question Type
        </label>
        <select
          id="newQuestionType"
          value={newQuestion.type}
          onChange={(e) =>
            onNewQuestionChange({ ...newQuestion, type: e.target.value })
          }
          className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all focus:ring-[#034153] focus:border-[#034153] text-sm bg-white"
        >
          {QUESTION_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="newQuestionText"
          className="block text-sm font-medium text-gray-700"
        >
          Question Text
        </label>
        <textarea
          id="newQuestionText"
          value={newQuestion.question}
          onChange={(e) =>
            onNewQuestionChange({ ...newQuestion, question: e.target.value })
          }
          placeholder="Enter the question text here..."
          rows={2}
          className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all focus:ring-[#034153] focus:border-[#034153] text-sm resize-none font-semibold"
        />
      </div>

      {newQuestion.type === "truefalse" ? (
        <TrueFalseOptions
          newQuestion={newQuestion}
          onNewQuestionToggleCorrectAnswer={onNewQuestionToggleCorrectAnswer}
          isNewOptionCorrect={isNewOptionCorrect}
        />
      ) : newQuestion.type === "multiple" || newQuestion.type === "checkbox" ? (
        <NewQuestionOptions
          newQuestion={newQuestion}
          onNewQuestionAddOption={onNewQuestionAddOption}
          onNewQuestionUpdateOption={onNewQuestionUpdateOption}
          onNewQuestionRemoveOption={onNewQuestionRemoveOption}
          onNewQuestionToggleCorrectAnswer={onNewQuestionToggleCorrectAnswer}
          isNewOptionCorrect={isNewOptionCorrect}
        />
      ) : newQuestion.type === "labeling" ? (
        <NewLabelingQuestion
          newQuestion={newQuestion}
          onNewQuestionChange={onNewQuestionChange}
        />
      ) : null}

      {/* Question Settings */}
      <QuestionSettings
        question={newQuestion}
        onUpdate={onNewQuestionChange}
        disabled={false}
      />

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button
          onClick={onAddQuestion}
          className="bg-[#034153] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#004e64] transition-colors flex items-center gap-2 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm"
        >
          <FaPlus size={14} /> Add Question
        </button>
      </div>
    </div>
  </div>
);

const NewQuestionOptions = ({
  newQuestion,
  onNewQuestionAddOption,
  onNewQuestionUpdateOption,
  onNewQuestionRemoveOption,
  onNewQuestionToggleCorrectAnswer,
  isNewOptionCorrect,
}: any) => (
  <div className="space-y-2 border-l-4 border-gray-100 pl-4 py-2">
    <label className="block text-sm font-medium text-gray-700">
      Options and Correct Answers
    </label>
    {newQuestion.options!.map((option: string, index: number) => (
      <div key={index} className="flex gap-2 items-center">
        <button
          type="button"
          onClick={() => onNewQuestionToggleCorrectAnswer(index)}
          className={`p-1.5 transition-colors flex-shrink-0 border border-gray-200 rounded-lg hover:border-gray-300 ${
            isNewOptionCorrect(index)
              ? "bg-green-100 text-green-600 hover:bg-green-200"
              : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          }`}
          title="Mark as correct"
        >
          {newQuestion.type === "multiple" ||
          newQuestion.type === "truefalse" ? (
            isNewOptionCorrect(index) ? (
              <FaCheckCircle size={14} />
            ) : (
              <FaRegCircle size={14} />
            )
          ) : isNewOptionCorrect(index) ? (
            <FaCheckSquare size={14} />
          ) : (
            <FaRegSquare size={14} />
          )}
        </button>

        <input
          type="text"
          value={option}
          onChange={(e) => onNewQuestionUpdateOption(index, e.target.value)}
          placeholder={`Option ${index + 1}`}
          className={`w-full px-3 py-2 border rounded-lg hover:border-gray-300 hover:shadow-sm transition-all focus:ring-2 focus:ring-[#034153] text-sm ${
            isNewOptionCorrect(index)
              ? "bg-green-50 border-green-300"
              : "border-gray-200"
          }`}
        />

        {newQuestion.options!.length > 2 && (
          <button
            type="button"
            onClick={() => onNewQuestionRemoveOption(index)}
            className="p-1.5  text-red-500 hover:bg-red-100 transition-colors flex-shrink-0 border border-gray-200 rounded-lg hover:border-gray-300"
            title="Remove option"
          >
            <FaTimes size={14} />
          </button>
        )}
      </div>
    ))}

    <button
      onClick={onNewQuestionAddOption}
      className="text-[#034153] hover:text-[#004e64] flex items-center gap-1 text-sm font-medium mt-2 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all px-3 py-1"
    >
      <FaPlus size={12} /> Add Option
    </button>
  </div>
);

const TrueFalseOptions = ({
  newQuestion,
  onNewQuestionToggleCorrectAnswer,
  isNewOptionCorrect,
}: any) => (
  <div className="space-y-2 border-l-4 border-gray-100 pl-4 py-2">
    <label className="block text-sm font-medium text-gray-700">
      Select the correct answer
    </label>
    {["True", "False"].map((option, index) => (
      <div key={index} className="flex gap-2 items-center">
        <button
          type="button"
          onClick={() => onNewQuestionToggleCorrectAnswer(index)}
          className={`p-1.5 transition-colors flex-shrink-0 border border-gray-200 rounded-lg hover:border-gray-300 ${
            isNewOptionCorrect(index)
              ? "bg-green-100 text-green-600 hover:bg-green-200"
              : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          }`}
          title="Mark as correct"
        >
          {isNewOptionCorrect(index) ? (
            <FaCheckCircle size={14} />
          ) : (
            <FaRegCircle size={14} />
          )}
        </button>

        <div
          className={`w-full px-3 py-2 border rounded-lg text-sm ${
            isNewOptionCorrect(index)
              ? "bg-green-50 border-green-300"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          {option}
        </div>
      </div>
    ))}
  </div>
);

const NewLabelingQuestion = ({ newQuestion, onNewQuestionChange }: any) => {
  // Initialize labelAnswers if it doesn't exist
  const labelAnswers = newQuestion.labelAnswers || [];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a preview URL for the image
    const imageUrl = URL.createObjectURL(file);

    // Update the question with the new image file and URL
    onNewQuestionChange({
      ...newQuestion,
      imageFile: file,
      imageUrl: imageUrl,
      // Keep existing label answers
      labelAnswers: [...labelAnswers],
    });
  };

  const handleLabelChange = (
    index: number,
    field: "label" | "answer",
    value: string
  ) => {
    const updatedLabels = [...labelAnswers];

    if (!updatedLabels[index]) {
      updatedLabels[index] = { label: "", answer: "" };
    }

    updatedLabels[index] = {
      ...updatedLabels[index],
      [field]: field === "label" ? value.toUpperCase() : value,
    };

    // Update the question with new labels and prepare options/correctAnswers
    onNewQuestionChange({
      ...newQuestion,
      labelAnswers: updatedLabels,
      // Store labels in options array
      options: updatedLabels.map((la) => la.label).filter(Boolean),
      // Store answers in correctAnswers array
      correctAnswers: updatedLabels.map((la) => la.answer).filter(Boolean),
    });
  };

  const addLabel = () => {
    const newLabel = String.fromCharCode(65 + labelAnswers.length); // A, B, C, ...
    handleLabelChange(labelAnswers.length, "label", newLabel);
  };

  const removeLabel = (index: number) => {
    const updatedLabels = labelAnswers.filter(
      (_: any, i: number) => i !== index
    );
    onNewQuestionChange({
      ...newQuestion,
      labelAnswers: updatedLabels,
      options: updatedLabels
        .map((la: { label: string; answer: string }) => la.label)
        .filter(Boolean),
      correctAnswers: updatedLabels
        .map((la: { label: string; answer: string }) => la.answer)
        .filter(Boolean),
    });
  };

  return (
    <div className="space-y-4 border-l-4 border-yellow-500 pl-4 py-2">
      <h4 className="text-sm font-bold text-gray-700">Image and Label Setup</h4>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Upload Labeled Image
        </label>
        <div className="flex items-center gap-2">
          <label className="cursor-pointer bg-white border border-gray-200 rounded-lg hover:border-yellow-400 hover:shadow-sm transition-all px-4 py-2 text-sm font-medium text-gray-700">
            {newQuestion.imageUrl || newQuestion.imageFile
              ? "Change Image"
              : "Select Image"}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
          {newQuestion.imageFile && (
            <span className="text-sm text-gray-600">
              {newQuestion.imageFile.name || "Uploaded image"}
            </span>
          )}
        </div>
        {!newQuestion.imageUrl && !newQuestion.imageFile && (
          <p className="mt-1 text-xs text-gray-500">
            Upload a pre-labeled image with markers (A, B, C, etc.)
          </p>
        )}
      </div>

      {newQuestion.imageUrl || newQuestion.imageFile ? (
        <div className="flex flex-col md:flex-row gap-6 mt-4">
          {/* Image on left (or top on mobile) */}
          <div className="md:w-1/2">
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 p-2">
              <img
                src={
                  newQuestion.imageUrl ||
                  URL.createObjectURL(newQuestion.imageFile)
                }
                alt="Question content preview"
                className="w-full h-auto max-h-64 object-contain mx-auto"
              />
            </div>
          </div>

          {/* Labels and answers on right (or bottom on mobile) */}
          <div className="md:w-1/2">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Labels and Answers
              </label>
              <button
                type="button"
                onClick={addLabel}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                <FaPlus className="mr-1" /> Add Label
              </button>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {labelAnswers.length > 0 ? (
                labelAnswers.map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 group">
                    <div className="flex-1 grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={item.label || ""}
                          onChange={(e) =>
                            handleLabelChange(index, "label", e.target.value)
                          }
                          placeholder="A"
                          className="block w-full text-center rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 text-sm"
                          maxLength={1}
                          size={1}
                        />
                      </div>
                      <div className="col-span-9">
                        <input
                          type="text"
                          value={item.answer || ""}
                          onChange={(e) =>
                            handleLabelChange(index, "answer", e.target.value)
                          }
                          placeholder="Enter the answer for this label"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 text-sm"
                        />
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeLabel(index)}
                          className="text-gray-400 hover:text-red-500 focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove label"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-sm text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                  No labels added yet. Click 'Add Label' to get started.
                </div>
              )}
            </div>

            <div className="mt-3 text-xs text-gray-500">
              <p>
                • Labels will be automatically converted to uppercase (A, B, C,
                etc.)
              </p>
              <p>• Add labels that match the markers on your image</p>
            </div>
          </div>
        </div>
      ) : labelAnswers.length > 0 ? (
        <div className="mt-4 space-y-3">
          <h5 className="text-sm font-medium text-gray-700">
            Labels (upload an image to see the full editor)
          </h5>
          <div className="space-y-2">
            {labelAnswers.map((item: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                  {item.label || "?"}:
                </span>
                <span>{item.answer || "No answer provided"}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default QuestionList;
