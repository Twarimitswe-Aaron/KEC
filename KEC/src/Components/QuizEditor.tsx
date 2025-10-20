// src/components/QuizEditor.tsx
import { FaCheckCircle, FaEdit, FaQuestionCircle, FaTimes } from "react-icons/fa";
import { FaCheck, FaList, FaPlus, FaRegCircle, FaRegSquare, FaTrash, FaArrowUp, FaArrowDown } from "react-icons/fa6";
import { toast } from "react-toastify";
import { useState, useRef, useEffect } from "react";
import { X, Eye, Hash, Type, List as ListIcon, CheckSquare, ToggleLeft, Menu } from "lucide-react";
import { useGetQuizQuery, useUpdateQuizMutation, useCreateQuizMutation } from "../state/api/quizApi";

// Define proper TypeScript interfaces
export interface Question {
  id: number;
  type: 'multiple' | 'checkbox' | 'truefalse' | 'short' | 'long' | 'number';
  question: string;
  description?: string;
  options?: string[];
  correctAnswers?: (string | number)[]; // Array of correct answers (indices or values)
  correctAnswer?: string | number; // For single correct answer types
  required: boolean;
  points: number;
}

export interface QuizSettings {
  title: string;
  description?: string;
  shuffleQuestions?: boolean;
  timeLimit?: number;
  showResults?: boolean;
  allowRetakes?: boolean;
  passingScore?: number;
}

export interface ResourceType {
  id: number;
  name: string;
  description?: string;
  quizId?: number;
  quiz?: any;
  type: string;
}

interface QuizEditorProps {
  resource: ResourceType;
  onClose: () => void;
  onUpdate?: (resourceId: number, updatedQuiz: any) => void;
}

const QuizEditor = ({ resource, onClose, onUpdate }: QuizEditorProps) => {
  console.log(resource,"resources of this lesson")
  // RTK Query hooks
  const { 
    data: quizData, 
    isLoading, 
    error,
    refetch 
  } = useGetQuizQuery(resource.quizId!, {
    skip: !resource.quizId
  });

  console.log(quizData)

  
  
  const [updateQuiz, { isLoading: isUpdating }] = useUpdateQuizMutation();
  const [createQuiz, { isLoading: isCreating }] = useCreateQuizMutation();

  // Initialize state with proper fallbacks
  const getInitialQuestions = (): Question[] => {
    if (Array.isArray(resource.quiz)) {
      return resource.quiz.map((q: any, index: number) => ({
        id: q.id || Date.now() + index,
        type: q.type || 'multiple',
        question: q.question || '',
        description: q.description || '',
        options: q.options || (q.type !== 'short' && q.type !== 'long' && q.type !== 'number' ? [''] : undefined),
        correctAnswers: q.correctAnswers || [],
        correctAnswer: q.correctAnswer,
        required: q.required || false,
        points: q.points || 1
      }));
    }
    
    if (quizData?.questions) {
      return quizData.questions.map((q: any, index: number) => ({
        id: q.id || Date.now() + index,
        type: q.type,
        question: q.question,
        description: q.description || '',
        options: q.options,
        correctAnswers: q.correctAnswers || [],
        correctAnswer: q.correctAnswer,
        required: q.required || false,
        points: q.points || 1
      }));
    }
    
    return [];
  };

  const getInitialSettings = (): QuizSettings => {
    return resource.quiz?.settings || quizData?.settings || {
      title: resource.name,
      description: resource.description || "",
      shuffleQuestions: false,
      timeLimit: 0,
      showResults: true,
      allowRetakes: false,
      passingScore: 0,
    };
  };

  const [questions, setQuestions] = useState<Question[]>(getInitialQuestions);
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const [quizSettings, setQuizSettings] = useState<QuizSettings>(getInitialSettings);
  const [showSidebar, setShowSidebar] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update local state when quiz data loads
  useEffect(() => {
    if (quizData) {
      setQuestions(getInitialQuestions());
      setQuizSettings(getInitialSettings());
    }
  }, [quizData]);

  const questionTypes = [
    {
      value: "multiple",
      label: "Multiple Choice",
      icon: FaRegCircle,
      description: "Single select from options"
    },
    {
      value: "checkbox",
      label: "Checkbox",
      icon: CheckSquare,
      description: "Multiple select from options"
    },
    {
      value: "truefalse",
      label: "True/False",
      icon: ToggleLeft,
      description: "True or false selection"
    },
    {
      value: "short",
      label: "Short Answer",
      icon: Type,
      description: "Short text response"
    },
    {
      value: "long",
      label: "Paragraph",
      icon: ListIcon,
      description: "Long text response"
    },
    {
      value: "number",
      label: "Number",
      icon: Hash,
      description: "Numeric response"
    }
  ];

  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    type: "multiple",
    question: "",
    description: "",
    options: [""],
    correctAnswers: [],
    correctAnswer: undefined,
    required: false,
    points: 1
  });

 // Save quiz to backend
