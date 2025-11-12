// src/components/QuizEditor.tsx
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import QuestionList from "./QuizEditorComponents/QuestionList";
import { FaCheckCircle, FaCheckSquare, FaEdit, FaQuestionCircle, FaTimes, FaCheck, FaPlus, FaRegCircle, FaRegSquare, FaArrowUp, FaArrowDown, FaTrashAlt, FaListUl } from "react-icons/fa";
import { QUESTION_TYPES, getQuestionType } from "./questionTypes";
import {
  X,
  List as ListIcon,
  CheckSquare,
  ToggleLeft,
  Menu,
} from "lucide-react";
import {
  useUpdateQuizMutation,
  useGetQuizDataByQuizIdQuery,
  QuizIdentifiers,
  QuizSettings,
} from "../state/api/quizApi";
import { QuestionProp } from "../state/api/courseApi";
import { FaTag } from "react-icons/fa6";
interface Question extends QuestionProp {
  imageFile?: File;
}
interface QuizProps extends QuizIdentifiers  {
}
interface QuizEditorProps {
  resource: QuizProps;
  onClose: () => void;
}

const INITIAL_NEW_QUESTION: Partial<Question> = {
  type: "multiple",
  question: "",
  options: ["", ""],
  correctAnswers: [],
  required: false,
  points: 1,
  imageUrl: "",
  labelAnswers:[],
};

