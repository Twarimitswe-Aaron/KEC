import { FaCheckCircle, FaEdit, FaQuestionCircle, FaTimes } from "react-icons/fa";
import { FaCheck, FaList, FaPlus, FaRegCircle, FaRegSquare, FaTrash, FaArrowUp, FaArrowDown } from "react-icons/fa6";
import { toast } from "react-toastify";
import { Question, ResourceType } from "./ModuleManagement";
import { useState, useRef } from "react";
import { X, Eye, Hash, Type, List as ListIcon, CheckSquare, ToggleLeft, Menu } from "lucide-react";

interface QuizEditorProps {
  resource: ResourceType;
  onClose: () => void;
  onUpdate: (resourceId: number, updatedQuiz: any) => void;
}

const QuizEditor = ({ resource, onClose, onUpdate }: QuizEditorProps) => {
  // Handle both array format (old) and object format (new) for quiz data
  const initialQuestions = Array.isArray(resource.quiz) 
    ? resource.quiz 
    : (resource.quiz?.questions || []);
  
  const initialSettings = resource.quiz?.settings || {
    title: resource.name,
    description: resource.description || "",
    shuffleQuestions: false,
    timeLimit: 0,
    showResults: true,
    allowRetakes: false,
    passingScore: 0,
  };

  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const [quizSettings, setQuizSettings] = useState(initialSettings);
  const [showSidebar, setShowSidebar] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
    required: false,
    points: 1
  });

  // Add new question
  const addQuestion = () => {
    if (!newQuestion.question?.trim()) {
      toast.error("Please enter a question");
      return;
    }

    const question: Question = {
      id: Date.now(),
      type: newQuestion.type as any,
      question: newQuestion.question,
      description: newQuestion.description,
      options: newQuestion.type !== "short" && newQuestion.type !== "long" && newQuestion.type !== "number" 
        ? newQuestion.options?.filter(opt => opt.trim()) 
        : undefined,
      required: newQuestion.required,
      points: newQuestion.points || 1
    };

    const updatedQuestions = [...questions, question];
    setQuestions(updatedQuestions);
    onUpdate(resource.id, { ...resource.quiz, questions: updatedQuestions, settings: quizSettings });
    
    setNewQuestion({
      type: "multiple",
      question: "",
      description: "",
      options: [""],
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
    onUpdate(resource.id, { ...resource.quiz, questions: updatedQuestions, settings: quizSettings });
  };

  // Delete question
  const deleteQuestion = (questionId: number) => {
    const updatedQuestions = questions.filter(q => q.id !== questionId);
    setQuestions(updatedQuestions);
    onUpdate(resource.id, { ...resource.quiz, questions: updatedQuestions, settings: quizSettings });
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
    onUpdate(resource.id, { ...resource.quiz, questions: updatedQuestions, settings: quizSettings });
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
      updateQuestion(questionId, { options: updatedOptions });
    }
  };

  // Handle settings update
  const updateSettings = (updates: Partial<typeof quizSettings>) => {
    const newSettings = { ...quizSettings, ...updates };
    setQuizSettings(newSettings);
    onUpdate(resource.id, { ...resource.quiz, questions, settings: newSettings });
  };

  const getQuestionIcon = (type: string) => {
    const questionType = questionTypes.find(t => t.value === type);
    return questionType?.icon || FaQuestionCircle;
  };

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
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden text-white/90 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-200"
            >
              <Menu size={20} />
            </button>
            <button
              onClick={() => onUpdate(resource.id, { ...resource.quiz, questions, settings: quizSettings })}
              className="bg-white text-[#034153] px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
            >
              <FaCheck className="text-sm sm:text-base" /> <span className="hidden sm:inline">Save Quiz</span><span className="sm:hidden">Save</span>
            </button>
            <button
              onClick={onClose}
              className="text-white/90 hover:text-white hover:bg-white/10 p-1.5 sm:p-2 rounded-lg transition-all duration-200"
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
                          options: type.value === "short" || type.value === "long" || type.value === "number" ? undefined : [""]
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
                        value={newQuestion.points}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                    <textarea
                      value={newQuestion.question}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                      placeholder="Enter your question here..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#034153] focus:border-transparent resize-none text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                    <textarea
                      value={newQuestion.description}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Add additional context or instructions..."
                      rows={1}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#034153] focus:border-transparent resize-none text-sm sm:text-base"
                    />
                  </div>

                  {newQuestion.type !== "short" && newQuestion.type !== "long" && newQuestion.type !== "number" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                      <div className="space-y-2">
                        {newQuestion.options?.map((option, index) => (
                          <div key={index} className="flex gap-2 items-center">
                            {newQuestion.type === "multiple" && <FaRegCircle className="text-gray-400 mt-1 flex-shrink-0" />}
                            {newQuestion.type === "checkbox" && <FaRegSquare className="text-gray-400 mt-1 flex-shrink-0" />}
                            {newQuestion.type === "truefalse" && <FaCheckCircle className="text-gray-400 mt-1 flex-shrink-0" />}
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...(newQuestion.options || [])];
                                newOptions[index] = e.target.value;
                                setNewQuestion(prev => ({ ...prev, options: newOptions }));
                              }}
                              placeholder={`Option ${index + 1}`}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#034153] focus:border-transparent text-sm sm:text-base"
                            />
                            {newQuestion.options && newQuestion.options.length > 1 && (
                              <button
                                onClick={() => {
                                  const newOptions = newQuestion.options?.filter((_, i) => i !== index) || [""];
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

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newQuestion.required}
                        onChange={(e) => setNewQuestion(prev => ({ ...prev, required: e.target.checked }))}
                        className="w-4 h-4 text-[#034153] border-gray-300 rounded focus:ring-[#034153]"
                      />
                      <span className="text-sm font-medium text-gray-700">Required question</span>
                    </label>

                    <button
                      onClick={addQuestion}
                      className="w-full sm:w-auto bg-[#034153] hover:bg-[#004e64] text-white px-4 sm:px-6 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
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
                                      options: e.target.value === "short" || e.target.value === "long" || e.target.value === "number" ? undefined : question.options || [""]
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
                                  <label className="block text-sm font-medium text-gray-700">Options</label>
                                  {question.options.map((option, optIndex) => (
                                    <div key={optIndex} className="flex gap-2 items-center">
                                      <QuestionIcon className="text-gray-400 mt-1 flex-shrink-0" />
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
                                    <div key={optIndex} className="flex items-center gap-2 sm:gap-3 text-gray-700 p-2 hover:bg-gray-50 rounded-lg text-sm sm:text-base">
                                      {question.type === "multiple" && <FaRegCircle className="text-gray-400 flex-shrink-0 text-xs sm:text-sm" />}
                                      {question.type === "checkbox" && <FaRegSquare className="text-gray-400 flex-shrink-0 text-xs sm:text-sm" />}
                                      {question.type === "truefalse" && <FaCheckCircle className="text-gray-400 flex-shrink-0 text-xs sm:text-sm" />}
                                      <span className="break-words">{option}</span>
                                    </div>
                                  ))}
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