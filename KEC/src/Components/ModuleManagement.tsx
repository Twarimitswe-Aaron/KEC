import React, { useEffect, useRef, useState } from "react";
import QuizEditor from "./Quiz";
import {
  FaPlus,
  FaLock,
  FaUnlock,
  FaFile,
  FaTrash,
  FaEllipsisV,
  FaQuestionCircle,
  FaPlay,
  FaFilePdf,
  FaFileWord,
  FaExternalLinkAlt,
  FaCheck,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaLink,
} from "react-icons/fa";

// Resource Type
type ResourceType = {
  id?: number;
  name?: string;
  type?: "pdf" | "video" | "quiz" | "word";
  size?: string;
  uploadedAt: string;
  duration?: string;
  url?: string; // file URL or video link
  quiz?: Question[]; // quiz resource content
};

// Module Type
type ModuleType = {
  id: number;
  title: string;
  description: string;
  isUnlocked: boolean;
  order: number;
  createdAt: string;
  resources: ResourceType[];
};


type Question = {
  id: number;
  type: "multiple" | "checkbox" | "truefalse" | "short";
  question: string;
  options?: string[];
  required?: boolean;
};


type QuizResponse = {
  questionId: number;
  answer: string | string[];
};

// Mock data for modules
const MOCK_MODULES: ModuleType[] = [
  {
    id: 1,
    title: "Introduction to React",
    description: "Learn the basics of React development",
    isUnlocked: true,
    order: 1,
    createdAt: "2024-01-15T10:00:00Z",
    resources: []
  },
  {
    id: 2,
    title: "Advanced JavaScript",
    description: "Deep dive into modern JavaScript concepts",
    isUnlocked: false,
    order: 2,
    createdAt: "2024-01-20T14:30:00Z",
    resources: []
  }
];

