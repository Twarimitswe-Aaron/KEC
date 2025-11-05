// src/components/QuizEditor.tsx
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import QuestionEditForm from "./QuizEditorComponents/QuestionEditForm.tsx";
import {
  FaCheckCircle,
  FaCheckSquare,
  FaEdit,
  FaQuestionCircle,
  FaTimes,
  FaCheck,
  FaList,
  FaPlus,
  FaRegCircle,
  FaRegSquare,
  FaTrash,
  FaArrowUp,
  FaArrowDown,
  FaTrashAlt,
} from "react-icons/fa";
import {
  X,
  Eye,
  Hash,
  Type,
  List as ListIcon,
  CheckSquare,
  ToggleLeft,
  Menu,
} from "lucide-react";
import {
  useUpdateQuizMutation,
  useGetQuizDataByQuizIdQuery,
  quizHelper,
} from "../state/api/quizApi";

// Types (simplified)
interface Question {
  id: number;
  type:
    | "multiple"
    | "checkbox"
    | "truefalse"
    | "labeling";
  question: string;
  description?: string;
  options?: string[];
  correctAnswers?: (string | number)[];
  correctAnswer?: string | number;
  imageUrl?: string;
  imageFile?: File; // For handling file uploads
  labelAnswers?: { label: string; answer: string }[];
  required: boolean;
  points: number;
}



interface QuizSettings {
  title: string;
  description?: string;
  showResults?: boolean;
  allowRetakes?: boolean;
  passingScore?: number;
}

interface QuizProps {
  courseId: number;
  lessonId: number;
  quizId: number;

}

interface QuizEditorProps {
  resource: QuizProps;

  onClose: () => void;
}

// Constants
const QUESTION_TYPES = [
  {
    value: "multiple",
    label: "Multiple Choice",
    icon: FaRegCircle,
    description: "Single select from options",
  },
  {
    value: "checkbox",
    label: "Checkbox",
    icon: CheckSquare,
    description: "Multiple select from options",
  },
  {
    value: "truefalse",
    label: "True/False",
    icon: ToggleLeft,
    description: "True or false selection",
  },
  {
    value: "short",
    label: "Short Answer",
    icon: Type,
    description: "Short text response",
  },
  {
    value: "long",
    label: "Paragraph",
    icon: ListIcon,
    description: "Long text response",
  },
  {
    value: "number",
    label: "Number",
    icon: Hash,
    description: "Numeric response",
  },
  {
    value: "labeling",
    label: "Image Labeling",
    icon: FaList,
    description: "Identify pre-labeled parts on an image",
  },
] as const;

const INITIAL_NEW_QUESTION: Partial<Question> = {
  type: "multiple",
  question: "",
  options: ["", ""],
  required: false,
  points: 1,
};