const getQuestionIcon = (type: string) => {
  switch (type) {
    case 'multiple':
      return FaCheckSquare;
    case 'single':
      return FaRegCircle;
    case 'truefalse':
      return FaCheckCircle;
    case 'shortanswer':
      return FaEdit;
    case 'labeling':
      return FaTag;
    case 'matching':
      return FaListUl;
    default:
      return FaQuestionCircle;
  }
};

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
    formId: resource.quizId!,
  });

  const [updateQuiz, { isLoading: isUpdating }] = useUpdateQuizMutation();

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
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (quizData) {
      setQuestions(
        quizData.questions?.map((q: any, index: number) => ({
          id: q.id,
          type: q.type,
          question: q.question,
          description: q.description,
          options:q.options,
          correctAnswers: q.correctAnswers,
          correctAnswer: q.correctAnswer,
          required: q.required,
          points: q.points,
          labelAnswers: q.labelAnswers,
          quizId: q.quizId,
        })) || []
      );

      setQuizSettings(
        (quizData.settings as QuizSettings) || {
          title: quizData.name ,
          description: quizData.description,
          showResults: quizData.settings?.showResults,
          allowRetakes: quizData.settings?.allowRetakes,
          passingScore: quizData.settings?.passingScore,
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
              correctAnswers:
                q.correctAnswers?.includes(optionIndex) 
                  ? q.correctAnswers.filter(i => i !== optionIndex) 
                  : [...(q.correctAnswers || []), optionIndex],
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
    // Basic validation
    if (!newQuestion.question?.trim()) {
      toast.error("Please enter a question");
      return;
    }

    // Check for at least one correct answer for question types that require it
    if (newQuestion.type === 'multiple' || newQuestion.type === 'checkbox' || newQuestion.type === 'truefalse') {
      const hasCorrectAnswer = Array.isArray(newQuestion.correctAnswers) && newQuestion.correctAnswers.length > 0;
      if (!hasCorrectAnswer) {
        toast.error("Please select at least one correct answer");
        return;
      }
    }

    // For labeling questions, ensure there's at least one label-answer pair
    if (newQuestion.type === 'labeling' && (!newQuestion.labelAnswers || newQuestion.labelAnswers.length === 0)) {
      toast.error("Please add at least one label-answer pair");
      return;
    }

    // For other question types with options, ensure there's at least one option
    if (newQuestion.type !== 'labeling' && (!newQuestion.options || newQuestion.options.filter((opt: string) => opt.trim()).length === 0)) {
      toast.error("Please add at least one answer option");
      return;
    }

    const question: Question = {
      id: -Math.abs(Date.now()),
      type: newQuestion.type!,
      question: newQuestion.question.trim(),
      required: newQuestion.required !== undefined ? newQuestion.required : true,
      points: newQuestion.points || 1,
      quizId: resource.quizId!,
      order: questions.length,
    };

    // Handle different question types
    if (newQuestion.type === 'labeling') {
      // Store full label-answer objects
      question.labelAnswers = [...(newQuestion.labelAnswers || [])];
      
      // Store labels as options for consistent API format
      question.options = (newQuestion.labelAnswers || []).map(la => la.label);
      
      // Store correctAnswers in appropriate format
      // First convert to JSON-friendly format and then parse back
      // This ensures compatibility with backend storage
      const labelAnswersStr = JSON.stringify((newQuestion.labelAnswers || []).map(la => ({
        label: la.label,
        answer: la.answer
      })));
      question.correctAnswers = JSON.parse(labelAnswersStr);
      
      // Handle image
      question.imageFile = newQuestion.imageFile;
    } else {
      question.options = newQuestion.options?.filter((opt: string) => opt.trim());
      question.correctAnswers = newQuestion.correctAnswers || [];
    }

    setQuestions((prev) => [...prev, question]);
    setNewQuestion(INITIAL_NEW_QUESTION);
    setHasChanges(true);
    toast.info("Question added!");
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
          correctAnswers: prev.correctAnswers?.[0] === optionIndex ? [] : [optionIndex],
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
      // Swap the questions
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      
      // Update the order property for all questions
      return updated.map((q, i) => ({
        ...q,
        order: i
      }));
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
    setIsSaving(true);

    try {
      const quizTitle = quizSettings.title || quizData.name;
      
      // First, handle any file uploads and prepare questions data
      const updatedQuestions = await Promise.all(questions.map(async (q, index) => {
        // Process options to ensure they're strings and remove empty ones
        const options = (q.options || [])
          .map(opt => (typeof opt === 'string' ? opt.trim() : String(opt)))
          .filter(opt => opt);
        
        // Process correctAnswers based on question type
        let correctAnswers = [...(q.correctAnswers || [])];
        
        // For multiple/checkbox questions, ensure correctAnswers are numbers (indices)
        if (q.type === 'multiple' || q.type === 'checkbox') {
          correctAnswers = correctAnswers
            .map(ca => (typeof ca === 'string' ? parseInt(ca, 10) : ca))
            .filter(ca => !isNaN(ca as number) && (ca as number) < options.length);
        }
        
        // For labeling questions, ensure labelAnswers is properly formatted
        const labelAnswers = q.type === 'labeling' 
          ? (q.labelAnswers || []).filter(la => la?.label && la?.answer)
          : undefined;

        const questionData: any = {
          id: q.id,
          type: q.type,
          question: q.question.trim(),
          description: q.description?.trim() || '',
          required: q.required !== undefined ? q.required : true,
          points: q.points || 1,
          order: q.order !== undefined ? q.order : index,
          options,
          correctAnswers,
          labelAnswers,
        };

        // Include imageFile for FormData processing if it exists
        if (q.imageFile) {
          questionData.imageFile = q.imageFile;
        }

        return questionData;
      }));

      const updateData = {
        courseId: resource.courseId,
        lessonId: resource.lessonId,
        quizId: resource.quizId,
        formId: resource.formId,
        name: quizTitle.trim(),
        description: quizSettings.description?.trim() || '',
        questions: updatedQuestions.map(question => ({
          ...question,
          quizId: resource.quizId
        })),
        settings: quizSettings
      };

      console.log('Sending update data:', updateData);

      // Call the updateQuiz mutation
      const { message } = await updateQuiz({
        id: quizData.id,
        data: updateData,
      }).unwrap();

      toast.success(message || 'Quiz updated successfully');
      setHasChanges(false);
      await refetch();
    } catch (error: any) {
      console.error("Error saving quiz:", error);
      toast.error(error?.data?.message || error?.message || "Failed to save quiz");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNewQuestionChange = (updates: Partial<Question>) => {
    setNewQuestion((prev) => ({ ...prev, ...updates }));
  };

  const isOptionCorrect = (question: any, optionIndex: number) => {
    if (!question.correctAnswers) return false;
    return question.correctAnswers.includes(optionIndex);
  };

  const isNewOptionCorrect = (optionIndex: number) => {
    if (!newQuestion.correctAnswers) return false;
    return newQuestion.correctAnswers.includes(optionIndex);
  };

  useEffect(() => {
     if (newQuestion.type === "labeling") {
      setNewQuestion((prev) => ({
        ...prev,
        options: undefined,
        correctAnswers: [],
        correctAnswer: undefined,
        labelAnswers: prev.labelAnswers || [{ label: "A", answer: "" }],
      }));
    } else if (!newQuestion.options || newQuestion.options.length < 2) {
      setNewQuestion((prev) => ({
        ...prev,
        options: ["", ""],
        correctAnswers: [],
        correctAnswer: undefined,
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
          quizId={resource.quizId!}
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

    // Update the UI immediately with the file
    onUpdate({ 
      ...question, 
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

      {question.imageFile && (
        <div className="mt-2 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all p-2 bg-gray-50">
          <img
            src={URL.createObjectURL(question.imageFile)}
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



export default QuizEditor;