function ModuleManagement() {
  const [showAddModule, setShowAddModule] = useState(false);
  const [showAddResource, setShowAddResource] = useState<number | null>(null);
  const [resourceType, setResourceType] = useState<"pdf" | "video" | "word" | "quiz" | null>(null);
  const [videoLink, setVideoLink] = useState("");
  const [quizName, setQuizName] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [modules, setModules] = useState<ModuleType[]>(MOCK_MODULES);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [openQuiz, setOpenQuiz] = useState<number | null>(null);
  const [quizResponses, setQuizResponses] = useState<Record<number, QuizResponse[]>>({});

  // Track wrapper refs for menus
  const menuWrapperRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle outside clicks to close menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuOpenId === null) return;
      const wrapper = menuWrapperRefs.current[menuOpenId];
      if (wrapper && !wrapper.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpenId(null);
        setOpenQuiz(null);
        setResourceType(null);
        setVideoLink("");
        setQuizName("");
        setQuizDescription("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpenId]);

  // Sort modules by creation date
  const sortedModules = [...modules].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Toggle lock/unlock
  const toggleModuleUnlock = (moduleId: number) => {
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId ? { ...m, isUnlocked: !m.isUnlocked } : m
      )
    );
    setMenuOpenId(null);
  };

  // Delete module
  const deleteModule = (moduleId: number) => {
    if (window.confirm("Are you sure you want to delete this module?")) {
      setModules((prev) => prev.filter((m) => m.id !== moduleId));
      setMenuOpenId(null);
      if (showAddResource === moduleId) setShowAddResource(null);
    }
  };

  // File upload (pdf/word)
  const handleFileUpload = (
    moduleId: number,
    file: File,
    type: "pdf" | "word"
  ) => {
    const fileUrl = URL.createObjectURL(file);
    
    const resource: ResourceType = {
      id: Date.now(),
      name: file.name,
      type,
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      uploadedAt: new Date().toISOString().split("T")[0],
      url: fileUrl,
    };

    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId ? { ...m, resources: [...m.resources, resource] } : m
      )
    );
    setResourceType(null);
    setShowAddResource(null);
  };

  // Handle video link submission
  const handleVideoLinkSubmit = (moduleId: number) => {
    if (!videoLink.trim()) {
      alert("Please enter a valid video URL");
      return;
    }

    // Simple URL validation
    try {
      new URL(videoLink);
    } catch (e) {
      alert("Please enter a valid URL");
      return;
    }

    const resource: ResourceType = {
      id: Date.now(),
      name: "Video Resource",
      type: "video",
      size: "N/A",
      uploadedAt: new Date().toISOString().split("T")[0],
      url: videoLink,
      duration: "N/A",
    };

    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId ? { ...m, resources: [...m.resources, resource] } : m
      )
    );
    setVideoLink("");
    setResourceType(null);
    setShowAddResource(null);
  };

  // Add Quiz Resource
  const addQuizResource = (moduleId: number, name: string, description: string = "") => {
    const sampleQuiz: Question[] = [
      {
        id: 1,
        type: "multiple",
        question: "What is the primary purpose of React in web development?",
        options: [
          "Database management",
          "Building user interfaces",
          "Server-side rendering only",
          "Styling components"
        ],
        required: true,
      },
      {
        id: 2,
        type: "checkbox",
        question: "Which of the following are JavaScript frameworks or libraries? (Select all that apply)",
        options: ["React", "Angular", "Python", "Vue.js", "Django", "jQuery"],
        required: true,
      },
      {
        id: 3,
        type: "short",
        question: "Explain the concept of 'state' in React applications.",
        required: false,
      },
      {
        id: 4,
        type: "multiple",
        question: "What does JSX stand for?",
        options: [
          "JavaScript XML",
          "JavaScript Extension",
          "Java Syntax Extension",
          "JavaScript Execute"
        ],
        required: true,
      },
    ];

    const resource: ResourceType = {
      id: Date.now(),
      name: name || "React Fundamentals Quiz",
      type: "quiz",
      uploadedAt: new Date().toISOString().split("T")[0],
      quiz: sampleQuiz,
    };

    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId ? { ...m, resources: [...m.resources, resource] } : m
      )
    );
    setResourceType(null);
    setShowAddResource(null);
    setQuizName("");
    setQuizDescription("");
  };

  // Remove resource
  const removeResource = (moduleId: number, resourceId: number) => {
    if (window.confirm("Remove this resource?")) {
      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleId
            ? { ...m, resources: m.resources.filter((r) => r.id !== resourceId) }
            : m
        )
      );
    }
  };

  // Handle quiz responses
  const handleQuizResponse = (resourceId: number, questionId: number, answer: string | string[]) => {
    setQuizResponses(prev => ({
      ...prev,
      [resourceId]: [
        ...(prev[resourceId] || []).filter(r => r.questionId !== questionId),
        { questionId, answer }
      ]
    }));
  };

  // Submit quiz
  const submitQuiz = (resourceId: number, quiz: Question[]) => {
    const responses = quizResponses[resourceId] || [];
    const requiredQuestions = quiz.filter(q => q.required);
    const answeredRequired = requiredQuestions.filter(q => 
      responses.some(r => r.questionId === q.id && (
        (typeof r.answer === 'string' && r.answer.trim()) ||
        (Array.isArray(r.answer) && r.answer.length > 0)
      ))
    );

    if (answeredRequired.length < requiredQuestions.length) {
      alert("Please answer all required questions before submitting.");
      return;
    }

    alert("Quiz submitted successfully! \n\nYour responses have been recorded.");
    setOpenQuiz(null);
  };

  // Get resource icon
  const getResourceIcon = (type: string) => {
    switch (type) {
      case "pdf": return <FaFilePdf className="text-red-500" />;
      case "video": return <FaPlay className="text-purple-500" />;
      case "word": return <FaFileWord className="text-blue-500" />;
      case "quiz": return <FaQuestionCircle className="text-green-500" />;
      default: return <FaFile />;
    }
  };

  // Render quiz interface
  const renderQuiz = (resource: ResourceType) => {
    if (!resource.quiz || openQuiz !== resource.id) return null;
    const updateQuiz = (resourceId: number, newQuiz: Question[]) => {
      setModules(prev => prev.map(m => ({
        ...m,
        resources: m.resources.map(r => r.id === resourceId ? { ...r, quiz: newQuiz } : r)
      })));
    };
    return <QuizEditor resource={resource} setOpenQuiz={setOpenQuiz} updateQuiz={updateQuiz} />;
  };

  // Handle file selection
  const handleFileSelect = (moduleId: number, type: "pdf" | "word") => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === "pdf" ? ".pdf" : ".doc,.docx";
      fileInputRef.current.onchange = (e) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files[0]) {
          handleFileUpload(moduleId, target.files[0], type);
        }
      };
      fileInputRef.current.click();
    }
  };

  return (
    <div>
      {/* Hidden file input for document uploads */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
      />
      
      <div className="space-y-8">
        {sortedModules.map((module) => (
          <div
            key={module.id}
            className={`group bg-white rounded-xl shadow-lg transition-all hover:shadow-xl`}
          >
            {/* Header */}
            <div className="p-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {module.order}. {module.title}
                </h2>
                <p className="text-gray-600">{module.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  module.isUnlocked 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {module.isUnlocked ? 'Unlocked' : 'Locked'}
                </span>
                <div
                  className="relative"
                  ref={(el) => {
                    menuWrapperRefs.current[module.id] = el;
                  }}
                >
                  <button
                    onClick={() =>
                      setMenuOpenId(menuOpenId === module.id ? null : module.id)
                    }
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <FaEllipsisV className="text-gray-600" />
                  </button>
                  {menuOpenId === module.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
                      <ul className="py-2 text-sm text-gray-700">
                        <li>
                          <button
                            onClick={() => toggleModuleUnlock(module.id)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                          >
                            {module.isUnlocked ? <FaLock /> : <FaUnlock />}
                            {module.isUnlocked ? "Lock Module" : "Unlock Module"}
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => {
                              setShowAddResource(
                                showAddResource === module.id ? null : module.id
                              );
                              setResourceType(null);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                          >
                            <FaPlus /> Add Resource
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => deleteModule(module.id)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-red-600"
                          >
                            <FaTrash /> Delete Module
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Add Resource */}
            {showAddResource === module.id && (
              <div className="px-6 pb-6 mx-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-b-xl">
                <div className="pt-4 ">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                     
                      Add New Resource
                    </h3>
                    {resourceType !== null && resourceType !== "quiz" && (
                      <button
                        onClick={() => setResourceType(null)}
                        className="text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1 text-sm"
                      >
                        <FaChevronUp className="text-xs" />
                        Back to options
                      </button>
                    )}
                  </div>
                  
                  {resourceType === null ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <button
                        onClick={() => setResourceType("pdf")}
                        className="flex flex-col items-center justify-center p-5 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
                      >
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3 group-hover:bg-red-200 transition-colors">
                          <FaFilePdf className="text-2xl text-red-600" />
                        </div>
                        <span className="font-medium text-gray-800">PDF Document</span>
                        <span className="text-xs text-gray-500 mt-1">Upload PDF file</span>
                      </button>
                      
                      <button
                        onClick={() => setResourceType("video")}
                        className="flex flex-col items-center justify-center p-5 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
                      >
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
                          <FaPlay className="text-xl text-purple-600" />
                        </div>
                        <span className="font-medium text-gray-800">Video</span>
                        <span className="text-xs text-gray-500 mt-1">Add video link</span>
                      </button>
                      
                      <button
                        onClick={() => setResourceType("word")}
                        className="flex flex-col items-center justify-center p-5 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
                      >
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                          <FaFileWord className="text-2xl text-blue-800 cursor-pointer" />
                        </div>
                        <span className="font-medium text-gray-800">Word Document</span>
                        <span className="text-xs text-gray-500 mt-1">Upload Word file</span>
                      </button>
                      
                      <button
                        onClick={() => setResourceType("quiz")}
                        className="flex flex-col items-center justify-center p-5 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200 group"
                      >
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3 group-hover:bg-green-200 transition-colors">
                          <FaQuestionCircle className="text-xl text-green-600" />
                        </div>
                        <span className="font-medium text-gray-800">Quiz</span>
                        <span className="text-xs text-gray-500 mt-1">Create assessment</span>
                      </button>
                    </div>
                  ) : resourceType === "video" ? (
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <FaLink className="text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">Add Video Link</h4>
                          <p className="text-sm text-gray-600">Paste the URL of your video resource</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                          <input
                            type="url"
                            value={videoLink}
                            onChange={(e) => setVideoLink(e.target.value)}
                            placeholder="https://example.com/video.mp4"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleVideoLinkSubmit(module.id)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
                          >
                            <FaCheck className="text-sm" />
                            Add Video
                          </button>
                          <button
                            onClick={() => {
                              setResourceType(null);
                              setVideoLink("");
                            }}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg transition-colors flex items-center gap-2"
                          >
                            <FaTimes />
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (resourceType === "pdf" || resourceType === "word") ? (
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-full ${resourceType === "pdf" ? "bg-red-100" : "bg-blue-100"} flex items-center justify-center`}>
                          {resourceType === "pdf" ? (
                            <FaFilePdf className="text-red-600 text-xl" />
                          ) : (
                            <FaFileWord className="text-blue-800 cursor-pointer text-xl" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">
                            Upload {resourceType === "pdf" ? "PDF" : "Word"} Document
                          </h4>
                          <p className="text-sm text-gray-600">
                            Select a file from your device
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 items-center">
                        <button
                          onClick={() => handleFileSelect(module.id, resourceType)}
                          className="bg-blue-800 cursor-pointer hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <FaFile className="text-sm" />
                          Choose File
                        </button>
                        <button
                          onClick={() => setResourceType(null)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <FaTimes />
                          Cancel
                        </button>
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-3">
                        {resourceType === "pdf" 
                          ? "Supported format: .pdf (Max size: 10MB)" 
                          : "Supported formats: .doc, .docx (Max size: 10MB)"}
                      </p>
                    </div>
                  ) : resourceType === "quiz" ? (
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <FaQuestionCircle className="text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">Create New Quiz</h4>
                          <p className="text-sm text-gray-600">Set up your quiz with questions and answers</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quiz Name
                          </label>
                          <input
                            type="text"
                            value={quizName}
                            onChange={(e) => setQuizName(e.target.value)}
                            placeholder="Enter quiz name"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quiz Description (Optional)
                          </label>
                          <textarea
                            value={quizDescription}
                            onChange={(e) => setQuizDescription(e.target.value)}
                            placeholder="Describe what this quiz covers"
                            rows={2}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          />
                        </div>
                        
                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={() => {
                              if (!quizName.trim()) {
                                alert("Please enter a quiz name");
                                return;
                              }
                              addQuizResource(module.id, quizName, quizDescription);
                            }}
                            className="bg-green-600 cursor-pointer hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                          >
                            <FaCheck className="text-sm" />
                            Create Quiz
                          </button>
                          <button
                            onClick={() => {
                              setResourceType(null);
                              setQuizName("");
                              setQuizDescription("");
                            }}
                            className="bg-gray-100 cursor-pointer hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                          >
                            <FaTimes />
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {/* Resources */}
            {module.resources.length > 0 && (
              <div className="px-6 pb-6 mt-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaFile className="text-gray-600" />
                  Resources ({module.resources.length})
                </h3>
                <div className="space-y-3">
                  {module.resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-xl">
                          {getResourceIcon(resource.type!)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{resource.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Uploaded: {resource.uploadedAt}</span>
                            {resource.size && <span>Size: {resource.size}</span>}
                            {resource.duration && <span>Duration: {resource.duration}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {resource.type === "quiz" ? (
                          <button
                            onClick={() => setOpenQuiz(resource.id!)}
                            className="bg-green-700 cursor-pointer hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                          >
                            <FaQuestionCircle /> Take Quiz
                          </button>
                        ) : (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-800 hover:bg-blue-800 cursor-pointer text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                          >
                            {resource.type === "video" ? <FaPlay /> : <FaExternalLinkAlt />}
                            {resource.type === "video" ? "Watch" : "Open"}
                          </a>
                        )}
                        <button
                          onClick={() => removeResource(module.id, resource.id as number)}
                          className="text-red-500 cursor-pointer hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Render Quiz Modal */}
            {module.resources.map(resource => 
              resource.type === "quiz" ? renderQuiz(resource) : null
            )}
          </div>
        ))}
      </div>

      {modules.length === 0 && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <FaFile className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No modules yet</h3>
            <p className="text-gray-600 mb-6">Create your first module to start organizing your course content.</p>
            <button
              onClick={() => setShowAddModule(true)}
              className="bg-blue-800 cursor-pointer hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 mx-auto"
            >
              <FaPlus /> Create First Module
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ModuleManagement;