// Main Component
const QuizEditor = ({ onClose, resource }: QuizEditorProps) => {
  const {
    data: quizData,
    isLoading,
    error,
    refetch,
  } = useGetQuizDataByQuizIdQuery({
    courseId: resource.courseId,
    lessonId: resource.lessonId,
    quizId: resource.quizId!,
  });

  const [updateQuiz, { isLoading: isUpdating }] = useUpdateQuizMutation();

  // State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizSettings, setQuizSettings] = useState<QuizSettings>({
    title: "",
    showResults: true,
    allowRetakes: false,
    passingScore: 0,
  });
  const [newQuestion, setNewQuestion] =
    useState<Partial<Question>>(INITIAL_NEW_QUESTION);
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize from API data
  useEffect(() => {
    if (quizData) {
      setQuestions(
        quizData.questions?.map((q: any, index: number) => ({
          id: q.id || Date.now() + index,
          type: q.type || "multiple",
          question: q.question || "",
          description: q.description || "",
          options:
            q.options ||
            (q.type !== "short" &&
            q.type !== "long" &&
            q.type !== "number" &&
            q.type !== "labeling"
              ? [""]
              : undefined),
          correctAnswers: q.correctAnswers || [],
          correctAnswer: q.correctAnswer,
          required: q.required || false,
          points: q.points || 1,
          imageUrl: q.imageUrl,
          labelAnswers: q.labelAnswers,
        })) || []
      );

      setQuizSettings(
        quizData.settings || {
          title: quizData.name ,
          description: quizData.description,
          showResults: true,
          allowRetakes: false,
          passingScore: 0,
        }
      );

      setHasChanges(false);
    }
  }, [quizData, resource]);

  const updateQuestion = (questionId: number, updates: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, ...updates } : q))
    );
    setHasChanges(true);
  };

  const addOption = (questionId: number) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, options: [...(q.options || []), ""] } : q
      )
    );
    setHasChanges(true);
  };

  const updateOption = (
    questionId: number,
    optionIndex: number,
    value: string
  ) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId && q.options) {
          const updatedOptions = [...q.options];
          updatedOptions[optionIndex] = value;
          return { ...q, options: updatedOptions };
        }
        return q;
      })
    );
    setHasChanges(true);
  };

  const removeOption = (questionId: number, optionIndex: number) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId && q.options && q.options.length > 1) {
          const updatedOptions = q.options.filter((_, i) => i !== optionIndex);
          return { ...q, options: updatedOptions };
        }
        return q;
      })
    );
    setHasChanges(true);
  };

  const toggleCorrectAnswer = (questionId: number, optionIndex: number) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId && q.options) {
          if (q.type === "multiple" || q.type === "truefalse") {
            return {
              ...q,
              correctAnswer:
                q.correctAnswer === optionIndex ? undefined : optionIndex,
              correctAnswers:
                q.correctAnswer === optionIndex ? [] : [optionIndex],
            };
          } else if (q.type === "checkbox") {
            const currentAnswers = q.correctAnswers || [];
            const newAnswers = currentAnswers.includes(optionIndex)
              ? currentAnswers.filter((ans) => ans !== optionIndex)
              : [...currentAnswers, optionIndex];
            return { ...q, correctAnswers: newAnswers };
          }
        }
        return q;
      })
    );
    setHasChanges(true);
  };

  const updateSettings = (key: keyof QuizSettings, value: any) => {
    setQuizSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const addQuestion = () => {
    if (!newQuestion.question?.trim()) {
      toast.error("Please enter a question");
      return;
    }

    const question: Question = {
      id: Date.now(),
      type: newQuestion.type!,
      question: newQuestion.question.trim(),
      required: newQuestion.required || false,
      points: newQuestion.points || 1,
      options: newQuestion.options?.filter((opt) => opt.trim()),
      correctAnswers: newQuestion.correctAnswers || [],
      correctAnswer: newQuestion.correctAnswer,
    };

    setQuestions((prev) => [...prev, question]);
    setNewQuestion(INITIAL_NEW_QUESTION);
    setHasChanges(true);
    toast.success("Question added!");
  };

  const newQuestionAddOption = () => {
    setNewQuestion((prev) => ({
      ...prev,
      options: [...(prev.options || []), ""],
    }));
  };

  const newQuestionUpdateOption = (index: number, value: string) => {
    setNewQuestion((prev) => {
      if (!prev.options) return prev;
      const updatedOptions = [...prev.options];
      updatedOptions[index] = value;
      return { ...prev, options: updatedOptions };
    });
  };

  const newQuestionRemoveOption = (index: number) => {
    setNewQuestion((prev) => {
      if (!prev.options || prev.options.length <= 2) return prev;
      return {
        ...prev,
        options: prev.options.filter((_, i) => i !== index),
      };
    });
  };

  const newQuestionToggleCorrectAnswer = (optionIndex: number) => {
    setNewQuestion((prev) => {
      if (!prev.options) return prev;

      if (prev.type === "multiple" || prev.type === "truefalse") {
        return {
          ...prev,
          correctAnswer:
            prev.correctAnswer === optionIndex ? undefined : optionIndex,
          correctAnswers:
            prev.correctAnswer === optionIndex ? [] : [optionIndex],
        };
      } else if (prev.type === "checkbox") {
        const current = prev.correctAnswers || [];
        const newAnswers = current.includes(optionIndex)
          ? current.filter((ans) => ans !== optionIndex)
          : [...current, optionIndex];
        return { ...prev, correctAnswers: newAnswers };
      }
      return prev;
    });
  };

  const deleteQuestion = (questionId: number) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    setHasChanges(true);
    toast.success("Question deleted successfully!");
  };

  const moveQuestion = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === questions.length - 1)
    )
      return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    setQuestions((prev) => {
      const updated = [...prev];
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      return updated;
    });
    setHasChanges(true);
  };

  // Label management
  const updateLabelAnswer = (
    questionId: number,
    index: number,
    field: "label" | "answer",
    value: string
  ) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question?.labelAnswers) return;

    const newLabelAnswers = [...question.labelAnswers];
    newLabelAnswers[index] = {
      ...newLabelAnswers[index],
      [field]: field === "label" ? value.toUpperCase() : value,
    };
    updateQuestion(questionId, { labelAnswers: newLabelAnswers });
  };

  const addLabelKey = (questionId: number) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    const currentLabels = question.labelAnswers || [];
    const newLabel = String.fromCharCode(65 + currentLabels.length);
    updateQuestion(questionId, {
      labelAnswers: [...currentLabels, { label: newLabel, answer: "" }],
    });
  };

  const removeLabelKey = (questionId: number, index: number) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question?.labelAnswers || question.labelAnswers.length <= 1) return;

    updateQuestion(questionId, {
      labelAnswers: question.labelAnswers.filter((_, i) => i !== index),
    });
  };


  const saveQuiz = async () => {
  if (!quizData?.id) return;

  try {
    const quizTitle = quizSettings.title || quizData.name;
    if (!quizTitle?.trim()) {
      toast.error("Quiz title is required");
      return;
    }

    const submissionQuestions = questions
      .filter((q) => q.question?.trim() !== "")
      .map((q, index) => {
        const questionData: any = {
          id: q.id,
          type: q.type,
          question: q.question.trim(),
          required: q.required || false,
          points: q.points || 1,
        };

        // Handle options
        if (q.options?.length) {
          questionData.options = q.options.filter((opt) => opt.trim());
        }

        // Handle correct answers depending on type
        if (q.type === "multiple" || q.type === "truefalse") {
          questionData.correctAnswer = q.correctAnswer ?? null;
          questionData.correctAnswers = q.correctAnswers || [];
        } else if (q.type === "checkbox") {
          questionData.correctAnswer = null;
          questionData.correctAnswers = q.correctAnswers || [];
        } else if (
          ["short", "long", "number"].includes(q.type)
        ) {
          questionData.correctAnswer = q.correctAnswer ?? null;
          questionData.correctAnswers = [];
        } else if (q.type === "labeling") {
          questionData.correctAnswer = null;
          questionData.correctAnswers = q.labelAnswers || [];
        }

        return questionData;
      });

    const submissionData = {
      name: quizTitle,
      description: quizSettings.description?.trim() || "",
      questions: submissionQuestions,
      settings: quizSettings,
        courseId:resource.courseId!,
      lessonId:resource.lessonId!,
    };

    console.log("Submitting quiz:", submissionData);

    const { message } = await updateQuiz({
      id: quizData.id,
      data: submissionData,
    }).unwrap();

    toast.success(message);
    setHasChanges(false);
    await refetch();
  } catch (error: any) {
    console.error("Save quiz error:", error);
    toast.error(error?.data?.message || error?.message || "Failed to save quiz");
  }
};

  // Simple helper functions
  const getQuestionIcon = (type: string) => {
    return (
      QUESTION_TYPES.find((t) => t.value === type)?.icon || FaQuestionCircle
    );
  };

  const isOptionCorrect = (question: Question, optionIndex: number) => {
    if (question.type === "multiple" || question.type === "truefalse") {
      return question.correctAnswer === optionIndex;
    } else if (question.type === "checkbox") {
      return (question.correctAnswers || []).includes(optionIndex);
    }
    return false;
  };

  // New question handlers
  const handleNewQuestionChange = (updates: Partial<Question>) => {
    setNewQuestion((prev) => ({ ...prev, ...updates }));
  };

  const isNewOptionCorrect = (optionIndex: number) => {
    if (newQuestion.type === "multiple" || newQuestion.type === "truefalse") {
      return newQuestion.correctAnswer === optionIndex;
    } else if (newQuestion.type === "checkbox") {
      return (newQuestion.correctAnswers || []).includes(optionIndex);
    }
    return false;
  };

  // Reset new question when type changes
  useEffect(() => {
     if (newQuestion.type === "labeling") {
      setNewQuestion((prev) => ({
        ...prev,
        options: undefined,
        correctAnswers: [],
        correctAnswer: undefined,
        imageUrl: prev.imageUrl || "",
        labelAnswers: prev.labelAnswers || [{ label: "A", answer: "" }],
      }));
    } else if (!newQuestion.options || newQuestion.options.length < 2) {
      setNewQuestion((prev) => ({
        ...prev,
        options: ["", ""],
        correctAnswers: [],
        correctAnswer: undefined,
        imageUrl: undefined,
        labelAnswers: undefined,
      }));
    }
  }, [newQuestion.type]);

  if (isLoading) return <LoadingOverlay message="Loading quiz..." />;
  if (error && !resource.quizId) return <ErrorOverlay onClose={onClose} />;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex">
      <Sidebar
        showSidebar={showSidebar}
        onCloseSidebar={() => setShowSidebar(false)}
        quizSettings={quizSettings}
        onSettingsChange={updateSettings}
      />

      <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden">
        <Header
          showSidebar={showSidebar}
          onToggleSidebar={() => setShowSidebar(true)}
          quizData={quizData}
          hasChanges={hasChanges}
          isSaveDisabled={isUpdating}
          isSaving={isUpdating}
          onManualSave={saveQuiz}
          onClose={onClose}
        />

        <QuestionList
          questions={questions}
          editingQuestion={editingQuestion}
          setEditingQuestion={setEditingQuestion}
          updateQuestion={updateQuestion}
          deleteQuestion={deleteQuestion}
          moveQuestion={moveQuestion}
          toggleCorrectAnswer={toggleCorrectAnswer}
          addOption={addOption}
          updateOption={updateOption}
          removeOption={removeOption}
          updateLabelAnswer={updateLabelAnswer}
          addLabelKey={addLabelKey}
          removeLabelKey={removeLabelKey}
          isOptionCorrect={isOptionCorrect}
          getQuestionIcon={getQuestionIcon}
          newQuestion={newQuestion}
          onNewQuestionChange={handleNewQuestionChange}
          onAddQuestion={addQuestion}
          onNewQuestionAddOption={newQuestionAddOption}
          onNewQuestionUpdateOption={newQuestionUpdateOption}
          onNewQuestionRemoveOption={newQuestionRemoveOption}
          onNewQuestionToggleCorrectAnswer={newQuestionToggleCorrectAnswer}
          isNewOptionCorrect={isNewOptionCorrect}
          courseId={resource.courseId}
          lessonId={resource.lessonId}
          quizId={resource.quizId}
        />
      </div>
    </div>
  );
};

