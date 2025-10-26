// src/components/QuizEditor.tsx
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import {
  FaCheckCircle, FaCheckSquare, FaEdit, FaQuestionCircle, FaTimes,
  FaCheck, FaList, FaPlus, FaRegCircle, FaRegSquare, FaTrash, 
  FaArrowUp, FaArrowDown
} from "react-icons/fa";
import { X, Eye, Hash, Type, List as ListIcon, CheckSquare, ToggleLeft, Menu } from "lucide-react";
import { 
  useUpdateQuizMutation,
  useGetQuizDataByQuizIdQuery,
  quizHelper
} from "../state/api/quizApi";

// Define proper TypeScript interfaces
export interface Question {
  id: number;
  type: 'multiple' | 'checkbox' | 'truefalse' | 'short' | 'long' | 'number' | 'labeling';
  question: string;
  description?: string;
  options?: string[];
  correctAnswers?: (string | number)[];
  correctAnswer?: string | number;
  imageUrl?: string;
  labelAnswers?: { label: string; answer: string }[];
  required: boolean;
  points: number;
  order?: number;
}

export interface QuizSettings {
  title: string;
  description?: string;
  shuffleQuestions: boolean;
  timeLimit?: number;
  showResults: boolean;
  allowRetakes: boolean;
  passingScore?: number;
}

export interface ResourceType {
  id: number;
  name: string;
  description?: string;
  quizId?: number;
  quiz?: any;
  type: string;
  courseId?: number;
  lessonId?: number;
  [key: string]: any; // Add index signature to allow dynamic properties
}

// Type that combines both ResourceType and quizHelper
interface QuizEditorResource extends Omit<ResourceType, 'courseId' | 'lessonId'> {
  quizId?: number;
  courseId: number;
  lessonId: number;
};

interface QuizEditorProps {
  resource: QuizEditorResource;
  onClose: () => void;
}

// Constants
const QUESTION_TYPES = [
  { value: "multiple", label: "Multiple Choice", icon: FaRegCircle, description: "Single select from options" },
  { value: "checkbox", label: "Checkbox", icon: CheckSquare, description: "Multiple select from options" },
  { value: "truefalse", label: "True/False", icon: ToggleLeft, description: "True or false selection" },
  { value: "short", label: "Short Answer", icon: Type, description: "Short text response" },
  { value: "long", label: "Paragraph", icon: ListIcon, description: "Long text response" },
  { value: "number", label: "Number", icon: Hash, description: "Numeric response" },
  { value: "labeling", label: "Image Labeling", icon: FaList, description: "Identify pre-labeled parts on an image" }
] as const;

const INITIAL_NEW_QUESTION: Partial<Question> = {
  type: "multiple",
  question: "",
  description: "",
  options: ["", ""],
  correctAnswers: [],
  correctAnswer: undefined,
  required: false,
  points: 1,
  imageUrl: undefined,
  labelAnswers: undefined
};

