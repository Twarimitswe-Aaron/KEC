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
  FaImage,
  FaPlus,
  FaRegCircle,
  FaRegSquare,
  FaTag,
} from "react-icons/fa6";
import { QUESTION_TYPES } from "../questionTypes";

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
    <div className="relative bg-yellow-50 rounded-xl border-2 border-yellow-300 shadow-sm p-6 space-y-6">
      {/* Decorative accent */}
      <div className="absolute top-0 left-0 w-1.5 h-full bg-yellow-500 rounded-l-xl"></div>
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-yellow-500 text-white shadow-md">
          <FaTag className="text-lg" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-gray-800">Image Labeling Setup</h4>
          <p className="text-sm text-gray-600">Upload an image and define labels</p>
        </div>
      </div>

      {/* Image Upload Section */}
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <FaImage className="text-yellow-500" />
          Upload Labeled Image
        </label>
        <div className="flex items-center gap-3">
          <label className="group cursor-pointer bg-yellow-500 hover:bg-yellow-600 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 px-6 py-3 text-sm font-semibold text-white">
            <span className="flex items-center gap-2">
              <FaImage />
              {newQuestion.imageUrl || newQuestion.imageFile
                ? "Change Image"
                : "Select Image"}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
          {newQuestion.imageFile && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-300 rounded-lg px-4 py-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-700 font-medium">
                {newQuestion.imageFile.name || "Uploaded image"}
              </span>
            </div>
          )}
        </div>
        {!newQuestion.imageUrl && !newQuestion.imageFile && (
          <div className="mt-3 bg-blue-50 border border-blue-300 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              💡 <strong>Tip:</strong> Upload a pre-labeled image with markers (A, B, C, etc.)
            </p>
          </div>
        )}
      </div>

      {/* Image and Labels Section */}
      {newQuestion.imageUrl || newQuestion.imageFile ? (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Image Preview */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-gray-200">
              <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Image Preview</p>
              </div>
              <div className="p-4 bg-gray-50">
                <img
                  src={
                    newQuestion.imageUrl ||
                    URL.createObjectURL(newQuestion.imageFile)
                  }
                  alt="Question content preview"
                  className="w-full h-auto max-h-80 object-contain mx-auto rounded-lg shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Labels Editor */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-lg shadow-md border-2 border-gray-200 overflow-hidden">
              <div className="bg-yellow-500 px-5 py-3 flex justify-between items-center">
                <label className="text-sm font-bold text-white flex items-center gap-2">
                  <FaTag />
                  Labels and Answers
                </label>
                <button
                  type="button"
                  onClick={addLabel}
                  className="inline-flex items-center px-4 py-2 bg-white text-yellow-600 text-sm font-semibold rounded-lg hover:bg-yellow-50 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <FaPlus className="mr-2" /> Add Label
                </button>
              </div>

              <div className="p-5 space-y-3 max-h-96 overflow-y-auto">
                {labelAnswers.length > 0 ? (
                  labelAnswers.map((item: any, index: number) => (
                    <div key={index} className="group bg-gray-50 hover:bg-gray-100 rounded-lg p-3 border border-gray-200 hover:border-yellow-400 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        {/* Label Input */}
                        <div className="flex-shrink-0">
                          <input
                            type="text"
                            value={item.label || ""}
                            onChange={(e) =>
                              handleLabelChange(index, "label", e.target.value)
                            }
                            placeholder="A"
                            className="block w-12 h-12 text-center text-lg font-bold rounded-lg border-2 border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 bg-white shadow-sm"
                            maxLength={1}
                          />
                        </div>
                        
                        {/* Answer Input */}
                        <div className="flex-1">
                          <input
                            type="text"
                            value={item.answer || ""}
                            onChange={(e) =>
                              handleLabelChange(index, "answer", e.target.value)
                            }
                            placeholder="Enter the answer for this label..."
                            className="block w-full rounded-lg border-2 border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 px-4 py-2.5 text-sm bg-white shadow-sm"
                          />
                        </div>
                        
                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => removeLabel(index)}
                          className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-red-500 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                          title="Remove label"
                        >
                          <FaTimes className="text-lg" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <FaTag className="mx-auto text-4xl text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500 font-medium">No labels added yet</p>
                    <p className="text-xs text-gray-400 mt-1">Click 'Add Label' to get started</p>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 px-5 py-4 border-t border-gray-200">
                <div className="space-y-2 text-xs text-gray-700">
                  <p className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>Labels will be automatically converted to uppercase (A, B, C, etc.)</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>Add labels that match the markers on your image</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : labelAnswers.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h5 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <FaTag className="text-yellow-500" />
            Current Labels
            <span className="ml-auto text-xs font-normal text-gray-500">(upload an image to see the full editor)</span>
          </h5>
          <div className="space-y-2">
            {labelAnswers.map((item: any, index: number) => (
              <div key={index} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
                <span className="flex items-center justify-center w-8 h-8 font-bold bg-yellow-100 text-yellow-700 rounded-lg border border-yellow-300 text-sm">
                  {item.label || "?"}
                </span>
                <span className="text-sm text-gray-700">{item.answer || "No answer provided"}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};


export default QuestionList;