const LoadingOverlay = ({ message }: { message: string }) => (
  <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
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
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Failed to load quiz
      </h3>
      <p className="text-gray-600 mb-4">
        There was an error loading the quiz data.
      </p>
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
  onSettingsChange,
}: {
  showSidebar: boolean;
  onCloseSidebar: () => void;
  quizSettings: QuizSettings;
  onSettingsChange: (key: keyof QuizSettings, value: any) => void;
}) => (
  <div
    className={`fixed inset-y-0 left-0 w-64 bg-white p-5 border-r border-gray-200 transition-transform duration-300 z-50 transform ${
      showSidebar ? "translate-x-0" : "-translate-x-full"
    } lg:relative lg:translate-x-0 lg:w-72 flex-shrink-0`}
  >
    <button
      onClick={onCloseSidebar}
      className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 lg:hidden border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all p-1"
      title="Close Sidebar"
    >
      <X size={20} />
    </button>

    <h3 className="text-xl font-bold text-[#034153] mb-4 border-b border-gray-200 pb-2">
      Quiz Settings
    </h3>

    <div className="space-y-4">
      <SettingInput
        label="Quiz Title"
        id="quizTitle"
        type="text"
        value={quizSettings.title}
        onChange={(value: string) => onSettingsChange("title", value)}
        placeholder="Enter quiz title"
      />

      <SettingTextarea
        label="Description (Optional)"
        id="quizDescription"
        value={quizSettings.description || ""}
        onChange={(value: string) => onSettingsChange("description", value)}
        placeholder="Quiz description"
        rows={3}
      />

      <SettingInput
        label="Passing Score (%)"
        id="passingScore"
        type="number"
        min="0"
        max="100"
        value={quizSettings.passingScore || 0}
        onChange={(value) =>
          onSettingsChange("passingScore", parseInt(value) || 0)
        }
      />

      <ToggleSetting
        label="Show Results to Students"
        checked={quizSettings.showResults}
        onChange={(value) => onSettingsChange("showResults", value)}
      />

      <ToggleSetting
        label="Allow Multiple Retakes"
        checked={quizSettings.allowRetakes}
        onChange={(value) => onSettingsChange("allowRetakes", value)}
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


//questions


interface QuestionListProps {
  questions: any[];
  editingQuestion: number | null;
  setEditingQuestion: (id: number | null) => void;
  updateQuestion: (questionId: number, updates: any) => void;
  deleteQuestion: (questionId: number) => void;
  moveQuestion: (index: number, direction: 'up' | 'down') => void;
  toggleCorrectAnswer: (questionId: number, optionIndex: number) => void;
  addOption: (questionId: number) => void;
  updateOption: (questionId: number, optionIndex: number, value: string) => void;
  removeOption: (questionId: number, optionIndex: number) => void;
  updateLabelAnswer: (questionId: number, index: number, field: 'label' | 'answer', value: string) => void;
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
  const [editingStates, setEditingStates] = useState<{[key: number]: any}>({});

  // Start editing a question - store current state
  const handleStartEdit = (question: any) => {
    setEditingStates(prev => ({
      ...prev,
      [question.id]: { ...question }
    }));
    setEditingQuestion(question.id);
  };

  // Cancel editing - restore original state
  const handleCancelEdit = (questionId: number) => {
    const originalQuestion = editingStates[questionId];
    if (originalQuestion) {
      updateQuestion(questionId, originalQuestion);
    }
    setEditingQuestion(null);
    setEditingStates(prev => {
      const newState = { ...prev };
      delete newState[questionId];
      return newState;
    });
  };

  // Save edited question - prepare data for backend
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
      }
    };

    // Update local state immediately
    updateQuestion(questionId, updatedQuestion);
    
    // Clear editing state
    setEditingQuestion(null);
    setEditingStates(prev => {
      const newState = { ...prev };
      delete newState[questionId];
      return newState;
    });

    // TODO: Integrate with backend API
    console.log('Saving question updates:', questionData);
    // await updateQuestionAPI(questionData);
  };

  // Update question during editing
  const handleQuestionUpdate = (questionId: number, updates: any) => {
    const currentQuestion = questions.find(q => q.id === questionId);
    if (!currentQuestion) return;

    const updatedQuestion = { ...currentQuestion, ...updates };
    
    // Update the editing state
    setEditingStates(prev => ({
      ...prev,
      [questionId]: updatedQuestion
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
              // Editing Mode
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-blue-800">
                    Editing Question {index + 1}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(question.id, editingStates[question.id] || question)}
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
                  onUpdate={(updates) => handleQuestionUpdate(question.id, updates)}
                  onToggleCorrectAnswer={toggleCorrectAnswer}
                  onAddOption={addOption}
                  onUpdateOption={updateOption}
                  onRemoveOption={removeOption}
                  onUpdateLabelAnswer={updateLabelAnswer}
                  onAddLabelKey={addLabelKey}
                  onRemoveLabelKey={removeLabelKey}
                  isOptionCorrect={(q, optionIndex) => isOptionCorrect(q, optionIndex)}
                />
              </div>
            ) : (
              // View Mode
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




// Text Answer Edit Component
const TextAnswerEdit = ({ question, onSetTextCorrectAnswer }: any) => (
  <div className="space-y-2 border-l-4 border-purple-500 pl-4 py-2">
    <label className="block text-sm font-medium text-gray-700">
      Correct Answer
    </label>
    <input
      type="text"
      value={question.correctAnswer || ''}
      onChange={(e) => onSetTextCorrectAnswer(e.target.value)}
      placeholder="Enter the correct answer..."
      className="w-full px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all focus:ring-2 focus:ring-purple-500 text-sm"
    />
  </div>
);

// Question Card Component (for view mode)
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Icon className="h-5 w-5 text-[#034153] mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-gray-900">
                {question.question || `Question ${index + 1}`}
              </h3>
              {question.description && (
                <p className="text-sm text-gray-500 mt-1">
                  {question.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onMove(index, "up")}
              disabled={index === 0}
              className="text-gray-400 hover:text-[#034153] disabled:opacity-30"
              title="Move up"
            >
              <FaArrowUp />
            </button>
            <button
              onClick={() => onMove(index, "down")}
              disabled={index === questions.length - 1}
              className="text-gray-400 hover:text-[#034153] disabled:opacity-30"
              title="Move down"
            >
              <FaArrowDown />
            </button>
            <button
              onClick={onEdit}
              className="text-gray-400 hover:text-blue-500"
              title="Edit"
            >
              <FaEdit />
            </button>
            <button
              onClick={onDelete}
              className="text-gray-400 hover:text-red-500"
              title="Delete"
            >
              <FaTrashAlt />
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


const SettingInput = ({
  label,
  id,
  type,
  value,
  onChange,
  placeholder,
  min,
  max,
}: SettingInputProps) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
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

const SettingTextarea = ({
  label,
  id,
  value,
  onChange,
  placeholder,
  rows,
}: any) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
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
  checked?: boolean; // Make checked optional
  onChange: (value: boolean) => void;
}

const ToggleSetting = ({
  label,
  checked = false,
  onChange,
}: ToggleSettingProps) => (
  <div className="flex items-center justify-between border-t border-gray-200 pt-4">
    <span className="text-sm font-medium text-gray-700">{label}</span>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={Boolean(checked)}
        onChange={(e) => onChange(Boolean(e.target.checked))}
      />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#034153]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#034153] border border-gray-200 rounded-lg hover:border-gray-300"></div>
    </label>
  </div>
);

interface HeaderProps {
  showSidebar: boolean;
  onToggleSidebar: () => void;
  quizData?: {
    name: string;
    settings?: QuizSettings;
  };
  hasChanges: boolean;
  isSaveDisabled: boolean;
  isSaving: boolean;
  onManualSave: () => Promise<void>;
  onClose: () => void;
}

const Header = ({
  showSidebar,
  onToggleSidebar,
  quizData,
  hasChanges,
  isSaveDisabled,
  isSaving,
  onManualSave,
  onClose,
}: HeaderProps) => (
  <div className="p-4 sm:p-5 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between flex-wrap gap-3 sticky top-0 z-40">
    <div className="flex items-center gap-3">
      <button
        onClick={onToggleSidebar}
        className="p-2  text-[#034153] hover:bg-gray-100 lg:hidden border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
        title="Open Settings"
      >
        <Menu size={20} />
      </button>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
        {quizData?.name ? `Editing: ${quizData.name}` : "New Quiz"}
      </h1>
      <span
        className={`text-xs font-medium px-2 py-1 rounded-full border border-gray-200 ${
          hasChanges
            ? "bg-yellow-100 text-yellow-800"
            : "bg-green-100 text-green-800"
        }`}
      >
        {hasChanges ? "Unsaved Changes" : "Saved"}
      </span>
    </div>
    <div className="flex items-center gap-3">
      <button
        onClick={onManualSave}
        disabled={isSaveDisabled}
        className={`px-4 py-2 cursor-pointer rounded-lg font-semibold transition-colors flex items-center gap-2 border border-gray-200  hover:border-gray-300 hover:shadow-sm ${
          isSaveDisabled
            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            : "bg-[#034153] text-white "
        }`}
      >
        <FaCheck size={16} />
        {isSaving ? "Saving..." : "Save Quiz"}
      </button>
      <button
        onClick={onClose}
        className="p-2  text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm"
        title="Close Editor"
      >
        <X size={24} />
      </button>
    </div>
  </div>
);



const QuestionOptionsEdit = ({
  question,
  onToggleCorrectAnswer,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
  isOptionCorrect,
}: any) => (
  <div className="space-y-2 border-l-4 border-gray-100 pl-4 py-2">
    <label className="block text-sm font-medium text-gray-700">Options</label>
    {question.options.map((option: string, optIndex: number) => (
      <div key={optIndex} className="flex gap-2 items-center">
        <button
          type="button"
          onClick={() => onToggleCorrectAnswer(question.id, optIndex)}
          className={`p-1.5 transition-colors flex-shrink-0 border border-gray-200 rounded-lg hover:border-gray-300 ${
            isOptionCorrect(question, optIndex)
              ? "bg-green-100 text-green-600 hover:bg-green-200"
              : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          }`}
          title="Mark as correct"
        >
          {question.type === "multiple" || question.type === "truefalse" ? (
            isOptionCorrect(question, optIndex) ? (
              <FaCheckCircle size={14} />
            ) : (
              <FaRegCircle size={14} />
            )
          ) : isOptionCorrect(question, optIndex) ? (
            <FaCheckSquare size={14} />
          ) : (
            <FaRegSquare size={14} />
          )}
        </button>

        <input
          type="text"
          value={option}
          onChange={(e) =>
            onUpdateOption(question.id, optIndex, e.target.value)
          }
          placeholder={`Option ${optIndex + 1}`}
          className={`w-full px-3 py-2 border rounded-lg hover:border-gray-300 hover:shadow-sm transition-all focus:ring-2 focus:ring-[#034153] text-sm ${
            isOptionCorrect(question, optIndex)
              ? "bg-green-50 border-green-300"
              : "border-gray-200"
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

interface LabelingQuestionEditProps {
  question: Question;
  onUpdate: (updates: Partial<Question>) => void;
  onUpdateLabelAnswer: (questionId: number, index: number, field: 'label' | 'answer', value: string) => void;
  onAddLabelKey: (questionId: number) => void;
  onRemoveLabelKey: (questionId: number, index: number) => void;
  disabled?: boolean;
}

const LabelingQuestionEdit = ({
  question,
  onUpdate,
  onUpdateLabelAnswer,
  onAddLabelKey,
  onRemoveLabelKey,
  disabled = false,
}: LabelingQuestionEditProps) => {

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type and size
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Create a temporary URL for preview
    const tempUrl = URL.createObjectURL(file);
    
    // Update the UI immediately with the temp URL
    onUpdate({ 
      ...question, 
      imageUrl: tempUrl,
      imageFile: file  // We'll send this to the backend
    });
  };

  return (
    <div className="space-y-4 border-l-4 border-yellow-500 pl-4 py-2">
      <h4 className="text-sm font-bold text-gray-700">Image and Label Setup</h4>

      <label className="block text-sm font-medium text-gray-700">
        Upload Image
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all focus:ring-2 focus:ring-yellow-500 text-sm cursor-pointer"
      />

      {question.imageUrl && (
        <div className="mt-2 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all p-2 bg-gray-50">
          <img
            src={question.imageUrl}
            alt="Preview"
            className="max-w-full h-auto max-h-48 object-contain mx-auto"
          />
          <p className="text-xs text-gray-500 text-center mt-1">
            Ensure labels (A, B, C...) are visible on the image.
          </p>
        </div>
      )}

      <label className="block text-sm font-medium text-gray-700 mt-3">
        Define Label-Answer Key
      </label>

      {(question.labelAnswers || []).map((la: any, index: number) => (
        <div key={index} className="flex gap-2 items-center">
          <input
            type="text"
            value={la.label}
            onChange={(e) =>
              onUpdateLabelAnswer(question.id, index, "label", e.target.value)
            }
            placeholder="Label (A, B, C)"
            className="w-20 px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all focus:ring-2 focus:ring-yellow-500 text-sm font-semibold text-center flex-shrink-0"
            maxLength={3}
          />

          <input
            type="text"
            value={la.answer}
            onChange={(e) =>
              onUpdateLabelAnswer(question.id, index, "answer", e.target.value)
            }
            placeholder="Correct Name of Labeled Part"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all focus:ring-2 focus:ring-yellow-500 text-sm"
          />

          {question.labelAnswers!.length > 1 && (
            <button
              type="button"
              onClick={() => onRemoveLabelKey(question.id, index)}
              className="p-1.5  text-red-500 hover:bg-red-100 transition-colors flex-shrink-0 border border-gray-200 rounded-lg hover:border-gray-300"
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
};

// const TextAnswerEdit = ({ question, onSetTextCorrectAnswer }: any) => (
//   <div className="space-y-2 border-l-4 border-gray-100 pl-4 py-2">
//     <label className="block text-sm font-medium text-gray-700">
//       Correct Answer
//     </label>
//     <input
//       type={question.type === "number" ? "number" : "text"}
//       value={question.correctAnswer || ""}
//       onChange={(e) => onSetTextCorrectAnswer(question.id, e.target.value)}
//       placeholder="Enter the correct answer"
//       className="w-full px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all focus:ring-2 focus:ring-[#034153] text-sm"
//     />
//     <p className="text-xs text-gray-500 mt-1">
//       Note: For text answers, only an exact match will be graded as correct.
//     </p>
//   </div>
// );

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
        onChange={(e) =>
          onUpdate(question.id, { points: parseInt(e.target.value) || 1 })
        }
        className="w-16 px-2 py-1 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all focus:ring-2 focus:ring-[#034153] text-sm"
      />
    </div>
  </div>
);

const QuestionViewMode = ({ question, isOptionCorrect }: any) => (
  <div className="space-y-4">
    <h3 className="text-base sm:text-lg font-semibold text-gray-800">
      {question.question}
    </h3>

    {question.type === "labeling" ? (
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all">
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
    ) : question.options ? (
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
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all">
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

// const QuestionCard = ({
//   question,
//   questions,
//   index,
//   onEdit,
//   onDelete,
//   onMove,
//   isOptionCorrect,
//   getQuestionIcon,
// }: QuestionCardProps) => {
//   const Icon = getQuestionIcon(question.type);

//   return (
//     <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
//       <div className="p-4">
//         <div className="flex items-start justify-between">
//           <div className="flex items-start gap-3">
//             <Icon className="h-5 w-5 text-[#034153] mt-0.5 flex-shrink-0" />
//             <div>
//               <h3 className="font-medium text-gray-900">
//                 {question.question || `Question ${index + 1}`}
//               </h3>
//               {question.description && (
//                 <p className="text-sm text-gray-500 mt-1">
//                   {question.description}
//                 </p>
//               )}
//             </div>
//           </div>
//           <div className="flex items-center gap-2">
//             <button
//               onClick={() => onMove(index, "up")}
//               disabled={index === 0}
//               className="text-gray-400 hover:text-[#034153] disabled:opacity-30"
//               title="Move up"
//             >
//               <FaArrowUp />
//             </button>
//             <button
//               onClick={() => onMove(index, "down")}
//               disabled={index === questions.length - 1}
//               className="text-gray-400 hover:text-[#034153] disabled:opacity-30"
//               title="Move down"
//             >
//               <FaArrowDown />
//             </button>
//             <button
//               onClick={() => onEdit(question)}
//               className="text-gray-400 hover:text-blue-500"
//               title="Edit"
//             >
//               <FaEdit />
//             </button>
//             <button
//               onClick={() => onDelete(question.id)}
//               className="text-gray-400 hover:text-red-500"
//               title="Delete"
//             >
//               <FaTrashAlt />
//             </button>
//           </div>
//         </div>

//         <QuestionViewMode
//           question={question}
//           isOptionCorrect={isOptionCorrect}
//         />
//       </div>
//     </div>
//   );
// };

// const QuestionList = ({
//   questions,
//   editingQuestion,
//   setEditingQuestion,
//   updateQuestion,
//   deleteQuestion,
//   moveQuestion,
//   toggleCorrectAnswer,
//   addOption,
//   updateOption,
//   removeOption,
//   updateLabelAnswer,
//   addLabelKey,
//   removeLabelKey,
//   isOptionCorrect,
//   getQuestionIcon,
//   newQuestion,
//   onNewQuestionChange,
//   onAddQuestion,
//   onNewQuestionAddOption,
//   onNewQuestionUpdateOption,
//   onNewQuestionRemoveOption,
//   onNewQuestionToggleCorrectAnswer,
//   isNewOptionCorrect,
// }: any) => (
//   <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
//     <h2 className="text-xl font-bold text-gray-800">
//       Questions ({questions.length})
//     </h2>

//     <div className="space-y-6">
//       {questions.map((question: Question, index: number) => (
//         <QuestionCard
//           key={question.id}
//           question={question}
//           index={index}
//           questions={questions}
//           onEdit={setEditingQuestion}
//           onDelete={() => deleteQuestion(question.id)}
//           onMove={moveQuestion}
//           isOptionCorrect={isOptionCorrect}
//           getQuestionIcon={getQuestionIcon}
//         />
//       ))}
//     </div>

//     <hr className="my-8 border-t border-gray-200" />

//     <NewQuestionForm
//       newQuestion={newQuestion}
//       onNewQuestionChange={onNewQuestionChange}
//       onAddQuestion={onAddQuestion}
//       onNewQuestionAddOption={onNewQuestionAddOption}
//       onNewQuestionUpdateOption={onNewQuestionUpdateOption}
//       onNewQuestionRemoveOption={onNewQuestionRemoveOption}
//       onNewQuestionToggleCorrectAnswer={onNewQuestionToggleCorrectAnswer}
//       isNewOptionCorrect={isNewOptionCorrect}
//     />
//   </div>
// );

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
  <div className="bg-white border-dashed border-[#034153]/50  p-5 sm:p-6 shadow-lg border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all">
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

      {newQuestion.type === "multiple" ||
      newQuestion.type === "checkbox" ||
      newQuestion.type === "truefalse" ? (
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

const NewLabelingQuestion = ({ newQuestion, onNewQuestionChange }: any) => {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      onNewQuestionChange({ ...newQuestion, imageUrl: reader.result });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4 border-l-4 border-yellow-500 pl-4 py-2">
      <h4 className="text-sm font-bold text-gray-700">Image and Label Setup</h4>

      <label className="block text-sm font-medium text-gray-700">
        Upload Image (Must be pre-labeled)
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all focus:ring-2 focus:ring-yellow-500 text-sm cursor-pointer"
      />

      {newQuestion.imageUrl && (
        <div className="mt-2 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all p-2 bg-gray-50">
          <img
            src={newQuestion.imageUrl}
            alt="Preview"
            className="max-w-full h-auto max-h-48 object-contain mx-auto"
          />
          <p className="text-xs text-gray-500 text-center mt-1">
            Ensure labels (A, B, C...) are visible on the image.
          </p>
        </div>
      )}

      <label className="block text-sm font-medium text-gray-700 mt-3">
        Define Label-Answer Key
      </label>

      {(newQuestion.labelAnswers || [{ label: "A", answer: "" }]).map(
        (la: any, index: number) => (
          <div key={index} className="flex gap-2 items-center">
            <input
              type="text"
              value={la.label}
              onChange={(e) => {
                const newLabels = [...(newQuestion.labelAnswers || [])];
                newLabels[index] = {
                  ...newLabels[index],
                  label: e.target.value.toUpperCase(),
                };
                onNewQuestionChange({
                  ...newQuestion,
                  labelAnswers: newLabels,
                });
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
                newLabels[index] = {
                  ...newLabels[index],
                  answer: e.target.value,
                };
                onNewQuestionChange({
                  ...newQuestion,
                  labelAnswers: newLabels,
                });
              }}
              placeholder="Correct Name of Labeled Part"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all focus:ring-2 focus:ring-yellow-500 text-sm"
            />

            {newQuestion.labelAnswers &&
              newQuestion.labelAnswers.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const newLabels = newQuestion.labelAnswers!.filter(
                      (_: any, i: number) => i !== index
                    );
                    onNewQuestionChange({
                      ...newQuestion,
                      labelAnswers: newLabels,
                    });
                  }}
                  className="p-1.5 rounded-full text-red-500 hover:bg-red-100 transition-colors flex-shrink-0 border border-gray-200 rounded-lg hover:border-gray-300"
                  title="Remove label"
                >
                  <FaTimes size={14} />
                </button>
              )}
          </div>
        )
      )}

      <button
        onClick={() => {
          const newLabel = String.fromCharCode(
            65 + (newQuestion.labelAnswers?.length || 0)
          );
          onNewQuestionChange({
            ...newQuestion,
            labelAnswers: [
              ...(newQuestion.labelAnswers || []),
              { label: newLabel, answer: "" },
            ],
          });
        }}
        className="text-yellow-600 hover:text-yellow-700 flex items-center gap-1 text-sm font-medium mt-2 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all px-3 py-1"
      >
        <FaPlus size={12} /> Add Label Key
      </button>
    </div>
  );
};

const NewTextAnswer = ({ newQuestion, onNewQuestionChange }: any) => (
  <div className="space-y-2 border-l-4 border-gray-100 pl-4 py-2">
    <label className="block text-sm font-medium text-gray-700">
      Correct Answer
    </label>
    <input
      type={newQuestion.type === "number" ? "number" : "text"}
      value={newQuestion.correctAnswer || ""}
      onChange={(e) =>
        onNewQuestionChange({
          ...newQuestion,
          correctAnswer: e.target.value,
          correctAnswers: [e.target.value],
        })
      }
      placeholder="Enter the correct answer"
      className="w-full px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all focus:ring-2 focus:ring-[#034153] text-sm"
    />
    <p className="text-xs text-gray-500 mt-1">
      Note: For text answers, only an exact match will be graded as correct.
    </p>
  </div>
);

export default QuizEditor;