const QuizEditor = ({ resource, onClose }: QuizEditorProps) => {

  
  const quizQueryParams: quizHelper = {
    courseId: resource.courseId || 0,
    lessonId: resource.lessonId || 0,
    quizId: resource.quizId || resource.id
  };
  
  const { 
    data: quizData, 
    isLoading, 
    error,
    refetch 
  } = useGetQuizDataByQuizIdQuery(quizQueryParams);
if(!isLoading){
    console.log(quizData,"printitn quiz data")
}

  const [updateQuiz, { isLoading: isUpdating }] = useUpdateQuizMutation();
  // Quiz creation is not allowed - only editing existing quizzes
  const isCreating = false;



  // Memoized initial state functions
  const getInitialQuestions = useCallback((): Question[] => {
    const source = resource.quiz || quizData;
    
    if (source?.questions && Array.isArray(source.questions)) {
      return source.questions.map((q: any, index: number) => ({
        id: q.id || Date.now() + index,
        type: q.type || 'multiple',
        question: q.question || '',
        description: q.description || '',
        options: q.options || (q.type !== 'short' && q.type !== 'long' && q.type !== 'number' && q.type !== 'labeling' ? [''] : undefined),
        correctAnswers: q.correctAnswers || [],
        correctAnswer: q.correctAnswer,
        required: q.required || false,
        points: q.points || 1,
        imageUrl: q.imageUrl,
        labelAnswers: q.labelAnswers,
      }));
    }
    
    return [];
  }, [resource.quiz, quizData]);

  const getInitialSettings = useCallback((): QuizSettings => {
    return resource.quiz?.settings || quizData?.settings || {
      title: resource.name,
      description: resource.description || "",
      shuffleQuestions: false,
      timeLimit: 0,
      showResults: true,
      allowRetakes: false,
      passingScore: 0,
    };
  }, [resource.quiz, quizData, resource.name, resource.description]);

  // State
  const [questions, setQuestions] = useState<Question[]>(getInitialQuestions);
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const [quizSettings, setQuizSettings] = useState<QuizSettings>(getInitialSettings);
  const [showSidebar, setShowSidebar] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>(INITIAL_NEW_QUESTION);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update local state when quiz data loads
  useEffect(() => {
    if (quizData) {
      setQuestions(getInitialQuestions());
      setQuizSettings(getInitialSettings());
    }
  }, [quizData, getInitialQuestions, getInitialSettings]);

  // Save quiz to backend
  const saveQuiz = useCallback(async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      const filteredQuizSettings = Object.fromEntries(
        Object.entries(quizSettings).filter(([_, value]) => 
          value !== null && value !== undefined && value !== ''
        )
      ) as QuizSettings;

      const filteredQuestions = questions
        .filter(q => q.question?.trim() !== '' || (q.type === 'labeling' && q.imageUrl && q.labelAnswers?.length))
        .map((q, index) => {
          const cleanedQuestion = Object.fromEntries(
            Object.entries(q).filter(([key, value]) => 
              (Array.isArray(value) && value.length > 0) || 
              (['required', 'points', 'type', 'id', 'imageUrl', 'labelAnswers'].includes(key)) ||
              (value !== null && value !== undefined && value !== '')
            )
          ) as Question;
          
          return {
            ...cleanedQuestion,
            points: cleanedQuestion.points || 1,
            order: index,
            options: cleanedQuestion.options?.filter(opt => opt.trim()),
            labelAnswers: cleanedQuestion.type === 'labeling' ? 
              cleanedQuestion.labelAnswers?.filter(la => la.label.trim() && la.answer.trim()) : undefined,
            correctAnswer: cleanedQuestion.type === 'labeling' ? undefined : cleanedQuestion.correctAnswer,
            correctAnswers: cleanedQuestion.type === 'labeling' ? [] : cleanedQuestion.correctAnswers,
          };
        });

      const quizTitle = filteredQuizSettings.title || resource.name;
      if (!quizTitle) {
        toast.error("Quiz title is required");
        setIsSaving(false);
        return;
      }

      // Only allow updating existing quizzes
      if (!resource.quizId) {
        throw new Error("Cannot create new quizzes - only editing existing quizzes is allowed");
      }
      
      // Update existing quiz
      await updateQuiz({ 
        id: resource.quizId, 
        data: {
          name: quizTitle,
          description: filteredQuizSettings.description || '',
          questions: filteredQuestions,
          settings: filteredQuizSettings
        }
      }).unwrap();
      toast.success("Quiz updated successfully!");

      setHasChanges(false);
      await refetch();
    } catch (error: any) {
      console.error('Failed to save quiz:', error);
      const errorMessage = error?.data?.message || error?.message || "Failed to save quiz. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [quizSettings, questions, resource, isSaving, updateQuiz, refetch]);

  // Auto-save effect
  useEffect(() => {
    if (hasChanges && !isSaving) {
      const autoSaveTimer = setTimeout(saveQuiz, 3000);
      return () => clearTimeout(autoSaveTimer);
    }
  }, [questions, quizSettings, hasChanges, isSaving, saveQuiz]);

  // Mark changes when questions or settings are modified
  useEffect(() => {
    if (!hasChanges && (questions.length > 0 || quizSettings.title !== resource.name)) {
      setHasChanges(true);
    }
  }, [questions, quizSettings, hasChanges, resource.name]);

  // Question management functions
  const addQuestion = useCallback(() => {
    // Create a type-safe copy of the new question
    const currentQuestion = { 
      ...INITIAL_NEW_QUESTION, 
      ...newQuestion,
      type: newQuestion.type || 'multiple', // Ensure type has a default value
      question: newQuestion.question || '', // Ensure question is a string
      labelAnswers: newQuestion.type === 'labeling' 
        ? (newQuestion.labelAnswers || [])
        : undefined
    };
    
    // Validate required fields
    if (!currentQuestion.question.trim()) {
      toast.error("Please enter a question");
      return;
    }

    if (currentQuestion.type === 'labeling') {
      // Validate labeling question
      if (!currentQuestion.imageUrl?.trim()) {
        toast.error("Please provide an image URL for the labeling question.");
        return;
      }
      
      if (!currentQuestion.labelAnswers?.length) {
        toast.error("Please add at least one label-answer pair.");
        return;
      }
      
      // Validate that all labels and answers are filled
      const invalidLabels = currentQuestion.labelAnswers.some(
        (la: { label?: string; answer?: string }) => !la.label?.trim() || !la.answer?.trim()
      );
      
      if (invalidLabels) {
        toast.error("Please fill in all label names and their corresponding answers.");
        return;
      }
    } else if (currentQuestion.type === 'multiple' || currentQuestion.type === 'checkbox' || currentQuestion.type === 'truefalse') {
      // Validate multiple choice/checkbox/truefalse questions
      const validOptions = (currentQuestion.options || []).filter(opt => opt.trim());
      
      if (validOptions.length < 2) {
        toast.error("Multiple Choice/Checkbox questions require at least two options.");
        return;
      }
      
      if ((currentQuestion.type === 'multiple' || currentQuestion.type === 'truefalse') && 
          currentQuestion.correctAnswer === undefined) {
        toast.error("Please mark a correct answer.");
        return;
      }
    }

    // Create the question object with proper type safety
    const question: Question = {
      id: Date.now(),
      type: currentQuestion.type,
      question: currentQuestion.question.trim(),
      description: currentQuestion.description?.trim() || '',
      options: (currentQuestion.type === 'multiple' || currentQuestion.type === 'checkbox' || currentQuestion.type === 'truefalse')
        ? (currentQuestion.options || []).filter(opt => opt.trim()).map(opt => opt.trim())
        : undefined,
      correctAnswers: currentQuestion.correctAnswers || [],
      correctAnswer: currentQuestion.correctAnswer,
      required: currentQuestion.required || false,
      points: currentQuestion.points || 1,
      ...(currentQuestion.type === 'labeling' && {
        imageUrl: currentQuestion.imageUrl,
        labelAnswers: (currentQuestion.labelAnswers || [])
          .filter(la => la.label?.trim() && la.answer?.trim())
          .map(la => ({
            label: la.label.trim(),
            answer: la.answer.trim()
          }))
      })
    };

    // Add the new question to the list
    const updatedQuestions = [...questions, question];
    setQuestions(updatedQuestions);
    setHasChanges(true);
    
    // Reset the form with proper typing
    setNewQuestion({
      ...INITIAL_NEW_QUESTION,
      type: 'labeling', // Default to labeling for next question
      labelAnswers: [{ label: 'A', answer: '' }] // Initialize with one empty label-answer pair
    });
    
    toast.success("Question added successfully!");
  }, [newQuestion, questions, resource, quizSettings]);

  const updateQuestion = useCallback((questionId: number, updates: Partial<Question>) => {
    const updatedQuestions = questions.map(q => 
      q.id === questionId ? { ...q, ...updates } : q
    );
    setQuestions(updatedQuestions);
    setHasChanges(true);
    
  
  }, [questions, resource, quizSettings]);

  const deleteQuestion = useCallback((questionId: number) => {
    const updatedQuestions = questions.filter(q => q.id !== questionId);
    setQuestions(updatedQuestions);
    setHasChanges(true);
    

    
    toast.success("Question deleted successfully!");
  }, [questions, resource, quizSettings]);

  const moveQuestion = useCallback((index: number, direction: 'up' | 'down') => {
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
    
 
  }, [questions, resource, quizSettings]);

  // Option management
  const addOption = useCallback((questionId: number) => {
    const question = questions.find(q => q.id === questionId);
    if (question?.options) {
      const updatedOptions = [...question.options, ""];
      updateQuestion(questionId, { options: updatedOptions });
    }
  }, [questions, updateQuestion]);

  const updateOption = useCallback((questionId: number, optionIndex: number, value: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question?.options) {
      const updatedOptions = [...question.options];
      updatedOptions[optionIndex] = value;
      updateQuestion(questionId, { options: updatedOptions });
    }
  }, [questions, updateQuestion]);

  const removeOption = useCallback((questionId: number, optionIndex: number) => {
    const question = questions.find(q => q.id === questionId);
    if (question?.options && question.options.length > 1) {
      const updatedOptions = question.options.filter((_, index) => index !== optionIndex);
      
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
  }, [questions, updateQuestion]);

  // New question option management
  const newQuestionAddOption = useCallback(() => {
    setNewQuestion(prev => ({ ...prev, options: [...prev.options!, ""] }));
  }, []);

  const newQuestionUpdateOption = useCallback((index: number, value: string) => {
    setNewQuestion(prev => {
      const updatedOptions = [...prev.options!];
      updatedOptions[index] = value;
      return { ...prev, options: updatedOptions };
    });
  }, []);

  const newQuestionRemoveOption = useCallback((index: number) => {
    if (newQuestion.options && newQuestion.options.length > 2) {
      const updatedOptions = newQuestion.options.filter((_, i) => i !== index);

      let updatedCorrectAnswers = newQuestion.correctAnswers || [];
      if (newQuestion.type === 'multiple' || newQuestion.type === 'truefalse') {
        const newCorrectAnswer = newQuestion.correctAnswer === index ? undefined : newQuestion.correctAnswer;
        updatedCorrectAnswers = newCorrectAnswer !== undefined ? [newCorrectAnswer] : [];
      } else if (newQuestion.type === 'checkbox') {
        updatedCorrectAnswers = updatedCorrectAnswers.filter(ans => ans !== index);
      }

      setNewQuestion(prev => ({
        ...prev,
        options: updatedOptions,
        correctAnswers: updatedCorrectAnswers,
        correctAnswer: newQuestion.type === 'multiple' || newQuestion.type === 'truefalse' 
          ? (newQuestion.correctAnswer === index ? undefined : newQuestion.correctAnswer)
          : newQuestion.correctAnswer
      }));
    }
  }, [newQuestion.options, newQuestion.type, newQuestion.correctAnswer, newQuestion.correctAnswers]);

  const newQuestionToggleCorrectAnswer = useCallback((optionIndex: number) => {
    if (!newQuestion.options) return;

    if (newQuestion.type === 'multiple' || newQuestion.type === 'truefalse') {
      const newCorrectAnswer = newQuestion.correctAnswer === optionIndex ? undefined : optionIndex;
      setNewQuestion(prev => ({ 
        ...prev, 
        correctAnswer: newCorrectAnswer,
        correctAnswers: newCorrectAnswer !== undefined ? [newCorrectAnswer] : []
      }));
    } else if (newQuestion.type === 'checkbox') {
      const currentCorrectAnswers = newQuestion.correctAnswers || [];
      const isCurrentlyCorrect = currentCorrectAnswers.includes(optionIndex);
      const newCorrectAnswers = isCurrentlyCorrect
        ? currentCorrectAnswers.filter(ans => ans !== optionIndex)
        : [...currentCorrectAnswers, optionIndex];
      
      setNewQuestion(prev => ({ ...prev, correctAnswers: newCorrectAnswers }));
    }
  }, [newQuestion.options, newQuestion.type, newQuestion.correctAnswer, newQuestion.correctAnswers]);

  const isNewOptionCorrect = useCallback((optionIndex: number): boolean => {
    if (newQuestion.type === 'multiple' || newQuestion.type === 'truefalse') {
      return newQuestion.correctAnswer === optionIndex;
    } else if (newQuestion.type === 'checkbox') {
      return (newQuestion.correctAnswers || []).includes(optionIndex);
    }
    return false;
  }, [newQuestion.type, newQuestion.correctAnswer, newQuestion.correctAnswers]);

  // Correct answer management for existing questions
  const toggleCorrectAnswer = useCallback((questionId: number, optionIndex: number) => {
    const question = questions.find(q => q.id === questionId);
    if (!question?.options) return;

    if (question.type === 'multiple' || question.type === 'truefalse') {
      const newCorrectAnswer = question.correctAnswer === optionIndex ? undefined : optionIndex;
      updateQuestion(questionId, { 
        correctAnswer: newCorrectAnswer,
        correctAnswers: newCorrectAnswer !== undefined ? [newCorrectAnswer] : []
      });
    } else if (question.type === 'checkbox') {
      const currentCorrectAnswers = question.correctAnswers || [];
      const isCurrentlyCorrect = currentCorrectAnswers.includes(optionIndex);
      const newCorrectAnswers = isCurrentlyCorrect
        ? currentCorrectAnswers.filter(ans => ans !== optionIndex)
        : [...currentCorrectAnswers, optionIndex];
      
      updateQuestion(questionId, { correctAnswers: newCorrectAnswers });
    }
  }, [questions, updateQuestion]);

  const setTextCorrectAnswer = useCallback((questionId: number, answer: string) => {
    updateQuestion(questionId, { 
      correctAnswer: answer,
      correctAnswers: [answer]
    });
  }, [updateQuestion]);

  // Label Answer Management
  const updateLabelAnswer = useCallback((questionId: number, index: number, field: 'label' | 'answer', value: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question?.labelAnswers) return;

    const newLabelAnswers = [...question.labelAnswers];
    if (field === 'label') {
      newLabelAnswers[index] = { ...newLabelAnswers[index], label: value.toUpperCase() };
    } else {
      newLabelAnswers[index] = { ...newLabelAnswers[index], answer: value };
    }
    
    updateQuestion(questionId, { labelAnswers: newLabelAnswers });
  }, [questions, updateQuestion]);

  const addLabelKey = useCallback((questionId: number) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    const currentLabels = question.labelAnswers || [];
    const newLabel = String.fromCharCode(65 + currentLabels.length);
    const newLabelAnswers = [...currentLabels, { label: newLabel, answer: '' }];
    
    updateQuestion(questionId, { labelAnswers: newLabelAnswers });
  }, [questions, updateQuestion]);

  const removeLabelKey = useCallback((questionId: number, index: number) => {
    const question = questions.find(q => q.id === questionId);
    if (!question?.labelAnswers || question.labelAnswers.length <= 1) return;

    const newLabelAnswers = question.labelAnswers.filter((_, i) => i !== index);
    updateQuestion(questionId, { labelAnswers: newLabelAnswers });
  }, [questions, updateQuestion]);

  const getQuestionIcon = useCallback((type: string) => {
    const questionType = QUESTION_TYPES.find(t => t.value === type);
    return questionType?.icon || FaQuestionCircle;
  }, []);

  const isOptionCorrect = useCallback((question: Question, optionIndex: number): boolean => {
    if (question.type === 'multiple' || question.type === 'truefalse') {
      return question.correctAnswer === optionIndex;
    } else if (question.type === 'checkbox') {
      return (question.correctAnswers || []).includes(optionIndex);
    }
    return false;
  }, []);

  const handleSettingsChange = useCallback((key: keyof QuizSettings, value: any) => {
    setQuizSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }, []);

  const handleManualSave = useCallback(async () => {
    console.log("request updating quiz");
    await saveQuiz();
  }, [saveQuiz]);

  // Reset new question options when type changes
  useEffect(() => {
    if (newQuestion.type === "short" || newQuestion.type === "long" || newQuestion.type === "number") {
      setNewQuestion(prev => ({ 
        ...prev, 
        options: undefined,
        correctAnswers: [],
        correctAnswer: undefined,
        imageUrl: undefined,
        labelAnswers: undefined
      }));
    } else if (newQuestion.type === "labeling") {
      setNewQuestion(prev => ({
        ...prev,
        options: undefined,
        correctAnswers: [],
        correctAnswer: undefined,
        imageUrl: prev.imageUrl || '',
        labelAnswers: prev.labelAnswers || [{ label: 'A', answer: '' }]
      }));
    } else if (!newQuestion.options || newQuestion.options.length < 2) {
      setNewQuestion(prev => ({ 
        ...prev, 
        options: ["", ""],
        correctAnswers: [],
        correctAnswer: undefined,
        imageUrl: undefined,
        labelAnswers: undefined
      }));
    }
  }, [newQuestion.type]);

  // Memoized values
  const isSaveDisabled = useMemo(() => isUpdating || isCreating || isSaving, [isUpdating, isCreating, isSaving]);

  // Question Card Component
  const QuestionCard = useCallback(({ question, index }: { question: Question; index: number }) => {
    const IconComponent = getQuestionIcon(question.type);
    const isEditing = editingQuestion === question.id;

    return (
      <div className={`bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all p-4 sm:p-5 ${
        isEditing ? 'border-[#034153] shadow-md ring-2 ring-[#034153]/20' : 'shadow-sm'
      }`}>
        {/* Question header */}
        <div className="flex justify-between items-start gap-4 mb-3">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-gray-700 w-6 flex-shrink-0">{index + 1}.</span>
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-200 hover:border-gray-300 transition-all">
              <IconComponent className="text-[#034153] text-sm" />
              <span className="text-xs font-medium text-gray-700 capitalize">
                {QUESTION_TYPES.find(t => t.value === question.type)?.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm font-medium text-gray-700">{question.points} {question.points === 1 ? 'pt' : 'pts'}</span>
            
            <button
              onClick={() => moveQuestion(index, 'up')}
              disabled={index === 0}
              className="p-1 rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors border border-gray-200 rounded-lg hover:border-gray-300"
              title="Move Up"
            >
              <FaArrowUp size={12} />
            </button>
            <button
              onClick={() => moveQuestion(index, 'down')}
              disabled={index === questions.length - 1}
              className="p-1 rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors border border-gray-200 rounded-lg hover:border-gray-300"
              title="Move Down"
            >
              <FaArrowDown size={12} />
            </button>

            <button
              onClick={() => setEditingQuestion(isEditing ? null : question.id)}
              className={`p-1.5 rounded-full transition-colors border border-gray-200 rounded-lg hover:border-gray-300 ${
                isEditing ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-100 text-[#034153] hover:bg-gray-200'
              }`}
              title={isEditing ? "Done Editing" : "Edit Question"}
            >
              {isEditing ? <FaCheck size={14} /> : <FaEdit size={14} />}
            </button>
            
            <button
              onClick={() => deleteQuestion(question.id)}
              className="p-1.5 rounded-full text-red-600 hover:bg-red-100 transition-colors border border-gray-200 rounded-lg hover:border-gray-300"
              title="Delete Question"
            >
              <FaTrash size={14} />
            </button>
          </div>
        </div>

        {/* Question content */}
        {isEditing ? (
          <QuestionEditForm 
            question={question}
            onUpdate={updateQuestion}
            onToggleCorrectAnswer={toggleCorrectAnswer}
            onAddOption={addOption}
            onUpdateOption={updateOption}
            onRemoveOption={removeOption}
            onSetTextCorrectAnswer={setTextCorrectAnswer}
            onUpdateLabelAnswer={updateLabelAnswer}
            onAddLabelKey={addLabelKey}
            onRemoveLabelKey={removeLabelKey}
            isOptionCorrect={isOptionCorrect}
          />
        ) : (
          <QuestionViewMode question={question} isOptionCorrect={isOptionCorrect} />
        )}
      </div>
    );
  }, [editingQuestion, getQuestionIcon, moveQuestion, deleteQuestion, questions.length, updateQuestion, toggleCorrectAnswer, addOption, updateOption, removeOption, setTextCorrectAnswer, updateLabelAnswer, addLabelKey, removeLabelKey, isOptionCorrect]);

  // Loading and error states
  if (isLoading) {
    return <LoadingOverlay message="Loading quiz..." />;
  }

  if (error && !resource.quizId) {
    return <ErrorOverlay onClose={onClose} />;
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex">
      <Sidebar 
        showSidebar={showSidebar}
        onCloseSidebar={() => setShowSidebar(false)}
        quizSettings={quizSettings}
        onSettingsChange={handleSettingsChange}
      />

      <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden">
        <Header 
          showSidebar={showSidebar}
          onToggleSidebar={() => setShowSidebar(true)}
          quizSettings={quizSettings}
          hasChanges={hasChanges}
          isSaveDisabled={isSaveDisabled}
          isSaving={isSaving}
          onManualSave={handleManualSave}
          onClose={onClose}
        />

        <QuestionList 
          questions={questions}
          QuestionCard={QuestionCard}
          newQuestion={newQuestion}
          onNewQuestionChange={setNewQuestion}
          onAddQuestion={addQuestion}
          onNewQuestionAddOption={newQuestionAddOption}
          onNewQuestionUpdateOption={newQuestionUpdateOption}
          onNewQuestionRemoveOption={newQuestionRemoveOption}
          onNewQuestionToggleCorrectAnswer={newQuestionToggleCorrectAnswer}
          isNewOptionCorrect={isNewOptionCorrect}
        />
      </div>
    </div>
  );
};

