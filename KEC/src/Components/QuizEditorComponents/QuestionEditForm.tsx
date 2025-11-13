import { useState, useEffect } from 'react';

// Types
interface Question {
  id: number;
  question: string;
  type: 'multiple_choice' | 'labeling' | 'text' | 'multiple' | 'checkbox' | 'truefalse';
  options?: string[];
  correctAnswer?: string | number;
  correctAnswers?: (string | number | { label: string; answer: string })[];
  labelAnswers?: { label: string; answer: string }[];
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
    onAddOption();
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
  const labelAnswers = question.correctAnswers || [];

  const handleAddLabelKey = () => {
    onAddLabelKey();
  };

  // Generate letter labels (A, B, C, D, etc.)
  const generateNextLabel = (index: number): string => {
    return String.fromCharCode(65 + (index % 26));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      onUpdate({ 
        imageFile: file,
        imageUrl: previewUrl
      });
    }
  };

  const handleRemoveImage = () => {
    onUpdate({ 
      imageFile: null,
      imageUrl: null
    });
  };

  return (
    <div className="space-y-6">
      {/* Image Upload Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Question Image</label>
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <label className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#034153] cursor-pointer">
            <svg className="w-4 h-4 mr-2 text-[#034153]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {(question.imageFile || question.imageUrl) ? 'Change Image' : 'Upload Image'}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={disabled}
              className="hidden"
            />
          </label>
          {(question.imageFile || question.imageUrl) && (
            <button
              type="button"
              onClick={handleRemoveImage}
              disabled={disabled}
              className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1 disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Remove Image
            </button>
          )}
        </div>
        {(question.imageFile || question.imageUrl) && (
          <div className="mt-4">
            <img
              src={question.imageUrl || (question.imageFile ? URL.createObjectURL(question.imageFile) : '')}
              alt="Question Image"
              className="max-w-full h-auto max-h-64 object-contain rounded-lg border border-gray-200"
            />
          </div>
        )}
      </div>

      {/* Label Pairs Section */}
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

        <div className="space-y-3">
          {labelAnswers.length === 0 ? (
            <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
              <svg className="mx-auto mb-2 text-gray-300 w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <p>No labels added yet.</p>
              <p className="text-sm text-gray-400 mt-1">Click 'Add Pair' to get started</p>
            </div>
          ) : (
            labelAnswers.map((pair: any, index: number) => (
              <div key={index} className="flex items-center gap-3 group p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-all">
                {/* Label Input */}
                <div className="flex-shrink-0">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Label</label>
                  <div className="flex items-center justify-center w-12 h-12 bg-[#034153]/10 border-2 border-[#034153]/30 rounded-md">
                    <input
                      type="text"
                      value={pair.label || generateNextLabel(index)}
                      onChange={(e) => {
                        const value = e.target.value.charAt(0).toUpperCase() || generateNextLabel(index);
                        onUpdateLabelAnswer(question.id, index, 'label', value);
                      }}
                      maxLength={1}
                      disabled={disabled}
                      className="w-8 h-8 text-center text-xl font-bold text-[#034153] bg-transparent border-none outline-none disabled:opacity-50"
                    />
                  </div>
                </div>
                
                <span className="text-gray-400 flex-shrink-0">→</span>
                
                {/* Answer Input */}
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Answer</label>
                  <input
                    type="text"
                    value={pair.answer || ''}
                    onChange={(e) => onUpdateLabelAnswer(question.id, index, 'answer', e.target.value)}
                    placeholder="Enter answer"
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-300 focus:ring-2 focus:ring-[#034153] focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                
                {/* Remove Button */}
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
            ))
          )}
        </div>
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
  const [localQuestion, setLocalQuestion] = useState<Question>({
    ...question,
    options: question.options || [],
    correctAnswers: question.correctAnswers || []
  });
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Sync local question when prop changes
  useEffect(() => {
    if (!isDirty) {
      setLocalQuestion({
        ...question,
        options: question.options || [],
        correctAnswers: question.correctAnswers || []
      });
    }
  }, [question, isDirty]);

  // Validation function
  const validateQuestion = (): string[] => {
    const errors: string[] = [];
    
    if (!localQuestion.question.trim()) {
      errors.push('Question text is required');
    }
    
    if (localQuestion.options && localQuestion.options.length > 0) {
      // Check if all options have content
      const emptyOptions = localQuestion.options.some(option => !option.trim());
      if (emptyOptions) {
        errors.push('All options must have content');
      }
      
      // Check if at least one correct answer is selected
      if (!localQuestion.correctAnswers || localQuestion.correctAnswers.length === 0) {
        errors.push('At least one correct answer must be selected');
      }
      
      // Must have at least 2 options for multiple choice questions
      if (localQuestion.options.length < 2) {
        errors.push('Multiple choice questions must have at least 2 options');
      }
    }
    
    if (localQuestion.type === 'labeling') {
      if (!localQuestion.correctAnswers || localQuestion.correctAnswers.length === 0) {
        errors.push('Labeling questions must have at least one label pair');
      } else {
        const incompletePairs = localQuestion.correctAnswers.some((pair: any) => 
          !pair.label?.trim() || !pair.answer?.trim()
        );
        if (incompletePairs) {
          errors.push('All label pairs must have both label and answer');
        }
      }
      
      // Check for image
      if (!localQuestion.imageFile && !localQuestion.imageUrl) {
        errors.push('Labeling questions must have an image');
      }
    }
    
    if (localQuestion.type === 'text') {
      if (!localQuestion.correctAnswer || !localQuestion.correctAnswer.toString().trim()) {
        errors.push('Text questions must have a correct answer');
      }
    }
    
    return errors;
  };

  // Handle local updates
  const handleLocalUpdate = (updates: Partial<Question>) => {
    setLocalQuestion(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
    setError(null);
    setValidationErrors([]);
  };

  // Local option management
  const handleLocalAddOption = () => {
    const newOptions = [...(localQuestion.options || []), ''];
    handleLocalUpdate({ options: newOptions });
  };

  const handleLocalUpdateOption = (optionIndex: number, value: string) => {
    const newOptions = [...(localQuestion.options || [])];
    newOptions[optionIndex] = value;
    handleLocalUpdate({ options: newOptions });
  };

  const handleLocalRemoveOption = (optionIndex: number) => {
    if ((localQuestion.options?.length || 0) <= 1) return;
    
    const newOptions = localQuestion.options?.filter((_, i) => i !== optionIndex) || [];
    const newCorrectAnswers = localQuestion.correctAnswers?.filter((ca: any) => 
      typeof ca === 'number' ? ca !== optionIndex : true
    ).map((ca: any) => typeof ca === 'number' && ca > optionIndex ? ca - 1 : ca) || [];
    
    handleLocalUpdate({ 
      options: newOptions,
      correctAnswers: newCorrectAnswers
    });
  };

  const handleLocalToggleCorrectAnswer = (optionIndex: number) => {
    const currentAnswers = localQuestion.correctAnswers || [];
    let updatedAnswers;
    
    if (localQuestion.type === 'multiple' || localQuestion.type === 'truefalse' || localQuestion.type === 'multiple_choice') {
      updatedAnswers = currentAnswers.includes(optionIndex) ? [] : [optionIndex];
    } else {
      updatedAnswers = currentAnswers.includes(optionIndex)
        ? currentAnswers.filter((ca: any) => ca !== optionIndex)
        : [...currentAnswers, optionIndex];
    }
    
    handleLocalUpdate({ correctAnswers: updatedAnswers });
  };

  // Generate letter labels (A, B, C, D, etc.)
  const generateNextLabel = (index: number): string => {
    return String.fromCharCode(65 + (index % 26));
  };

  // Local label management (using correctAnswers)
  const handleLocalAddLabelKey = () => {
    const currentLabels = (localQuestion.correctAnswers || []) as { label: string; answer: string }[];
    const newIndex = currentLabels.length;
    const newLabel = generateNextLabel(newIndex);
    const newLabelAnswers = [...currentLabels, { label: newLabel, answer: '' }];
    handleLocalUpdate({ 
      correctAnswers: newLabelAnswers,
      options: newLabelAnswers.map(la => la.label)
    });
  };

  const handleLocalUpdateLabelAnswer = (index: number, field: 'label' | 'answer', value: string) => {
    const newLabelAnswers = [...(localQuestion.correctAnswers || [])] as { label: string; answer: string }[];
    if (newLabelAnswers[index]) {
      newLabelAnswers[index] = { ...newLabelAnswers[index], [field]: value };
      handleLocalUpdate({ 
        correctAnswers: newLabelAnswers,
        options: newLabelAnswers.map(la => la.label)
      });
    }
  };

  const handleLocalRemoveLabelKey = (index: number) => {
    const newLabelAnswers = (localQuestion.correctAnswers?.filter((_: any, i: number) => i !== index) || []) as { label: string; answer: string }[];
    handleLocalUpdate({ 
      correctAnswers: newLabelAnswers,
      options: newLabelAnswers.map(la => la.label)
    });
  };

  // Check if option is correct in local state
  const isLocalOptionCorrect = (optionIndex: number): boolean => {
    return localQuestion.correctAnswers?.includes(optionIndex) || false;
  };

  // Save changes to parent
  const handleSave = async () => {
    if (!isDirty) return;

    // Validate before saving
    const errors = validateQuestion();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSaving(true);
    setError(null);
    setValidationErrors([]);

    try {
      const updates = { ...localQuestion };
      await onUpdate(localQuestion.id, updates);
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
    setValidationErrors([]);
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

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-amber-800">Please fix the following issues:</span>
          </div>
          <ul className="list-disc list-inside space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index} className="text-sm text-amber-700">{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Question Content Based on Type */}
      {localQuestion.type === "labeling" ? (
        <LabelingQuestionEdit
          question={localQuestion}
          onUpdate={handleLocalUpdate}
          onUpdateLabelAnswer={(_, index, field, value) => handleLocalUpdateLabelAnswer(index, field, value)}
          onAddLabelKey={handleLocalAddLabelKey}
          onRemoveLabelKey={(_, index) => handleLocalRemoveLabelKey(index)}
          disabled={isProcessing}
        />
      ) : localQuestion.type === "text" ? (
        <TextAnswerEdit
          question={localQuestion}
          onSetTextCorrectAnswer={handleTextAnswerChange}
          disabled={isProcessing}
        />
      ) : localQuestion.options ? (
        <QuestionOptionsEdit
          question={localQuestion}
          onToggleCorrectAnswer={(_, optionIndex) => handleLocalToggleCorrectAnswer(optionIndex)}
          onAddOption={handleLocalAddOption}
          onUpdateOption={(_, optionIndex, value) => handleLocalUpdateOption(optionIndex, value)}
          onRemoveOption={(_, optionIndex) => handleLocalRemoveOption(optionIndex)}
          isOptionCorrect={(_, optionIndex) => isLocalOptionCorrect(optionIndex)}
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
  onAddOption: () => void;
  onUpdateOption: (questionId: number, optionIndex: number, value: string) => void;
  onRemoveOption: (questionId: number, optionIndex: number) => void;
  isOptionCorrect: (questionId: number, optionIndex: number) => boolean;
  disabled?: boolean;
}

interface LabelingQuestionEditProps {
  question: Question;
  onUpdate: (updates: Partial<Question>) => void;
  onUpdateLabelAnswer: (questionId: number, index: number, field: 'label' | 'answer', value: string) => void;
  onAddLabelKey: () => void;
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