const saveQuiz = async () => {
  if (isSaving) return;

  setIsSaving(true);
  try {
    // --- STEP 1: Only include non-empty fields in payload ---
    const filteredQuizSettings = Object.fromEntries(
      Object.entries(quizSettings).filter(([_, value]) => 
        value !== null && value !== undefined && value !== ''
      )
    );

    const filteredQuestions = questions
      .filter(q => q.question?.trim() !== '') // skip completely empty questions
      .map((q, index) => {
        // remove empty values per question
        const cleanedQuestion = Object.fromEntries(
          Object.entries(q).filter(([_, value]) => 
            value !== null && value !== undefined && value !== ''
          )
        );
        return {
          ...cleanedQuestion,
          points: q.points || 1,
          order: index
        };
      });

    // Ensure we have a name - use resource name as fallback if settings name is not set
    const quizName = filteredQuizSettings.name || resource.name;
    if (!quizName) {
      toast.error("Quiz name is required");
      setIsSaving(false);
      return;
    }

    const quizPayload: any = {
      name: quizName, // Always include name, it's required
      ...(filteredQuizSettings.description && { description: filteredQuizSettings.description }),
      resourceId: resource.id, // resourceId is required, so include it directly
      ...(filteredQuestions.length > 0 && { questions: filteredQuestions }),
      settings: filteredQuizSettings
    };

    // Check if we have at least questions or settings
    if (!filteredQuestions.length && Object.keys(filteredQuizSettings).length === 0) {
      toast.error("Please add at least one question or setting before saving.");
      setIsSaving(false);
      return;
    }

    let message: string | undefined;
    console.log(resource, "hello now i can see the resource");

    // --- STEP 2: Decide create or update ---
    if (resource.quizId) {
      // Update existing quiz
      const updateResult: { message?: string } = await updateQuiz({
        id: resource.quizId,
        data: quizPayload
      }).unwrap();
      message = updateResult.message;
      console.log("Updating quiz:", message);
      toast.success("Quiz updated successfully!");
    } else {
      // Create new quiz
            const result = await createQuiz(quizPayload).unwrap() as any;
            console.log(result, "Quiz created");
            toast.success("Quiz created successfully!");
      
            // Callback with new quiz data - use returned id if available
            if (onUpdate) {
              onUpdate(resource.id, { 
                ...resource.quiz, 
                id: result?.id ?? resource.quiz?.id, 
                questions: filteredQuestions, 
                settings: filteredQuizSettings 
              });
            }
    }

    setHasChanges(false);

    // --- STEP 3: Refetch to sync state ---
    if (resource.quizId) {
      await refetch();
    }
  } catch (error: any) {
    console.error('Failed to save quiz:', error);
    const errorMessage =
      error?.data?.message || error?.message || "Failed to save quiz. Please try again.";
    toast.error(errorMessage);
  } finally {
    setIsSaving(false);
  }
};



  useEffect(() => {
    if (hasChanges && !isSaving) {
      const autoSaveTimer = setTimeout(() => {
        saveQuiz();
      }, 3000);

      return () => clearTimeout(autoSaveTimer);
    }
  }, [ quizSettings]);

  // Mark changes when questions or settings are modified
  useEffect(() => {
    if (questions.length > 0 || quizSettings.title !== resource.name) {
      setHasChanges(true);
    }
  }, [questions, quizSettings]);

  // Add new question
  const addQuestion = () => {
    if (!newQuestion.question?.trim()) {
      toast.error("Please enter a question");
      return;
    }

    const question: Question = {
      id: Date.now(),
      type: newQuestion.type as any,
      question: newQuestion.question.trim(),
      description: newQuestion.description?.trim() || '',
      options: newQuestion.type !== "short" && newQuestion.type !== "long" && newQuestion.type !== "number" 
        ? newQuestion.options?.filter(opt => opt.trim()).map(opt => opt.trim()) 
        : undefined,
      correctAnswers: newQuestion.correctAnswers || [],
      correctAnswer: newQuestion.correctAnswer,
      required: newQuestion.required || false,
      points: newQuestion.points || 1
    };

    const updatedQuestions = [...questions, question];
    setQuestions(updatedQuestions);
    setHasChanges(true);
    
    // Call onUpdate callback if provided
    if (onUpdate) {
      onUpdate(resource.id, { 
        ...resource.quiz, 
        questions: updatedQuestions, 
        settings: quizSettings 
      });
    }
    
    // Reset new question form
    setNewQuestion({
      type: "multiple",
      question: "",
      description: "",
      options: [""],
      correctAnswers: [],
      correctAnswer: undefined,
      required: false,
      points: 1
    });
    
    toast.success("Question added successfully!");
  };

  // Update existing question
  const updateQuestion = (questionId: number, updates: Partial<Question>) => {
    const updatedQuestions = questions.map(q => 
      q.id === questionId ? { ...q, ...updates } : q
    );
    setQuestions(updatedQuestions);
    setHasChanges(true);
    
    if (onUpdate) {
      onUpdate(resource.id, { 
        ...resource.quiz, 
        questions: updatedQuestions, 
        settings: quizSettings 
      });
    }
  };

  // Delete question
  const deleteQuestion = (questionId: number) => {
    const updatedQuestions = questions.filter(q => q.id !== questionId);
    setQuestions(updatedQuestions);
    setHasChanges(true);
    
    if (onUpdate) {
      onUpdate(resource.id, { 
        ...resource.quiz, 
        questions: updatedQuestions, 
        settings: quizSettings 
      });
    }
    
    toast.success("Question deleted successfully!");
  };

  // Reorder questions
  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === questions.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedQuestions = [...questions];
    [updatedQuestions[index], updatedQuestions[newIndex]] = [updatedQuestions[newIndex], updatedQuestions[index]];
    setQuestions(updatedQuestions);
    setHasChanges(true);
    
    if (onUpdate) {
      onUpdate(resource.id, { 
        ...resource.quiz, 
        questions: updatedQuestions, 
        settings: quizSettings 
      });
    }
  };

  // Option management
  const addOption = (questionId: number) => {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options) {
      const updatedOptions = [...question.options, ""];
      updateQuestion(questionId, { options: updatedOptions });
    }
  };

  const updateOption = (questionId: number, optionIndex: number, value: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options) {
      const updatedOptions = [...question.options];
      updatedOptions[optionIndex] = value;
      updateQuestion(questionId, { options: updatedOptions });
    }
  };

  const removeOption = (questionId: number, optionIndex: number) => {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options && question.options.length > 1) {
      const updatedOptions = question.options.filter((_, index) => index !== optionIndex);
      
      // Also remove from correct answers if this option was marked as correct
      let updatedCorrectAnswers = question.correctAnswers || [];
      if (question.type === 'multiple' || question.type === 'truefalse') {
        if (question.correctAnswer === optionIndex) {
          updatedCorrectAnswers = [];
        }
      } else if (question.type === 'checkbox') {
        updatedCorrectAnswers = updatedCorrectAnswers.filter(ans => ans !== optionIndex);
      }
      
      updateQuestion(questionId, { 
        options: updatedOptions,
        correctAnswers: updatedCorrectAnswers,
        correctAnswer: question.type === 'multiple' || question.type === 'truefalse' 
          ? (question.correctAnswer === optionIndex ? undefined : question.correctAnswer)
          : question.correctAnswer
      });
    }
  };

  // Correct answer management
  const toggleCorrectAnswer = (questionId: number, optionIndex: number) => {
    const question = questions.find(q => q.id === questionId);
    if (!question || !question.options) return;

    if (question.type === 'multiple' || question.type === 'truefalse') {
      // Single correct answer - toggle the selected option
      const newCorrectAnswer = question.correctAnswer === optionIndex ? undefined : optionIndex;
      updateQuestion(questionId, { 
        correctAnswer: newCorrectAnswer,
        correctAnswers: newCorrectAnswer !== undefined ? [newCorrectAnswer] : []
      });
    } else if (question.type === 'checkbox') {
      // Multiple correct answers - toggle the option in the array
      const currentCorrectAnswers = question.correctAnswers || [];
      const isCurrentlyCorrect = currentCorrectAnswers.includes(optionIndex);
      const newCorrectAnswers = isCurrentlyCorrect
        ? currentCorrectAnswers.filter(ans => ans !== optionIndex)
        : [...currentCorrectAnswers, optionIndex];
      
      updateQuestion(questionId, { correctAnswers: newCorrectAnswers });
    }
  };

  // Set correct answer for text/number questions
  const setTextCorrectAnswer = (questionId: number, answer: string) => {
    updateQuestion(questionId, { 
      correctAnswer: answer,
      correctAnswers: [answer]
    });
  };

  const getQuestionIcon = (type: string) => {
    const questionType = questionTypes.find(t => t.value === type);
    return questionType?.icon || FaQuestionCircle;
  };

  // Check if an option is correct
  const isOptionCorrect = (question: Question, optionIndex: number): boolean => {
    if (question.type === 'multiple' || question.type === 'truefalse') {
      return question.correctAnswer === optionIndex;
    } else if (question.type === 'checkbox') {
      return (question.correctAnswers || []).includes(optionIndex);
    }
    return false;
  };

  // Handle settings changes
  const handleSettingsChange = (key: keyof QuizSettings, value: any) => {
    setQuizSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  // Handle manual save
  const handleManualSave = async () => {
    console.log("request updating quiz")
    await saveQuiz();
  };

  // Reset new question options when type changes
  useEffect(() => {
    if (newQuestion.type === "short" || newQuestion.type === "long" || newQuestion.type === "number") {
      setNewQuestion(prev => ({ 
        ...prev, 
        options: undefined,
        correctAnswers: [],
        correctAnswer: undefined
      }));
    } else if (!newQuestion.options || newQuestion.options.length === 0) {
      setNewQuestion(prev => ({ 
        ...prev, 
        options: [""],
        correctAnswers: [],
        correctAnswer: undefined
      }));
    }
  }, [newQuestion.type]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#034153] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error && !resource.quizId) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-6 text-center max-w-md">
          <FaQuestionCircle className="text-4xl text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load quiz</h3>
          <p className="text-gray-600 mb-4">There was an error loading the quiz data.</p>
          <button
            onClick={onClose}
            className="bg-[#034153] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#004e64] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const isSaveDisabled = isUpdating || isCreating || isSaving;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-6xl max-h-[98vh] sm:max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header - Responsive */}
        <div className="bg-gradient-to-r from-[#034153] to-[#004e64] px-3 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="bg-white/20 p-1.5 sm:p-2 rounded-lg">
              <FaQuestionCircle className="text-white text-lg sm:text-xl" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-white">Quiz Creator</h2>
              <p className="text-white/80 text-xs sm:text-sm mt-0.5 hidden sm:block">Create and manage your quiz questions</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Auto-save indicator */}
            {hasChanges && !isSaving && (
              <div className="text-white/80 text-xs flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <span className="hidden sm:inline">Unsaved changes</span>
              </div>
            )}
            {isSaving && (
              <div className="text-white/80 text-xs flex items-center gap-1">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                <span className="hidden sm:inline">Saving...</span>
              </div>
            )}
            
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden text-white/90 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-200"
            >
              <Menu size={20} />
            </button>
            <button
              onClick={handleManualSave}
              disabled={isSaveDisabled}
              className="bg-white text-[#034153] px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaveDisabled ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#034153]"></div>
                  <span className="hidden sm:inline">Saving...</span>
                  <span className="sm:hidden">Save</span>
                </>
              ) : (
                <>
                  <FaCheck className="text-sm sm:text-base" /> 
                  <span className="hidden sm:inline">Save Quiz</span>
                  <span className="sm:hidden">Save</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isSaveDisabled}
              className="text-white/90 hover:text-white hover:bg-white/10 p-1.5 sm:p-2 rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Mobile Overlay & Desktop Fixed */}
          <div className={`
            fixed lg:relative inset-0 lg:inset-auto z-40 lg:z-auto
            w-full sm:w-80 lg:w-80 bg-gray-50 border-r border-gray-200 
            flex flex-col transition-transform duration-300 ease-in-out
            ${showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            {/* Mobile sidebar close button */}
            <div className="lg:hidden flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Question Types</h3>
              <button
                onClick={() => setShowSidebar(false)}
                className="text-gray-600 hover:text-gray-800 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-3 sm:p-4 border-b border-gray-200 overflow-y-auto">
              <h3 className="font-semibold text-gray-800 mb-3 hidden lg:block">Question Types</h3>
              <div className="space-y-2">
                {questionTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <button
                      key={type.value}
                      onClick={() => {
                        setNewQuestion(prev => ({ 
                          ...prev, 
                          type: type.value as any,
                          options: type.value === "short" || type.value === "long" || type.value === "number" ? undefined : [""],
                          correctAnswers: [],
                          correctAnswer: undefined
                        }));
                        setShowSidebar(false);
                      }}
                      className={`w-full text-left p-2 sm:p-3 rounded-lg border transition-all ${
                        newQuestion.type === type.value 
                          ? 'border-[#034153] bg-[#034153]/5 text-[#034153]' 
                          : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <IconComponent className="text-base sm:text-lg flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{type.label}</div>
                          <div className="text-xs text-gray-500 mt-0.5 truncate">{type.description}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quiz Settings Section */}
            <div className="p-3 sm:p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-3">Quiz Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Title</label>
                  <input
                    type="text"
                    value={quizSettings.title}
                    onChange={(e) => handleSettingsChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#034153] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={quizSettings.description || ''}
                    onChange={(e) => handleSettingsChange('description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#034153] text-sm resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={quizSettings.showResults || true}
                      onChange={(e) => handleSettingsChange('showResults', e.target.checked)}
                      className="w-4 h-4 text-[#034153] border-gray-300 rounded focus:ring-[#034153]"
                    />
                    <span className="text-sm text-gray-700">Show results immediately</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={quizSettings.allowRetakes || false}
                      onChange={(e) => handleSettingsChange('allowRetakes', e.target.checked)}
                      className="w-4 h-4 text-[#034153] border-gray-300 rounded focus:ring-[#034153]"
                    />
                    <span className="text-sm text-gray-700">Allow retakes</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Overlay */}
          {showSidebar && (
            <div 
              className="lg:hidden fixed inset-0 bg-black/50 z-30"
              onClick={() => setShowSidebar(false)}
            />
          )}

          {/* Main Content - Responsive */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-3 sm:p-4 lg:p-6">
              {/* Quiz Header */}
              <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{quizSettings.title}</h1>
                {quizSettings.description && (
                  <p className="text-sm sm:text-base text-gray-600">{quizSettings.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500">
                  <span>{questions.length} questions</span>
                  <span>•</span>
                  <span>Total points: {questions.reduce((sum, q) => sum + (q.points || 1), 0)}</span>
                  {resource.quizId && (
                    <>
                      <span>•</span>
                      <span>ID: {resource.quizId}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Add Question Form - Responsive */}
              <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                  <FaPlus className="text-[#034153]" /> Add New Question
                </h3>
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Points</label>
                      <input
                        type="number"
                        min="1"
                        value={newQuestion.points || 1}
                        onChange={(e) => setNewQuestion(prev => ({ ...prev, points: parseInt(e.target.value) || 1 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#034153] focus:border-transparent text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                        {(() => {
                          const IconComponent = getQuestionIcon(newQuestion.type || 'multiple');
                          return <IconComponent className="text-[#034153] flex-shrink-0" />;
                        })()}
                        <span className="text-xs sm:text-sm font-medium text-[#034153] capitalize truncate">
                          {questionTypes.find(t => t.value === newQuestion.type)?.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Question *</label>
                    <textarea
                      value={newQuestion.question || ''}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                      placeholder="Enter your question here..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#034153] focus:border-transparent resize-none text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                    <textarea
                      value={newQuestion.description || ''}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Add additional context or instructions..."
                      rows={1}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#034153] focus:border-transparent resize-none text-sm sm:text-base"
                    />
                  </div>

                  {newQuestion.type !== "short" && newQuestion.type !== "long" && newQuestion.type !== "number" && newQuestion.options && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Options 
                        <span className="text-xs text-gray-500 ml-2">
                          {newQuestion.type === 'multiple' || newQuestion.type === 'truefalse' 
                            ? '(Click to mark correct answer)' 
                            : '(Click to mark correct answers)'}
                        </span>
                      </label>
                      <div className="space-y-2">
                        {newQuestion.options.map((option, index) => (
                          <div key={index} className="flex gap-2 items-center">
                            <button
                              type="button"
                              onClick={() => {
                                if (newQuestion.type === 'multiple' || newQuestion.type === 'truefalse') {
                                  const newCorrectAnswer = newQuestion.correctAnswer === index ? undefined : index;
                                  setNewQuestion(prev => ({
                                    ...prev,
                                    correctAnswer: newCorrectAnswer,
                                    correctAnswers: newCorrectAnswer !== undefined ? [newCorrectAnswer] : []
                                  }));
                                } else if (newQuestion.type === 'checkbox') {
                                  const currentCorrectAnswers = newQuestion.correctAnswers || [];
                                  const isCurrentlyCorrect = currentCorrectAnswers.includes(index);
                                  const newCorrectAnswers = isCurrentlyCorrect
                                    ? currentCorrectAnswers.filter(ans => ans !== index)
                                    : [...currentCorrectAnswers, index];
                                  setNewQuestion(prev => ({ ...prev, correctAnswers: newCorrectAnswers }));
                                }
                              }}
                              className={`p-2 rounded-lg border transition-colors flex-shrink-0 ${
                                (newQuestion.type === 'multiple' || newQuestion.type === 'truefalse') 
                                  ? newQuestion.correctAnswer === index
                                    ? 'bg-green-500 border-green-600 text-white'
                                    : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                                  : newQuestion.type === 'checkbox'
                                  ? (newQuestion.correctAnswers || []).includes(index)
                                    ? 'bg-green-500 border-green-600 text-white'
                                    : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                                  : 'bg-gray-100 border-gray-300 text-gray-600'
                              }`}
                            >
                              {newQuestion.type === "multiple" && <FaRegCircle className="text-sm" />}
                              {newQuestion.type === "checkbox" && <FaRegSquare className="text-sm" />}
                              {newQuestion.type === "truefalse" && <FaCheckCircle className="text-sm" />}
                            </button>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...newQuestion.options!];
                                newOptions[index] = e.target.value;
                                setNewQuestion(prev => ({ ...prev, options: newOptions }));
                              }}
                              placeholder={`Option ${index + 1}`}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#034153] focus:border-transparent text-sm sm:text-base"
                            />
                            {newQuestion.options!.length > 1 && (
                              <button
                                onClick={() => {
                                  const newOptions = newQuestion.options!.filter((_, i) => i !== index);
                                  setNewQuestion(prev => ({ ...prev, options: newOptions }));
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                              >
                                <FaTimes />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => setNewQuestion(prev => ({ 
                            
                            ...prev, 
                            options: [...(prev.options || []), ""] 
                          }))}
                          className="flex items-center gap-2 text-[#034153] hover:text-[#004e64] font-medium text-sm"
                        >
                          <FaPlus /> Add Option
                        </button>
                      </div>
                    </div>
                  )}

                  {(newQuestion.type === "short" || newQuestion.type === "long" || newQuestion.type === "number") && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
                      <input
                        type={newQuestion.type === "number" ? "number" : "text"}
                        value={newQuestion.correctAnswer || ''}
                        onChange={(e) => setNewQuestion(prev => ({ 
                          ...prev, 
                          correctAnswer: e.target.value,
                          correctAnswers: [e.target.value]
                        }))}
                        placeholder={`Enter correct ${newQuestion.type === "number" ? "number" : "answer"}`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#034153] focus:border-transparent text-sm sm:text-base"
                      />
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newQuestion.required || false}
                        onChange={(e) => setNewQuestion(prev => ({ ...prev, required: e.target.checked }))}
                        className="w-4 h-4 text-[#034153] border-gray-300 rounded focus:ring-[#034153]"
                      />
                      <span className="text-sm font-medium text-gray-700">Required question</span>
                    </label>

                    <button
                      onClick={addQuestion}
                      disabled={!newQuestion.question?.trim()}
                      className="w-full sm:w-auto bg-[#034153] hover:bg-[#004e64] disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 sm:px-6 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <FaCheck /> Add Question
                    </button>
                  </div>
                </div>
              </div>

              {/* Existing Questions - Responsive */}
              <div>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <FaList className="text-[#034153]" /> Questions ({questions.length})
                  </h3>
                  {questions.length > 0 && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Preview</span>
                    </div>
                  )}
                </div>
                
                {questions.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl">
                    <FaQuestionCircle className="text-3xl sm:text-4xl mx-auto mb-2 sm:mb-3 text-gray-300" />
                    <p className="text-base sm:text-lg font-medium mb-1 sm:mb-2">No questions yet</p>
                    <p className="text-xs sm:text-sm px-4">Add your first question using the form above</p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {questions.map((question, index) => {
                      const QuestionIcon = getQuestionIcon(question.type);
                      return (
                        <div key={question.id} className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6 hover:border-gray-300 transition-colors">
                          {editingQuestion === question.id ? (
                            // Edit Mode - Responsive
                            <div className="space-y-3 sm:space-y-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <QuestionIcon className="text-[#034153] text-base sm:text-lg" />
                                  <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Question {index + 1}</h4>
                                </div>
                                <div className="flex gap-1 sm:gap-2">
                                  <button
                                    onClick={() => setEditingQuestion(null)}
                                    className="text-[#034153] hover:text-[#004e64] p-1.5 sm:p-2 hover:bg-[#034153]/5 rounded-lg transition-colors"
                                  >
                                    <FaCheck className="text-sm sm:text-base" />
                                  </button>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Points</label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={question.points || 1}
                                    onChange={(e) => updateQuestion(question.id, { points: parseInt(e.target.value) || 1 })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#034153] text-sm sm:text-base"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                                  <select
                                    value={question.type}
                                    onChange={(e) => updateQuestion(question.id, { 
                                      type: e.target.value as any,
                                      options: e.target.value === "short" || e.target.value === "long" || e.target.value === "number" ? undefined : question.options || [""],
                                      correctAnswers: [],
                                      correctAnswer: undefined
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#034153] text-sm sm:text-base"
                                  >
                                    {questionTypes.map(type => (
                                      <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                                <textarea
                                  value={question.question}
                                  onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                                  rows={2}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#034153] resize-none text-sm sm:text-base"
                                />
                              </div>

                              {question.type !== "short" && question.type !== "long" && question.type !== "number" && question.options && (
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-gray-700">
                                    Options 
                                    <span className="text-xs text-gray-500 ml-2">
                                      {question.type === 'multiple' || question.type === 'truefalse' 
                                        ? '(Click to mark correct answer)' 
                                        : '(Click to mark correct answers)'}
                                    </span>
                                  </label>
                                  {question.options.map((option, optIndex) => (
                                    <div key={optIndex} className="flex gap-2 items-center">
                                      <button
                                        type="button"
                                        onClick={() => toggleCorrectAnswer(question.id, optIndex)}
                                        className={`p-2 rounded-lg border transition-colors flex-shrink-0 ${
                                          isOptionCorrect(question, optIndex)
                                            ? 'bg-green-500 border-green-600 text-white'
                                            : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                                        }`}
                                      >
                                        <QuestionIcon className="text-sm" />
                                      </button>
                                      <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#034153] text-sm sm:text-base"
                                      />
                                      {question.options && question.options.length > 1 && (
                                        <button
                                          onClick={() => removeOption(question.id, optIndex)}
                                          className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg flex-shrink-0"
                                        >
                                          <FaTimes className="text-sm sm:text-base" />
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                  <button
                                    onClick={() => addOption(question.id)}
                                    className="flex items-center gap-2 text-[#034153] hover:text-[#004e64] text-sm font-medium"
                                  >
                                    <FaPlus /> Add Option
                                  </button>
                                </div>
                              )}

                              {(question.type === "short" || question.type === "long" || question.type === "number") && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
                                  <input
                                    type={question.type === "number" ? "number" : "text"}
                                    value={question.correctAnswer || ''}
                                    onChange={(e) => setTextCorrectAnswer(question.id, e.target.value)}
                                    placeholder={`Enter correct ${question.type === "number" ? "number" : "answer"}`}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#034153] text-sm sm:text-base"
                                  />
                                </div>
                              )}

                              <div className="flex items-center justify-between pt-2">
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={question.required}
                                    onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                                    className="w-4 h-4 text-[#034153] border-gray-300 rounded focus:ring-[#034153]"
                                  />
                                  <span className="text-sm font-medium text-gray-700">Required question</span>
                                </label>
                              </div>
                            </div>
                          ) : (
                            // View Mode - Responsive
                            <div className="space-y-3 sm:space-y-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2 sm:mb-3 flex-wrap">
                                    <QuestionIcon className="text-[#034153] text-base sm:text-lg flex-shrink-0" />
                                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                      <span className="bg-[#034153]/10 text-[#034153] text-xs sm:text-sm font-medium px-2 py-1 rounded whitespace-nowrap">
                                        {questionTypes.find(t => t.value === question.type)?.label}
                                      </span>
                                      <span className="bg-gray-100 text-gray-800 text-xs sm:text-sm font-medium px-2 py-1 rounded whitespace-nowrap">
                                        {question.points || 1} point{question.points !== 1 ? 's' : ''}
                                      </span>
                                      {question.required && (
                                        <span className="bg-red-100 text-red-800 text-xs sm:text-sm font-medium px-2 py-1 rounded whitespace-nowrap">
                                          Required
                                        </span>
                                      )}
                                      {(question.correctAnswer !== undefined || (question.correctAnswers && question.correctAnswers.length > 0)) && (
                                        <span className="bg-green-100 text-green-800 text-xs sm:text-sm font-medium px-2 py-1 rounded whitespace-nowrap">
                                          Correct Answer Set
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <h4 className="font-semibold text-gray-800 text-base sm:text-lg mb-2">{question.question}</h4>
                                  {question.description && (
                                    <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3">{question.description}</p>
                                  )}
                                </div>
                                <div className="flex gap-0.5 sm:gap-1 flex-shrink-0">
                                  {index > 0 && (
                                    <button
                                      onClick={() => moveQuestion(index, 'up')}
                                      className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                      title="Move up"
                                    >
                                      <FaArrowUp className="text-xs sm:text-sm" />
                                    </button>
                                  )}
                                  {index < questions.length - 1 && (
                                    <button
                                      onClick={() => moveQuestion(index, 'down')}
                                      className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                      title="Move down"
                                    >
                                      <FaArrowDown className="text-xs sm:text-sm" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => setEditingQuestion(question.id)}
                                    className="p-1.5 sm:p-2 text-[#034153] hover:text-[#004e64] hover:bg-[#034153]/5 rounded-lg transition-colors"
                                    title="Edit question"
                                  >
                                    <FaEdit className="text-xs sm:text-sm" />
                                  </button>
                                  <button
                                    onClick={() => deleteQuestion(question.id)}
                                    className="p-1.5 sm:p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete question"
                                  >
                                    <FaTrash className="text-xs sm:text-sm" />
                                  </button>
                                </div>
                              </div>

                              {question.type !== "short" && question.type !== "long" && question.type !== "number" && question.options && (
                                <div className="space-y-2 ml-4 sm:ml-8">
                                  {question.options.map((option, optIndex) => (
                                    <div 
                                      key={optIndex} 
                                      className={`flex items-center gap-2 sm:gap-3 p-2 rounded-lg text-sm sm:text-base transition-colors ${
                                        isOptionCorrect(question, optIndex)
                                          ? 'bg-green-50 border border-green-200 text-green-800'
                                          : 'text-gray-700 hover:bg-gray-50'
                                      }`}
                                    >
                                      {question.type === "multiple" && (
                                        <FaRegCircle className={`flex-shrink-0 text-xs sm:text-sm ${
                                          isOptionCorrect(question, optIndex) ? 'text-green-600' : 'text-gray-400'
                                        }`} />
                                      )}
                                      {question.type === "checkbox" && (
                                        <FaRegSquare className={`flex-shrink-0 text-xs sm:text-sm ${
                                          isOptionCorrect(question, optIndex) ? 'text-green-600' : 'text-gray-400'
                                        }`} />
                                      )}
                                      {question.type === "truefalse" && (
                                        <FaCheckCircle className={`flex-shrink-0 text-xs sm:text-sm ${
                                          isOptionCorrect(question, optIndex) ? 'text-green-600' : 'text-gray-400'
                                        }`} />
                                      )}
                                      <span className="break-words">{option}</span>
                                      {isOptionCorrect(question, optIndex) && (
                                        <FaCheckCircle className="text-green-500 flex-shrink-0 text-xs sm:text-sm ml-auto" />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {(question.type === "short" || question.type === "long" || question.type === "number") && question.correctAnswer && (
                                <div className="ml-4 sm:ml-8">
                                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                    <div className="flex items-center gap-2 text-green-800 text-sm font-medium mb-1">
                                      <FaCheckCircle className="text-green-600" />
                                      Correct Answer:
                                    </div>
                                    <p className="text-green-700 text-sm">{question.correctAnswer}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Hidden file input */}
        <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*,video/*,.pdf,.doc,.docx" />
      </div>
    </div>
  );
};

export default QuizEditor;