// Extracted Components for better organization
const LoadingOverlay = ({ message }: { message: string }) => (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="bg-white  p-6 text-center border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#034153] mx-auto"></div>
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  </div>
);

const ErrorOverlay = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
    <div className="bg-white  p-6 text-center max-w-md border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all">
      <FaQuestionCircle className="text-4xl text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load quiz</h3>
      <p className="text-gray-600 mb-4">There was an error loading the quiz data.</p>
      <button
        onClick={onClose}
        className="bg-[#034153] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#004e64] transition-colors border border-gray-200 rounded-lg hover:border-gray-300"
      >
        Close
      </button>
    </div>
  </div>
);

const Sidebar = ({ 
  showSidebar, 
  onCloseSidebar, 
  quizSettings, 
  onSettingsChange 
}: {
  showSidebar: boolean;
  onCloseSidebar: () => void;
  quizSettings: QuizSettings;
  onSettingsChange: (key: keyof QuizSettings, value: any) => void;
}) => (
  <div className={`fixed inset-y-0 left-0 w-64 bg-white p-5 border-r border-gray-200 transition-transform duration-300 z-50 transform ${
    showSidebar ? 'translate-x-0' : '-translate-x-full'
  } lg:relative lg:translate-x-0 lg:w-72 flex-shrink-0`}>
    <button 
      onClick={onCloseSidebar}
      className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 lg:hidden border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all p-1"
      title="Close Sidebar"
    >
      <X size={20} />
    </button>
    
    <h3 className="text-xl font-bold text-[#034153] mb-4 border-b border-gray-200 pb-2">Quiz Settings</h3>
    
    <div className="space-y-4">
      <SettingInput
        label="Quiz Title"
        id="quizTitle"
        type="text"
        value={quizSettings.title}
        onChange={(value: string) => onSettingsChange('title', value)}
        placeholder="Enter quiz title"
      />

      <SettingTextarea
        label="Description (Optional)"
        id="quizDescription"
        value={quizSettings.description || ''}
        onChange={(value: string) => onSettingsChange('description', value)}
        placeholder="Quiz description"
        rows={3}
      />

      <ToggleSetting
        label="Shuffle Questions"
        checked={quizSettings.shuffleQuestions}
        onChange={(value: boolean) => onSettingsChange('shuffleQuestions', value)}
      />

      <SettingInput
        label="Time Limit (minutes, 0 for none)"
        id="timeLimit"
        type="number"
        min="0"
        value={quizSettings.timeLimit || 0}
        onChange={(value) => onSettingsChange('timeLimit', parseInt(value) || 0)}
      />
      
      <SettingInput
        label="Passing Score (%)"
        id="passingScore"
        type="number"
        min="0"
        max="100"
        value={quizSettings.passingScore || 0}
        onChange={(value) => onSettingsChange('passingScore', parseInt(value) || 0)}
      />

      <ToggleSetting
        label="Show Results to Students"
        checked={quizSettings.showResults}
        onChange={(value) => onSettingsChange('showResults', value)}
      />

      <ToggleSetting
        label="Allow Multiple Retakes"
        checked={quizSettings.allowRetakes}
        onChange={(value) => onSettingsChange('allowRetakes', value)}
      />
    </div>
  </div>
);

