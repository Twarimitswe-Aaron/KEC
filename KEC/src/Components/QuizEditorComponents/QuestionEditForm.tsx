import { useState, useEffect } from 'react';

// Types
interface Question {
  id: number;
  question: string;
  type: 'multiple_choice' | 'labeling' | 'text';
  options?: string[];
  correctAnswer?: string | number;
  correctAnswers?: (string | number)[];
  [key: string]: any;
}

interface QuestionEditFormProps {
  question: Question;
  onUpdate: (id: number, updates: Partial<Question>) => void;
  onToggleCorrectAnswer: (questionId: number, optionIndex: number) => void;
  onAddOption: (questionId: number) => void;
  onUpdateOption: (questionId: number, optionIndex: number, value: string) => void;
  onRemoveOption: (questionId: number, optionIndex: number) => void;
  onUpdateLabelAnswer: (questionId: number, index: number, field: 'label' | 'answer', value: string) => void;
  onAddLabelKey: (questionId: number) => void;
  onRemoveLabelKey: (questionId: number, index: number) => void;
  isOptionCorrect: (questionId: number, optionIndex: number) => boolean;
  onDelete?: (questionId: number) => Promise<void> | void;
  onCancel?: () => void;
}

// Loading state component
const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#034153]"></div>
);

// Question Options Edit Component
const QuestionOptionsEdit = ({
  question,
  onToggleCorrectAnswer,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
  isOptionCorrect,
  disabled = false,
}: QuestionOptionsEditProps) => {
  const handleAddOption = () => {
    onAddOption(question.id);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Options</label>
        <button
          type="button"
          onClick={handleAddOption}
          disabled={disabled}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Option
        </button>
      </div>
      
      <div className="space-y-2">
        {question.options?.map((option, index) => (
          <div key={index} className="flex items-center gap-2 group">
            {/* Correct Answer Toggle */}
            <button
              type="button"
              onClick={() => onToggleCorrectAnswer(question.id, index)}
              disabled={disabled}
              className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                isOptionCorrect(question.id, index)
                  ? 'bg-[#034153] border-[#034153] text-white'
                  : 'border-gray-300 hover:border-gray-400 bg-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={isOptionCorrect(question.id, index) ? "Correct answer" : "Mark as correct answer"}
            >
              {isOptionCorrect(question.id, index) && (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            {/* Option Input */}
            <input
              type="text"
              value={option}
              onChange={(e) => onUpdateOption(question.id, index, e.target.value)}
              placeholder={`Option ${index + 1}`}
              disabled={disabled}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-300 focus:ring-2 focus:ring-[#034153] focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />

            {/* Remove Option Button - Show if more than 1 option exists */}
            {question.options && question.options.length > 1 && (
              <button
                type="button"
                onClick={() => onRemoveOption(question.id, index)}
                disabled={disabled}
                className="flex-shrink-0 w-8 h-8 text-red-600 hover:bg-red-50 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed opacity-70 group-hover:opacity-100"
                title="Remove option"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Helper Text */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Click the circle to mark an option as correct answer</p>
        <p>• Add more options using the "Add Option" button</p>
        <p>• At least 2 options are required</p>
      </div>
    </div>
  );
};

// Labeling Question Edit Component
const LabelingQuestionEdit = ({
  question,
  onUpdate,
  onUpdateLabelAnswer,
  onAddLabelKey,
  onRemoveLabelKey,
  disabled = false,
}: LabelingQuestionEditProps) => {
  const labelAnswers = question.labelAnswers || [];

  const handleAddLabelKey = () => {
    onAddLabelKey(question.id);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Label Pairs</label>
        <button
          type="button"
          onClick={handleAddLabelKey}
          disabled={disabled}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Pair
        </button>
      </div>

      <div className="space-y-2">
        {labelAnswers.map((pair: any, index: number) => (
          <div key={index} className="flex items-center gap-2 group">
            <input
              type="text"
              value={pair.label || ''}
              onChange={(e) => onUpdateLabelAnswer(question.id, index, 'label', e.target.value)}
              placeholder="Label"
              disabled={disabled}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-300 focus:ring-2 focus:ring-[#034153] focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span className="text-gray-500 flex-shrink-0">→</span>
            <input
              type="text"
              value={pair.answer || ''}
              onChange={(e) => onUpdateLabelAnswer(question.id, index, 'answer', e.target.value)}
              placeholder="Answer"
              disabled={disabled}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-300 focus:ring-2 focus:ring-[#034153] focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={() => onRemoveLabelKey(question.id, index)}
              disabled={disabled}
              className="flex-shrink-0 w-8 h-8 text-red-600 hover:bg-red-50 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed opacity-70 group-hover:opacity-100"
              title="Remove pair"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Text Answer Edit Component
const TextAnswerEdit = ({
  question,
  onSetTextCorrectAnswer,
  disabled = false,
}: TextAnswerEditProps) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">Correct Answer</label>
      <textarea
        value={question.correctAnswer?.toString() || ''}
        onChange={(e) => onSetTextCorrectAnswer(e.target.value)}
        placeholder="Enter the correct text answer..."
        rows={3}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-300 focus:ring-2 focus:ring-[#034153] focus:border-transparent transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
};

// Question Settings Component
const QuestionSettings = ({
  question,
  onUpdate,
  disabled = false,
}: QuestionSettingsProps) => {
  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="font-medium text-gray-700">Question Settings</h4>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Points */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Points
          </label>
          <input
            type="number"
            min="1"
            value={question.points || 1}
            onChange={(e) => onUpdate({ points: parseInt(e.target.value) || 1 })}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-300 focus:ring-2 focus:ring-[#034153] focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Required */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id={`required-${question.id}`}
            checked={question.required || false}
            onChange={(e) => onUpdate({ required: e.target.checked })}
            disabled={disabled}
            className="w-4 h-4 text-[#034153] border-gray-300 rounded focus:ring-[#034153] disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <label htmlFor={`required-${question.id}`} className="ml-2 text-sm text-gray-700">
            Required question
          </label>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (Optional)
        </label>
        <textarea
          value={question.description || ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Add a description or instructions..."
          rows={2}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-300 focus:ring-2 focus:ring-[#034153] focus:border-transparent transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
};

const QuestionEditForm = ({
  question,
  onUpdate,
  onToggleCorrectAnswer,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
  onUpdateLabelAnswer,
  onAddLabelKey,
  onRemoveLabelKey,
  isOptionCorrect,
  onDelete,
  onCancel,
}: QuestionEditFormProps) => {
  // Local state management
  const [localQuestion, setLocalQuestion] = useState<Question>(question);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Sync local question when prop changes
  useEffect(() => {
    if (!isDirty) {
      setLocalQuestion(question);
    }
  }, [question, isDirty]);

  // Handle local updates
  const handleLocalUpdate = (updates: Partial<Question>) => {
    setLocalQuestion(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
    setError(null);
  };

  // Save changes to parent
  const handleSave = async () => {
    if (!isDirty) return;

    setIsSaving(true);
    setError(null);

    try {
      await onUpdate(localQuestion.id, localQuestion);
      setIsDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save question');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete with confirmation
  const handleDelete = async () => {
    if (!onDelete) return;

    setIsDeleting(true);
    setError(null);

    try {
      await onDelete(question.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete question');
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle text answer change
  const handleTextAnswerChange = (value: string) => {
    handleLocalUpdate({ 
      correctAnswer: value,
      correctAnswers: [value]
    });
  };

  // Discard changes
  const handleCancel = () => {
    setLocalQuestion(question);
    setIsDirty(false);
    setError(null);
    onCancel?.();
  };

  // Check if form is currently processing
  const isProcessing = isSaving || isDeleting;

  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-white">
      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Question Text */}
      <textarea
        value={localQuestion.question}
        onChange={(e) => handleLocalUpdate({ question: e.target.value })}
        placeholder="Enter your question here..."
        rows={2}
        disabled={isProcessing}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all focus:ring-2 focus:ring-[#034153] focus:border-transparent resize-none text-sm sm:text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      />

      {/* Question Content Based on Type */}
      {localQuestion.options ? (
        <QuestionOptionsEdit
          question={localQuestion}
          onToggleCorrectAnswer={onToggleCorrectAnswer}
          onAddOption={onAddOption}
          onUpdateOption={onUpdateOption}
          onRemoveOption={onRemoveOption}
          isOptionCorrect={isOptionCorrect}
          disabled={isProcessing}
        />
      ) : localQuestion.type === "labeling" ? (
        <LabelingQuestionEdit
          question={localQuestion}
          onUpdate={handleLocalUpdate}
          onUpdateLabelAnswer={onUpdateLabelAnswer}
          onAddLabelKey={onAddLabelKey}
          onRemoveLabelKey={onRemoveLabelKey}
          disabled={isProcessing}
        />
      ) : localQuestion.type === "text" ? (
        <TextAnswerEdit
          question={localQuestion}
          onSetTextCorrectAnswer={handleTextAnswerChange}
          disabled={isProcessing}
        />
      ) : null}

      {/* Question Settings */}
      <QuestionSettings 
        question={localQuestion} 
        onUpdate={handleLocalUpdate}
        disabled={isProcessing}
      />

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={!isDirty || isProcessing}
          className="flex items-center gap-2 px-4 py-2 bg-[#034153] text-white rounded-lg hover:bg-[#023542] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {isSaving && <LoadingSpinner />}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>

        {onCancel && (
          <button
            onClick={handleCancel}
            disabled={isProcessing}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            Cancel
          </button>
        )}

        {onDelete && (
          <>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isProcessing}
              className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {isDeleting ? <LoadingSpinner /> : 'Delete Question'}
            </button>

            {/* Delete Confirmation Dialog */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg max-w-sm mx-4">
                  <h3 className="text-lg font-semibold mb-2">Delete Question</h3>
                  <p className="text-gray-600 mb-4">
                    Are you sure you want to delete this question? This action cannot be undone.
                  </p>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isDeleting}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm"
                    >
                      {isDeleting && <LoadingSpinner />}
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Dirty State Indicator */}
      {isDirty && (
        <div className="text-xs text-amber-600 flex items-center gap-1">
          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
          Unsaved changes
        </div>
      )}
    </div>
  );
};

// Props interfaces for child components
interface QuestionOptionsEditProps {
  question: Question;
  onToggleCorrectAnswer: (questionId: number, optionIndex: number) => void;
  onAddOption: (questionId: number) => void;
  onUpdateOption: (questionId: number, optionIndex: number, value: string) => void;
  onRemoveOption: (questionId: number, optionIndex: number) => void;
  isOptionCorrect: (questionId: number, optionIndex: number) => boolean;
  disabled?: boolean;
}

interface LabelingQuestionEditProps {
  question: Question;
  onUpdate: (updates: Partial<Question>) => void;
  onUpdateLabelAnswer: (questionId: number, index: number, field: 'label' | 'answer', value: string) => void;
  onAddLabelKey: (questionId: number) => void;
  onRemoveLabelKey: (questionId: number, index: number) => void;
  disabled?: boolean;
}

interface TextAnswerEditProps {
  question: Question;
  onSetTextCorrectAnswer: (value: string) => void;
  disabled?: boolean;
}

interface QuestionSettingsProps {
  question: Question;
  onUpdate: (updates: Partial<Question>) => void;
  disabled?: boolean;
}

export default QuestionEditForm;