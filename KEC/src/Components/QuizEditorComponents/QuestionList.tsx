import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  FaCheckCircle,
  FaRegCircle,
  FaRegSquare,
  FaCheckSquare,
  FaTimes,
  FaArrowUp,
  FaArrowDown,
  FaEdit,
  FaTrash,
  FaPlus,
  FaTag,
  FaTags,
  FaUpload,
  FaTrashAlt,
} from "react-icons/fa";
import { QUESTION_TYPES } from "../questionTypes";
import QuestionEditForm from "./QuestionEditForm";
import { Question } from "../ModuleManagement";

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
            {React.createElement(Icon, { className: "h-5 w-5 text-[#034153] mt-0.5 flex-shrink-0 inline mr-1" })}
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
        {(question.imageUrl || question.imageFile) && (
          <img
            src={question.imageUrl || (question.imageFile ? URL.createObjectURL(question.imageFile) : '')}
            alt="Labeled Diagram"
            className="max-w-full h-auto max-h-32 object-contain mb-3 border border-gray-200 rounded-lg"
          />
        )}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          {(question.correctAnswers || []).map((la: any, laIndex: number) => (
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

interface NewQuestionFormProps {
  newQuestion: any;
  onNewQuestionChange: (updates: any) => void;
  onAddQuestion: () => void;
  onNewQuestionAddOption: () => void;
  onNewQuestionUpdateOption: (index: number, value: string) => void;
  onNewQuestionRemoveOption: (index: number) => void;
  onNewQuestionToggleCorrectAnswer: (optionIndex: number) => void;
  isNewOptionCorrect: (optionIndex: number) => boolean;
}

const NewQuestionForm = ({
  newQuestion,
  onNewQuestionChange,
  onAddQuestion,
  onNewQuestionAddOption,
  onNewQuestionUpdateOption,
  onNewQuestionRemoveOption,
  onNewQuestionToggleCorrectAnswer,
  isNewOptionCorrect,
}: NewQuestionFormProps) => {
  const [errors, setErrors] = useState<{ text?: string; options?: string }>({});


  if (newQuestion.type === 'labeling') {
    return (
      <div>
        <NewLabelingQuestion 
          newQuestion={newQuestion} 
          onNewQuestionChange={onNewQuestionChange} 
        />
        
        {/* Add button for labeling questions */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => {
              // Validation
              if (!newQuestion.text && !newQuestion.question) {
                toast.error("Please enter question text");
                return;
              }
              
              if (!newQuestion.correctAnswers || newQuestion.correctAnswers.length === 0) {
                toast.error("Please add at least one label-answer pair");
                return;
              }
              
              if (!newQuestion.imageFile && !newQuestion.imageUrl) {
                toast.error("Please upload an image for the labeling question");
                return;
              }
              
              onAddQuestion();
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#034153] hover:bg-[#023141] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#034153] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Question
          </button>
        </div>
        
      </div>
    );
  }

  const handleAddQuestion = () => {
    const newErrors: { text?: string; options?: string } = {};

    const questionText = newQuestion.text || newQuestion.question;
    if (!questionText || questionText.trim() === "") {
      newErrors.text = "Please enter question name";
    }

    const isOptionBased = newQuestion.type !== 'labeling';
    if (isOptionBased) {
        const hasEnoughOptions = newQuestion.options && newQuestion.options.length >= 2;
        if (!hasEnoughOptions) {
            newErrors.options = "Please add at least two answer options";
        } else {
            const hasCorrectAnswer = newQuestion.options.some((_: any, index: number) => isNewOptionCorrect(index));
            if (!hasCorrectAnswer) {
                newErrors.options = "Please select at least one correct answer option";
            }
        }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onAddQuestion();
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow border border-gray-100 hover:border-gray-200 transition-all">
      <h3 className="text-lg font-medium text-[#034153]">Add New Question</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Question Type</label>
          <select
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#034153] focus:border-[#034153] sm:text-sm rounded-md"
            value={newQuestion.type || ''}
            onChange={(e) => {
              onNewQuestionChange({ ...newQuestion, type: e.target.value });
              setErrors({}); // Reset errors on type change
            }}
          >
            <option value="">Select question type</option>
            {QUESTION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          
          {/* Description of selected question type */}
          {newQuestion.type && (
            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              {(() => {
                const questionType = QUESTION_TYPES.find(type => type.value === newQuestion.type);
                const Icon = questionType?.icon;
                return (
                  <>
                    {Icon && <Icon className="h-3 w-3 text-[#034153]" />}
                    {questionType?.description}
                  </>
                );
              })()}
            </div>
          )}
        </div>

        {newQuestion.type && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Question Text</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#034153] focus:border-[#034153] sm:text-sm"
                value={newQuestion.text || newQuestion.question || ''}
                onChange={(e) => onNewQuestionChange({ ...newQuestion, text: e.target.value, question: e.target.value })}
                placeholder="Enter question text"
              />
              {errors.text && <p className="text-red-500 text-sm mt-1">{errors.text}</p>}
            </div>

            <NewQuestionOptions
              newQuestion={newQuestion}
              onNewQuestionAddOption={onNewQuestionAddOption}
              onNewQuestionUpdateOption={onNewQuestionUpdateOption}
              onNewQuestionRemoveOption={onNewQuestionRemoveOption}
              onNewQuestionToggleCorrectAnswer={onNewQuestionToggleCorrectAnswer}
              isNewOptionCorrect={isNewOptionCorrect}
            />
            {errors.options && <p className="text-red-500 text-sm mt-1">{errors.options}</p>}
            
            {/* Only show warning when needed - don't show any validation initially */}
            {newQuestion.type !== 'labeling' && 
             (newQuestion.text || newQuestion.question) && // Only show when question name is entered
             newQuestion.options && 
             (newQuestion.options.length < 2 ? (
                // Show minimum options warning when less than 2 options
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-2">
                  <p className="text-sm text-blue-700 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Please add at least two answer options
                  </p>
                </div>
              ) : (newQuestion.options.length >= 2 && (!newQuestion.correctAnswers || newQuestion.correctAnswers.length === 0)) && (
                // Show correct answer warning when 2+ options but no correct answers
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-2">
                  <p className="text-sm text-yellow-700 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Please select at least one correct answer before adding the question
                  </p>
                </div>
              )
            )}

            <div className="flex justify-end mt-4">
              <button
                onClick={handleAddQuestion}
                disabled={
                  (!newQuestion.text && !newQuestion.question) || 
                  (newQuestion.type !== 'labeling' && 
                   (!newQuestion.options || newQuestion.options.length < 2)) ||
                  (newQuestion.type !== 'labeling' && 
                   (!newQuestion.correctAnswers || newQuestion.correctAnswers.length === 0))
                }
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#034153] hover:bg-[#023141] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#034153] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Question
              </button>
            </div>

          </>
        )}
      </div>
    </div>
  );
};

const NewQuestionOptions = ({
  newQuestion,
  onNewQuestionAddOption,
  onNewQuestionUpdateOption,
  onNewQuestionRemoveOption,
  onNewQuestionToggleCorrectAnswer,
  isNewOptionCorrect,
}: any) => {
  const hasMinOptions = newQuestion.options && newQuestion.options.length >= 2;
  const hasCorrectAnswer = newQuestion.options && newQuestion.options.some((_: any, index: number) => isNewOptionCorrect(index));
  
  return (
  <div className="space-y-2 border-l-4 border-gray-100 pl-4 py-2">
    <div className="flex justify-between items-center">
      <label className="block text-sm font-medium text-gray-700">
        Options and Correct Answers
      </label>
      <span className="text-xs text-gray-500">
        Min. 2 options required 
        {/* Only show warning when we already have min options */}
        {hasMinOptions && !hasCorrectAnswer && 
          <span className="text-orange-500 font-medium">• Select a correct answer</span>}
      </span>
    </div>
    
    {newQuestion.options!.map((option: string, index: number) => (
      <div key={index} className="flex gap-2 items-center">
        <button
          type="button"
          onClick={() => onNewQuestionToggleCorrectAnswer(index)}
          className={`p-1.5 transition-colors flex-shrink-0 border ${hasMinOptions && !hasCorrectAnswer ? 'border-orange-300 animate-pulse' : 'border-gray-200'} rounded-lg hover:border-gray-300 ${
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
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors flex-shrink-0 border border-gray-200 rounded-lg hover:border-gray-300"
            title="Remove option"
          >
            <FaTimes size={14} />
          </button>
        )}
      </div>
    ))}

    <button
      onClick={onNewQuestionAddOption}
      className="text-[#034153] hover:text-[#004e64] flex items-center gap-1 text-sm font-medium mt-2 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all px-3 py-1 bg-gray-50 hover:bg-gray-100"
    >
      <FaPlus size={12} /> Add Option
    </button>
  </div>
  );
};

const NewLabelingQuestion = ({ newQuestion, onNewQuestionChange }: any) => {
  const labelAnswers = newQuestion.correctAnswers || [];

  // Generate letter labels (A, B, C, D, etc.)
  const generateNextLabel = (index: number): string => {
    return String.fromCharCode(65 + (index % 26));
  };

  const handleLabelChange = (
    index: number,
    fieldOrValue: "label" | "answer" | string,
    value?: string
  ) => {
    const updatedLabels = [...labelAnswers];
    
    if (!updatedLabels[index]) {
      updatedLabels[index] = { label: generateNextLabel(index), answer: "" };
    }

    // Handle both function signatures:
    // 1. handleLabelChange(index, field, value)
    // 2. handleLabelChange(index, value) - for backward compatibility
    const field = value !== undefined ? (fieldOrValue as string) : 'label';
    let fieldValue = value !== undefined ? value : fieldOrValue as string;
    
    // For label field, ensure it's just one character
    if (field === 'label') {
      // Take only the first character and uppercase it
      fieldValue = fieldValue.charAt(0).toUpperCase();
      // If empty, generate a label
      if (!fieldValue) {
        fieldValue = generateNextLabel(index);
      }
    }

    updatedLabels[index] = {
      ...updatedLabels[index],
      [field]: fieldValue,
    };

    onNewQuestionChange({
      ...newQuestion,
      options: updatedLabels.map(la => la.label),
      correctAnswers: updatedLabels
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Store file object AND create blob URL for preview (like course creation)
      const previewUrl = URL.createObjectURL(file);
      
      onNewQuestionChange({ 
        ...newQuestion, 
        imageFile: file,                    // File object for backend
        imageUrl: previewUrl,               // Blob URL for preview only
        correctAnswers: [...labelAnswers]
      });
    }
  };

  const handleRemoveImage = () => {
    onNewQuestionChange({ 
      ...newQuestion, 
      imageFile: null,
      imageUrl: null  // Remove both file and preview URL
    });
  };

  const handleAddLabelKey = () => {
    const newIndex = labelAnswers.length;
    const newLabel = generateNextLabel(newIndex);
    const newLabelAnswers = [...labelAnswers, { label: newLabel, answer: '' }];
    
    onNewQuestionChange({ 
      ...newQuestion, 
      options: newLabelAnswers.map(la => la.label),
      correctAnswers: newLabelAnswers
    });
  };

  const handleRemoveLabelKey = (index: number) => {
    const newLabelAnswers = [...labelAnswers];
    newLabelAnswers.splice(index, 1);
    
    onNewQuestionChange({ 
      ...newQuestion, 
      options: newLabelAnswers.map(la => la.label),
      correctAnswers: newLabelAnswers
    });
  };

  // handleAnswerChange is no longer needed as it's now handled by handleLabelChange

  return (
    <div className="relative rounded-lg border border-gray-200 shadow-sm p-6 space-y-6">
      {/* Subtle header accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-200 to-[#034153]/40 rounded-t-lg"></div>
      
      {/* Header */}
      <div>
        <h4 className="text-lg font-medium text-gray-800">Labeling Question</h4>
        <p className="text-sm text-gray-500 mt-1">
          Enter your question and upload an image with labels
        </p>
      </div>

      {/* Question Text Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Question Text</label>
        <input
          type="text"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#034153] focus:border-[#034153] sm:text-sm"
          value={newQuestion.text || newQuestion.question || ''}
          onChange={(e) => onNewQuestionChange({ ...newQuestion, text: e.target.value, question: e.target.value })}
          placeholder="Enter question text"
        />
      </div>

      {/* Image Upload Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image</label>
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <label className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#034153] cursor-pointer">
            <FaUpload className="mr-2 text-[#034153]" />
            {(newQuestion.imageFile || newQuestion.imageUrl) ? 'Change Image' : 'Upload Image'}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
          {(newQuestion.imageFile || newQuestion.imageUrl) && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
            >
              <FaTrashAlt size={12} /> Remove Image
            </button>
          )}
        </div>
      </div>

      {/* Image Preview and Labels - Responsive Layout */}
      {(newQuestion.imageFile || newQuestion.imageUrl) ? (
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Image Preview - Full width on mobile, left side on desktop */}
          <div className="w-full sm:w-1/2 order-1">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <h5 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4V5h12v10z" clipRule="evenodd" />
                  </svg>
                  Image Preview
                </h5>
              </div>
              <div className="p-4">
                <img
                  src={newQuestion.imageUrl || (newQuestion.imageFile ? URL.createObjectURL(newQuestion.imageFile) : '')}
                  alt="Question content"
                  className="w-full h-auto max-h-80 object-contain rounded"
                />
              </div>
            </div>
          </div>

          {/* Labels Editor - Below image on mobile, right side on desktop */}
          <div className="w-full sm:w-1/2 order-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-white px-5 py-3 flex justify-between items-center">
                <div className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 bg-[#034153]/10 rounded-md">
                    <FaTag className="text-[#034153]" size={14} />
                  </span>
                  <span>Image Labels</span>
                </div>
                <button
                  type="button"
                  onClick={handleAddLabelKey}
                  className="text-sm text-[#034153] border border-[#034153]/30 px-3 py-1.5 rounded-md flex items-center gap-1.5 hover:bg-[#034153]/5 transition-colors"
                >
                  <FaPlus size={10} /> Add Label
                </button>
              </div>
              
              <div className="px-5 pt-4 pb-6 space-y-4">
                {labelAnswers.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <FaTags className="mx-auto mb-2 text-gray-300" size={24} />
                    <p>No labels added yet.</p>
                    <p className="text-sm text-gray-400 mt-1">Click 'Add Label' to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {labelAnswers.map((item: any, index: number) => (
                      <div key={index} className="flex gap-3 items-center py-1">
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <div>
                            <div 
                              className="flex items-center justify-center w-12 h-12 min-w-12 bg-[#034153]/10 border-2 border-[#034153]/30 rounded-md shadow-sm"
                              contentEditable="true"
                              suppressContentEditableWarning={true}
                              onBlur={(e) => handleLabelChange(index, e.currentTarget.textContent || '')}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  e.currentTarget.blur();
                                }
                                if (e.currentTarget.textContent?.length === 1 && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                                  e.preventDefault();
                                }
                              }}
                            >
                              <span className="text-2xl font-bold text-[#034153]">{item.label || generateNextLabel(index)}</span>
                            </div>
                          </div>
                          <div>
                            <input
                              type="text"
                              value={item.answer}
                              onChange={(e) => handleLabelChange(index, 'answer', e.target.value)}
                              placeholder="Correct answer"
                              className="w-full h-12 px-3 border-2 border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#034153] focus:border-[#034153]"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveLabelKey(index)}
                          className="text-gray-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50 transition-colors"
                          title="Remove label"
                        >
                          <FaTimes size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : labelAnswers.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h5 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <FaTag className="text-yellow-500" />
            Current Labels
          </h5>
          <div className="space-y-2">
            {labelAnswers.map((item: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">{item.label || 'Untitled Label'}:</span>
                <span className="text-sm text-gray-500">{item.answer || 'No answer'}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default QuestionList;