interface SettingInputProps {
  label: string;
  id: string;
  type: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: number | string;
  max?: number | string;
}

const SettingInput = ({ label, id, type, value, onChange, placeholder, min, max }: SettingInputProps) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      id={id}
      type={type}
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all focus:ring-[#034153] focus:border-[#034153] text-sm"
    />
  </div>
);

const SettingTextarea = ({ label, id, value, onChange, placeholder, rows }: any) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all focus:ring-[#034153] focus:border-[#034153] text-sm resize-none"
    />
  </div>
);

interface ToggleSettingProps {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

const ToggleSetting = ({ label, checked, onChange }: ToggleSettingProps) => (
  <div className="flex items-center justify-between border-t border-gray-200 pt-4">
    <span className="text-sm font-medium text-gray-700">{label}</span>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#034153]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#034153] border border-gray-200 rounded-lg hover:border-gray-300"></div>
    </label>
  </div>
);

const Header = ({ 
  showSidebar, 
  onToggleSidebar, 
  quizSettings, 
  hasChanges, 
  isSaveDisabled, 
  isSaving, 
  onManualSave, 
  onClose 
}: any) => (
  <div className="p-4 sm:p-5 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between flex-wrap gap-3 sticky top-0 z-40">
    <div className="flex items-center gap-3">
      <button 
        onClick={onToggleSidebar}
        className="p-2 rounded-full text-[#034153] hover:bg-gray-100 lg:hidden border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
        title="Open Settings"
      >
        <Menu size={20} />
      </button>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
        Editing: {quizSettings.title}
      </h1>
      <span className={`text-xs font-medium px-2 py-1 rounded-full border border-gray-200 ${
        hasChanges ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
      }`}>
        {hasChanges ? 'Unsaved Changes' : 'Saved'}
      </span>
    </div>
    <div className="flex items-center gap-3">
      <button
        onClick={onManualSave}
        disabled={isSaveDisabled}
        className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm ${
          isSaveDisabled 
            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
            : 'bg-[#034153] text-white '
        }`}
      >
        <FaCheck size={16} />
        {isSaving ? 'Saving...' : 'Save Quiz'}
      </button>
      <button
        onClick={onClose}
        className="p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm"
        title="Close Editor"
      >
        <X size={24} />
      </button>
    </div>
  </div>
);

const QuestionEditForm = ({ 
  question, 
  onUpdate, 
  onToggleCorrectAnswer, 
  onAddOption, 
  onUpdateOption, 
  onRemoveOption, 
  onSetTextCorrectAnswer,
  onUpdateLabelAnswer,
  onAddLabelKey,
  onRemoveLabelKey,
  isOptionCorrect 
}: any) => (
  <div className="space-y-4">
    <textarea
      value={question.question}
      onChange={(e) => onUpdate(question.id, { question: e.target.value })}
      placeholder="Enter your question here..."
      rows={2}
      className="w-full px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all focus:ring-2 focus:ring-[#034153] focus:border-transparent resize-none text-sm sm:text-base font-semibold"
    />

    {question.options ? (
      <QuestionOptionsEdit
        question={question}
        onToggleCorrectAnswer={onToggleCorrectAnswer}
        onAddOption={onAddOption}
        onUpdateOption={onUpdateOption}
        onRemoveOption={onRemoveOption}
        isOptionCorrect={isOptionCorrect}
      />
    ) : question.type === 'labeling' ? (
      <LabelingQuestionEdit
        question={question}
        onUpdate={onUpdate}
        onUpdateLabelAnswer={onUpdateLabelAnswer}
        onAddLabelKey={onAddLabelKey}
        onRemoveLabelKey={onRemoveLabelKey}
      />
    ) : (
      <TextAnswerEdit
        question={question}
        onSetTextCorrectAnswer={onSetTextCorrectAnswer}
      />
    )}

    <QuestionSettings question={question} onUpdate={onUpdate} />
  </div>
);

const QuestionOptionsEdit = ({ question, onToggleCorrectAnswer, onAddOption, onUpdateOption, onRemoveOption, isOptionCorrect }: any) => (
  <div className="space-y-2 border-l-4 border-gray-100 pl-4 py-2">
    <label className="block text-sm font-medium text-gray-700">Options</label>
    {question.options.map((option: string, optIndex: number) => (
      <div key={optIndex} className="flex gap-2 items-center">
        <button
          type="button"
          onClick={() => onToggleCorrectAnswer(question.id, optIndex)}
          className={`p-1.5 rounded-full transition-colors flex-shrink-0 border border-gray-200 rounded-lg hover:border-gray-300 ${
            isOptionCorrect(question, optIndex) 
              ? 'bg-green-100 text-green-600 hover:bg-green-200'
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
          }`}
          title="Mark as correct"
        >
          {question.type === 'multiple' || question.type === 'truefalse' ? (
            isOptionCorrect(question, optIndex) ? <FaCheckCircle size={14} /> : <FaRegCircle size={14} />
          ) : (
            isOptionCorrect(question, optIndex) ? <FaCheckSquare size={14} /> : <FaRegSquare size={14} />
          )}
        </button>

        <input
          type="text"
          value={option}
          onChange={(e) => onUpdateOption(question.id, optIndex, e.target.value)}
          placeholder={`Option ${optIndex + 1}`}
          className={`w-full px-3 py-2 border rounded-lg hover:border-gray-300 hover:shadow-sm transition-all focus:ring-2 focus:ring-[#034153] text-sm ${
            isOptionCorrect(question, optIndex) ? 'bg-green-50 border-green-300' : 'border-gray-200'
          }`}
        />
        
        {question.options.length > 1 && (
          <button
            type="button"
            onClick={() => onRemoveOption(question.id, optIndex)}
            className="p-1.5 rounded-full text-red-500 hover:bg-red-100 transition-colors flex-shrink-0 border border-gray-200 rounded-lg hover:border-gray-300"
            title="Remove option"
          >
            <FaTimes size={14} />
          </button>
        )}
      </div>
    ))}

    <button
      onClick={() => onAddOption(question.id)}
      className="text-[#034153] hover:text-[#004e64] flex items-center gap-1 text-sm font-medium mt-2 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all px-3 py-1"
    >
      <FaPlus size={12} /> Add Option
    </button>
  </div>
);

const LabelingQuestionEdit = ({ question, onUpdate, onUpdateLabelAnswer, onAddLabelKey, onRemoveLabelKey }: any) => (
  <div className="space-y-4 border-l-4 border-yellow-500 pl-4 py-2">
    <h4 className="text-sm font-bold text-gray-700">Image and Label Setup</h4>

    <label className="block text-sm font-medium text-gray-700">Image URL</label>
    <input
      type="url"
      value={question.imageUrl || ''}
      onChange={(e) => onUpdate(question.id, { imageUrl: e.target.value })}
      placeholder="Paste image URL here"
      className="w-full px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all focus:ring-2 focus:ring-yellow-500 text-sm"
    />

    {question.imageUrl && (
      <div className="mt-2 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all p-2 bg-gray-50">
        <img src={question.imageUrl} alt="Preview" className="max-w-full h-auto max-h-48 object-contain mx-auto" />
        <p className="text-xs text-gray-500 text-center mt-1">Ensure labels (A, B, C...) are visible on the image.</p>
      </div>
    )}

    <label className="block text-sm font-medium text-gray-700 mt-3">Define Label-Answer Key</label>
    {(question.labelAnswers || []).map((la: any, index: number) => (
      <div key={index} className="flex gap-2 items-center">
        <input
          type="text"
          value={la.label}
          onChange={(e) => onUpdateLabelAnswer(question.id, index, 'label', e.target.value)}
          placeholder="Label (A, B, C)"
          className="w-20 px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all focus:ring-2 focus:ring-yellow-500 text-sm font-semibold text-center flex-shrink-0"
          maxLength={3}
        />

        <input
          type="text"
          value={la.answer}
          onChange={(e) => onUpdateLabelAnswer(question.id, index, 'answer', e.target.value)}
          placeholder="Correct Name of Labeled Part"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all focus:ring-2 focus:ring-yellow-500 text-sm"
        />
        
        {question.labelAnswers!.length > 1 && (
          <button
            type="button"
            onClick={() => onRemoveLabelKey(question.id, index)}
            className="p-1.5 rounded-full text-red-500 hover:bg-red-100 transition-colors flex-shrink-0 border border-gray-200 rounded-lg hover:border-gray-300"
            title="Remove label"
          >
            <FaTimes size={14} />
          </button>
        )}
      </div>
    ))}

    <button
      onClick={() => onAddLabelKey(question.id)}
      className="text-yellow-600 hover:text-yellow-700 flex items-center gap-1 text-sm font-medium mt-2 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all px-3 py-1"
    >
      <FaPlus size={12} /> Add Label Key
    </button>
  </div>
);

const TextAnswerEdit = ({ question, onSetTextCorrectAnswer }: any) => (
  <div className="space-y-2 border-l-4 border-gray-100 pl-4 py-2">
    <label className="block text-sm font-medium text-gray-700">Correct Answer</label>
    <input
      type={question.type === 'number' ? 'number' : 'text'}
      value={question.correctAnswer || ''}
      onChange={(e) => onSetTextCorrectAnswer(question.id, e.target.value)}
      placeholder="Enter the correct answer"
      className="w-full px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all focus:ring-2 focus:ring-[#034153] text-sm"
    />
    <p className="text-xs text-gray-500 mt-1">
      Note: For text answers, only an exact match will be graded as correct.
    </p>
  </div>
);

const QuestionSettings = ({ question, onUpdate }: any) => (
  <div className="flex justify-end items-center gap-4 pt-3 border-t border-gray-100">
    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
      <input
        type="checkbox"
        checked={question.required}
        onChange={(e) => onUpdate(question.id, { required: e.target.checked })}
        className="h-4 w-4 text-[#034153] border-gray-300 rounded focus:ring-[#034153] border border-gray-200 rounded-lg hover:border-gray-300"
      />
      Required
    </label>
    
    <div className="flex items-center gap-1">
      <label htmlFor={`points-${question.id}`} className="text-sm font-medium text-gray-700">Points:</label>
      <input
        id={`points-${question.id}`}
        type="number"
        min="1"
        value={question.points}
        onChange={(e) => onUpdate(question.id, { points: parseInt(e.target.value) || 1 })}
        className="w-16 px-2 py-1 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all focus:ring-2 focus:ring-[#034153] text-sm"
      />
    </div>
  </div>
);

const QuestionViewMode = ({ question, isOptionCorrect }: any) => (
  <div className="space-y-4">
    <h3 className="text-base sm:text-lg font-semibold text-gray-800">{question.question}</h3>
    
    {question.type === 'labeling' ? (
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Answer Key:</h4>
        {question.imageUrl && (
          <img src={question.imageUrl} alt="Labeled Diagram" className="max-w-full h-auto max-h-32 object-contain mb-3 border border-gray-200 rounded-lg" />
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
    ) : question.options ? (
      <ul className="space-y-1 text-sm">
        {question.options.map((option: string, optIndex: number) => (
          <li key={optIndex} className={`flex items-start gap-2 p-2 rounded-lg border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all ${
            isOptionCorrect(question, optIndex) ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700'
          }`}>
            {isOptionCorrect(question, optIndex) ? (
              question.type === 'multiple' || question.type === 'truefalse' ? 
                <FaCheckCircle className="mt-1 flex-shrink-0" /> : 
                <FaCheckSquare className="mt-1 flex-shrink-0" />
            ) : (
              question.type === 'multiple' || question.type === 'truefalse' ? 
                <FaRegCircle className="mt-1 flex-shrink-0 text-gray-400" /> : 
                <FaRegSquare className="mt-1 flex-shrink-0 text-gray-400" />
            )}
            <span className="flex-1">{option}</span>
          </li>
        ))}
      </ul>
    ) : (
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all">
        <h4 className="text-sm font-medium text-gray-700 mb-1">Correct Answer:</h4>
        <p className="text-base font-semibold text-gray-800">{question.correctAnswer}</p>
      </div>
    )}
  </div>
);

const QuestionList = ({
  questions,
  QuestionCard,
  newQuestion,
  onNewQuestionChange,
  onAddQuestion,
  onNewQuestionAddOption,
  onNewQuestionUpdateOption,
  onNewQuestionRemoveOption,
  onNewQuestionToggleCorrectAnswer,
  isNewOptionCorrect
}: any) => (
  <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
    <h2 className="text-xl font-bold text-gray-800">Questions ({questions.length})</h2>

    <div className="space-y-6">
      {questions.map((question: Question, index: number) => (
        <QuestionCard key={question.id} question={question} index={index} />
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

const NewQuestionForm = ({
  newQuestion,
  onNewQuestionChange,
  onAddQuestion,
  onNewQuestionAddOption,
  onNewQuestionUpdateOption,
  onNewQuestionRemoveOption,
  onNewQuestionToggleCorrectAnswer,
  isNewOptionCorrect
}: any) => (
  <div className="bg-white border-2 border-dashed border-[#034153]/50 rounded-xl p-5 sm:p-6 shadow-lg border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all">
    <h3 className="text-lg font-bold text-[#034153] mb-4">Add New Question</h3>
    
    <div className="space-y-4">
      <div>
        <label htmlFor="newQuestionType" className="block text-sm font-medium text-gray-700">Question Type</label>
        <select
          id="newQuestionType"
          value={newQuestion.type}
          onChange={(e) => onNewQuestionChange({ ...newQuestion, type: e.target.value })}
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
        <label htmlFor="newQuestionText" className="block text-sm font-medium text-gray-700">Question Text</label>
        <textarea
          id="newQuestionText"
          value={newQuestion.question}
          onChange={(e) => onNewQuestionChange({ ...newQuestion, question: e.target.value })}
          placeholder="Enter the question text here..."
          rows={2}
          className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all focus:ring-[#034153] focus:border-[#034153] text-sm resize-none font-semibold"
        />
      </div>

      {newQuestion.type === 'multiple' || newQuestion.type === 'checkbox' || newQuestion.type === 'truefalse' ? (
        <NewQuestionOptions
          newQuestion={newQuestion}
          onNewQuestionAddOption={onNewQuestionAddOption}
          onNewQuestionUpdateOption={onNewQuestionUpdateOption}
          onNewQuestionRemoveOption={onNewQuestionRemoveOption}
          onNewQuestionToggleCorrectAnswer={onNewQuestionToggleCorrectAnswer}
          isNewOptionCorrect={isNewOptionCorrect}
        />
      ) : newQuestion.type === 'labeling' ? (
        <NewLabelingQuestion
          newQuestion={newQuestion}
          onNewQuestionChange={onNewQuestionChange}
        />
      ) : (
        <NewTextAnswer
          newQuestion={newQuestion}
          onNewQuestionChange={onNewQuestionChange}
        />
      )}

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
  isNewOptionCorrect
}: any) => (
  <div className="space-y-2 border-l-4 border-gray-100 pl-4 py-2">
    <label className="block text-sm font-medium text-gray-700">Options and Correct Answers</label>
    {newQuestion.options!.map((option: string, index: number) => (
      <div key={index} className="flex gap-2 items-center">
        <button
          type="button"
          onClick={() => onNewQuestionToggleCorrectAnswer(index)}
          className={`p-1.5 rounded-full transition-colors flex-shrink-0 border border-gray-200 rounded-lg hover:border-gray-300 ${
            isNewOptionCorrect(index)
              ? 'bg-green-100 text-green-600 hover:bg-green-200'
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
          }`}
          title="Mark as correct"
        >
          {newQuestion.type === 'multiple' || newQuestion.type === 'truefalse' ? (
            isNewOptionCorrect(index) ? <FaCheckCircle size={14} /> : <FaRegCircle size={14} />
          ) : (
            isNewOptionCorrect(index) ? <FaCheckSquare size={14} /> : <FaRegSquare size={14} />
          )}
        </button>

        <input
          type="text"
          value={option}
          onChange={(e) => onNewQuestionUpdateOption(index, e.target.value)}
          placeholder={`Option ${index + 1}`}
          className={`w-full px-3 py-2 border rounded-lg hover:border-gray-300 hover:shadow-sm transition-all focus:ring-2 focus:ring-[#034153] text-sm ${
            isNewOptionCorrect(index) ? 'bg-green-50 border-green-300' : 'border-gray-200'
          }`}
        />

        {newQuestion.options!.length > 2 && (
          <button
            type="button"
            onClick={() => onNewQuestionRemoveOption(index)}
            className="p-1.5 rounded-full text-red-500 hover:bg-red-100 transition-colors flex-shrink-0 border border-gray-200 rounded-lg hover:border-gray-300"
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

const NewLabelingQuestion = ({ newQuestion, onNewQuestionChange }: any) => (
  <div className="space-y-4 border-l-4 border-yellow-500 pl-4 py-2">
    <h4 className="text-sm font-bold text-gray-700">Image and Label Setup</h4>
    
    <label className="block text-sm font-medium text-gray-700">Image URL (Must be pre-labeled)</label>
    <input
      type="url"
      value={newQuestion.imageUrl || ''}
      onChange={(e) => onNewQuestionChange({ ...newQuestion, imageUrl: e.target.value })}
      placeholder="Paste image URL here"
      className="w-full px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all focus:ring-2 focus:ring-yellow-500 text-sm"
    />

    {newQuestion.imageUrl && (
      <div className="mt-2 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all p-2 bg-gray-50">
        <img src={newQuestion.imageUrl} alt="Preview" className="max-w-full h-auto max-h-48 object-contain mx-auto" />
        <p className="text-xs text-gray-500 text-center mt-1">Ensure labels (A, B, C...) are visible on the image.</p>
      </div>
    )}

    <label className="block text-sm font-medium text-gray-700 mt-3">Define Label-Answer Key</label>
    {(newQuestion.labelAnswers || [{ label: 'A', answer: '' }]).map((la: any, index: number) => (
      <div key={index} className="flex gap-2 items-center">
        <input
          type="text"
          value={la.label}
          onChange={(e) => {
            const newLabels = [...(newQuestion.labelAnswers || [])];
            newLabels[index] = { ...newLabels[index], label: e.target.value.toUpperCase() };
            onNewQuestionChange({ ...newQuestion, labelAnswers: newLabels });
          }}
          placeholder="Label (A, B, C)"
          className="w-20 px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all focus:ring-2 focus:ring-yellow-500 text-sm font-semibold text-center flex-shrink-0"
          maxLength={3}
        />

        <input
          type="text"
          value={la.answer}
          onChange={(e) => {
            const newLabels = [...(newQuestion.labelAnswers || [])];
            newLabels[index] = { ...newLabels[index], answer: e.target.value };
            onNewQuestionChange({ ...newQuestion, labelAnswers: newLabels });
          }}
          placeholder="Correct Name of Labeled Part"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all focus:ring-2 focus:ring-yellow-500 text-sm"
        />
        
        {newQuestion.labelAnswers && newQuestion.labelAnswers.length > 1 && (
          <button
            type="button"
            onClick={() => {
              const newLabels = newQuestion.labelAnswers!.filter((_: any, i: number) => i !== index);
              onNewQuestionChange({ ...newQuestion, labelAnswers: newLabels });
            }}
            className="p-1.5 rounded-full text-red-500 hover:bg-red-100 transition-colors flex-shrink-0 border border-gray-200 rounded-lg hover:border-gray-300"
            title="Remove label"
          >
            <FaTimes size={14} />
          </button>
        )}
      </div>
    ))}

    <button
      onClick={() => {
        const newLabel = String.fromCharCode(65 + (newQuestion.labelAnswers?.length || 0));
        onNewQuestionChange({ 
          ...newQuestion, 
          labelAnswers: [...(newQuestion.labelAnswers || []), { label: newLabel, answer: '' }] 
        });
      }}
      className="text-yellow-600 hover:text-yellow-700 flex items-center gap-1 text-sm font-medium mt-2 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all px-3 py-1"
    >
      <FaPlus size={12} /> Add Label Key
    </button>
  </div>
);

const NewTextAnswer = ({ newQuestion, onNewQuestionChange }: any) => (
  <div className="space-y-2 border-l-4 border-gray-100 pl-4 py-2">
    <label className="block text-sm font-medium text-gray-700">Correct Answer</label>
    <input
      type={newQuestion.type === 'number' ? 'number' : 'text'}
      value={newQuestion.correctAnswer || ''}
      onChange={(e) => onNewQuestionChange({ 
        ...newQuestion, 
        correctAnswer: e.target.value,
        correctAnswers: [e.target.value]
      })}
      placeholder="Enter the correct answer"
      className="w-full px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all focus:ring-2 focus:ring-[#034153] text-sm"
    />
    <p className="text-xs text-gray-500 mt-1">
      Note: For text answers, only an exact match will be graded as correct.
    </p>
  </div>
);

export default QuizEditor;