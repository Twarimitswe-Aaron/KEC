import React, { useEffect, useRef, useState } from "react";

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
  FaChevronUp,
  FaLink,
  FaSave,
  FaEye,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { 
  useDeleteLessonMutation, 
  useToggleLessonLockMutation,
  useAddResourceMutation,
  useDeleteResourceMutation
} from "../state/api/lessonApi";
import { Trash2 } from "lucide-react";

// Types
interface ResourceType {
  id: number;
  uploadedAt: string;
  name: string;
  type: "pdf" | "word" | "video" | "quiz";
  url: string;
  size?: string;
  duration?: string;
  quiz?: any;
}

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

type IncomingResource = {
  id: number;
  url: string;
  title?: string;
  type?: string;
  size?: string;
  duration?: string;
  uploadedAt?: string;
};

interface Lesson {
  id: number;
  title: string;
  content: string;
  description?: string;
  courseId?: number;
  resources?: IncomingResource[];
  createdAt?: string;
  updatedAt?: string;
  isUnlocked?: boolean;
  order?: number;
}

interface ModuleManagementProps {
  lessons: Lesson[];
  courseId: number;
}



interface ConfirmDeleteModalProps {
  visible: boolean;
  title: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteModal = ({
  visible,
  title,
  description = "This action cannot be undone.",
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
          <Trash2 className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold mb-3 text-center text-gray-900">{title}</h2>
        <p className="text-gray-600 mb-6 text-center">{description}</p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3.5 cursor-pointer rounded-xl hover:shadow-lg transition-all font-bold"
          >
            Delete
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-white border-2 border-gray-200 text-gray-700 px-4 py-3.5 cursor-pointer rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-bold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};


// Constants
const SAMPLE_QUIZ: Question[] = [
  {
    id: 1,
    type: "multiple",
    question: "What is the primary purpose of React in web development?",
    options: [
      "Database management",
      "Building user interfaces",
      "Server-side rendering only",
      "Styling components",
    ],
    required: true,
  },
];

const getResourceIcon = (type: string) => {
  const icons = {
    pdf: <FaFilePdf className="text-red-500" />,
    video: <FaPlay className="text-purple-500" />,
    word: <FaFileWord className="text-blue-500" />,
    quiz: <FaQuestionCircle className="text-green-500" />,
  };
  return icons[type as keyof typeof icons] || <FaFile />;
};

// Convert Lesson to ModuleType
const lessonToModule = (lesson: Lesson): ModuleType => ({
  id: lesson.id,
  title: lesson.title,
  description: lesson.description || lesson.content || "",
  isUnlocked: lesson.isUnlocked ?? true,
  order: lesson.order || lesson.id,
  createdAt: lesson.createdAt || new Date().toISOString(),
  resources:
    lesson.resources?.map((resource) => ({
      id: resource.id,
      name: resource.title || "Untitled Resource",
      type: (resource.type as "pdf" | "video" | "quiz" | "word") || "pdf",
      url: resource.url,
      uploadedAt: resource.uploadedAt || new Date().toISOString().split("T")[0],
      size: resource.size,
      duration: resource.duration,
    })) || [],
});

// Main Component
function ModuleManagement({ lessons, courseId }: ModuleManagementProps) {
  // State
  const [showAddResource, setShowAddResource] = useState<number | null>(null);
  const [resourceType, setResourceType] = useState<"pdf" | "video" | "word" | "quiz" | null>(null);
  const [videoLink, setVideoLink] = useState("");
  const [videoName, setVideoName] = useState("");
  const [quizName, setQuizName] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [modules, setModules] = useState<ModuleType[]>([]);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [openQuiz, setOpenQuiz] = useState<number | null>(null);
  const [quizResponses, setQuizResponses] = useState<Record<number, QuizResponse[]>>({});
  const [deleteLesson] = useDeleteLessonMutation();
  const [toggleLessonLock] = useToggleLessonLockMutation();
  const [addResource] = useAddResourceMutation();
  const [deleteResource] = useDeleteResourceMutation();
  const [openMenu, setOpenMenu] = useState<number | null>(null);
const [modals, setModals] = useState({
  showDeleteConfirm: false,
  showResourceDeleteConfirm: false,
});

const [lessonToDelete, setLessonToDelete] = useState<number | null>(null);
const [resourceToDelete, setResourceToDelete] = useState<{ lessonId: number; resourceId: number } | null>(null);



  // Refs
  const menuWrapperRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert lessons to modules when lessons prop changes
  useEffect(() => {
    if (Array.isArray(lessons)) {
      const convertedModules = lessons.map(lessonToModule);
      setModules(convertedModules);
    }
  }, [lessons]);

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
        setVideoName("");
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



  const handleVideoLinkSubmit = async (moduleId: number) => {
    console.log(moduleId,"module stuffs")
    if (!videoLink.trim()) {
      toast.error("Please enter a valid video URL");
      return;
    }
    if (!videoName.trim()) {
      toast.error("Please enter a video title");
      return;
    }
    try {
      new URL(videoLink);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    try {
      const response = await addResource({
        lessonId: moduleId,
        title: videoName,
        type: "video",
        description: "",
        url: videoLink // Removed to match mutation type
      }).unwrap();

      setModules(prev => prev.map(m => 
        m.id === moduleId 
          ? { 
              ...m, 
              resources: [...m.resources, {
                id: response.data?.id || Date.now(),
                name: videoName,
                type: "video",
                url: videoLink,
                uploadedAt: new Date().toISOString().split("T")[0],
                duration: "N/A"
              }]
            } 
          : m
      ));

      setVideoLink("");
      setVideoName("");
      setResourceType(null);
      setShowAddResource(null);
      toast.success("Video resource added successfully!");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to add video resource");
    }
  };

    // Resource Management Functions
  const handleFileUpload = async (moduleId: number, file: File, type: "pdf" | "word") => {
    try {
      const response = await addResource({
        lessonId: moduleId,
        title: file.name,
        file,
        type
      }).unwrap();

      // Update local state with the new resource
      setModules(prev => prev.map(m => 
        m.id === moduleId 
          ? { 
              ...m, 
              resources: [...m.resources, {
                id: response.data?.id || Date.now(),
                name: file.name,
                type,
                url: response.data?.url || URL.createObjectURL(file),
                uploadedAt: new Date().toISOString().split("T")[0],
                size: `${(file.size / 1024 / 1024).toFixed(1)} MB`
              }]
            } 
          : m
      ));

      toast.success(`${type.toUpperCase()} file uploaded successfully!`);
      setResourceType(null);
      setShowAddResource(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to upload file");
    }
  };


  const requestDeleteResource = (lessonId: number, resourceId: number) => {
  setResourceToDelete({ lessonId, resourceId });
  setModals(prev => ({ ...prev, showResourceDeleteConfirm: true }));
};
const confirmDeleteResource = async () => {
  if (!resourceToDelete) return;

  const { lessonId, resourceId } = resourceToDelete;

  try {
    await deleteResource({ lessonId, resourceId }).unwrap();

    setModules(prev =>
      prev.map(module =>
        module.id === lessonId
          ? {
              ...module,
              resources: module.resources.filter(r => r.id !== resourceId),
            }
          : module
      )
    );

    toast.success("Resource deleted successfully!");
  } catch (error: any) {
    toast.error(error?.data?.message || "Failed to delete resource");
  } finally {
    setResourceToDelete(null);
    setModals(prev => ({ ...prev, showResourceDeleteConfirm: false }));
  }
};





  
  const handleQuizCreation = async (moduleId: number) => {
    if (!quizName.trim()) {
      toast.error("Please enter a quiz name");
      return;
    }

    try {
      const response = await addResource({
        lessonId: moduleId,
        title: quizName,
        type: "quiz",
        description: quizDescription || ""
      }).unwrap();

      setModules(prev => prev.map(m => 
        m.id === moduleId 
          ? { 
              ...m, 
              resources: [...m.resources, {
                id: response.data?.id || Date.now(),
                name: quizName,
                type: "quiz",
                url: "",
                uploadedAt: new Date().toISOString().split("T")[0],
                quiz: SAMPLE_QUIZ
              }]
            } 
          : m
      ));

      setQuizName("");
      setQuizDescription("");
      setResourceType(null);
      setShowAddResource(null);
      toast.success("Quiz created successfully!");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create quiz");
    }
  };
  const handleFileSelect = (moduleId: number, type: "pdf" | "word") => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === "pdf" ? ".pdf" : ".doc,.docx";
      fileInputRef.current.onchange = (e) => {
        const target = e.target as HTMLInputElement;
        if (target.files?.[0]) {
          handleFileUpload(moduleId, target.files[0], type);
        }
      };
      fileInputRef.current.click();
    }
  };

  // Lesson Management Functions
  const toggleModuleUnlock = async (moduleId: number) => {
    try {
      const module = modules.find(m => m.id === moduleId);
      if (!module) return;

      await toggleLessonLock({
        id: moduleId,
        isUnlocked: !module.isUnlocked,
        courseId
      }).unwrap();

      setModules(prev => prev.map(m =>
        m.id === moduleId ? { ...m, isUnlocked: !m.isUnlocked } : m
      ));

      toast.success(`Lesson ${!module.isUnlocked ? "unlocked" : "locked"} successfully!`);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to toggle lesson lock");
    }
  };

const requestDeleteLesson = (lessonId: number) => {
  setLessonToDelete(lessonId);
  setModals({ showDeleteConfirm: true, showResourceDeleteConfirm: false });
};


 const confirmDeleteLesson = async () => {
  if (!lessonToDelete) return;

  try {
    await deleteLesson({ id: lessonToDelete, courseId }).unwrap();
    setModules(prev => prev.filter(m => m.id !== lessonToDelete));
    toast.success("Lesson deleted successfully!");
  } catch (error: any) {
    toast.error(error?.data?.message || "Failed to delete lesson");
  } finally {
    setLessonToDelete(null);
    setModals({ showDeleteConfirm: false, showResourceDeleteConfirm: false });
  }
};

const cancelDelete = () => {
  setLessonToDelete(null);
  setResourceToDelete(null);
  setModals({ showDeleteConfirm: false, showResourceDeleteConfirm: false });
};


  

  // UI Components
  const ResourceTypeSelector = ({ onSelect }: { onSelect: (type: "pdf" | "video" | "word" | "quiz") => void }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { type: "pdf" as const, icon: FaFilePdf, color: "red", label: "PDF Document", desc: "Upload PDF file" },
        { type: "video" as const, icon: FaPlay, color: "purple", label: "Video", desc: "Add video link" },
        { type: "word" as const, icon: FaFileWord, color: "blue", label: "Word Document", desc: "Upload Word file" },
        { type: "quiz" as const, icon: FaQuestionCircle, color: "green", label: "Quiz", desc: "Create assessment" },
      ].map(({ type, icon: Icon, color, label, desc }) => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          className="flex flex-col items-center justify-center p-5 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
        >
          <div className={`w-12 h-12 rounded-full bg-${color}-100 flex items-center justify-center mb-3 group-hover:bg-${color}-200 transition-colors`}>
            <Icon className={`text-2xl text-${color}-600`} />
          </div>
          <span className="font-medium text-gray-800">{label}</span>
          <span className="text-xs text-gray-500 mt-1">{desc}</span>
        </button>
      ))}
    </div>
  );

  const VideoLinkForm = ({ moduleId }: { moduleId: number }) => (
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

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Video Title</label>
          <input
            type="text"
            value={videoName}
            onChange={(e) => setVideoName(e.target.value)}
            placeholder="Enter video title"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
          <input
            type="url"
            value={videoLink}
            onChange={(e) => setVideoLink(e.target.value)}
            placeholder="https://example.com/video.mp4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => handleVideoLinkSubmit(moduleId)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <FaCheck className="text-sm" /> Add Video
        </button>
        <button
          onClick={() => {
            setResourceType(null);
            setVideoLink("");
            setVideoName("");
          }}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <FaTimes /> Cancel
        </button>
      </div>
    </div>
  );

  const FileUploadForm = ({ moduleId, type }: { moduleId: number; type: "pdf" | "word" }) => (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-full ${type === "pdf" ? "bg-red-100" : "bg-blue-100"} flex items-center justify-center`}>
          {type === "pdf" ? <FaFilePdf className="text-red-600 text-xl" /> : <FaFileWord className="text-blue-800 text-xl" />}
        </div>
        <div>
          <h4 className="font-medium text-gray-800">Upload {type === "pdf" ? "PDF" : "Word"} Document</h4>
          <p className="text-sm text-gray-600">Select a file from your device</p>
        </div>
      </div>
      <div className="flex gap-3 items-center">
        <button
          onClick={() => handleFileSelect(moduleId, type)}
          className="bg-blue-800 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center gap-2"
        >
          <FaFile className="text-sm" /> Choose File
        </button>
        <button
          onClick={() => setResourceType(null)}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg transition-colors flex items-center gap-2"
        >
          <FaTimes /> Cancel
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-3">
        {type === "pdf" ? "Supported format: .pdf (Max size: 10MB)" : "Supported formats: .doc, .docx (Max size: 10MB)"}
      </p>
    </div>
  );

  const QuizForm = ({ moduleId }: { moduleId: number }) => (
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Name</label>
          <input
            type="text"
            value={quizName}
            onChange={(e) => setQuizName(e.target.value)}
            placeholder="Enter quiz name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Description (Optional)</label>
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
            onClick={() => handleQuizCreation(moduleId)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <FaCheck className="text-sm" /> Create Quiz
          </button>
          <button
            onClick={() => {
              setResourceType(null);
              setQuizName("");
              setQuizDescription("");
            }}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <FaTimes /> Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const sortedModules = [...modules].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div>
      <input type="file" ref={fileInputRef} style={{ display: "none" }} />

      <div className="space-y-3">
        {sortedModules.map((module) => (
          <div key={module.id} className="group bg-white border border-gray-200 rounded-xl shadow-lg transition-all hover:shadow-xl">
            {/* Header */}
            <div className="p-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {module.order}. {module.title}
                </h2>
                <p className="text-gray-600">{module.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${module.isUnlocked ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {module.isUnlocked ? "Unlocked" : "Locked"}
                </span>
                <div
                  className="relative"
                  ref={(el) => {
                    menuWrapperRefs.current[module.id] = el;
                  }}
                >
                  <button
                    onClick={() => setMenuOpenId(menuOpenId === module.id ? null : module.id)}
                    className="p-2 rounded-full cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <FaEllipsisV className="text-gray-600" />
                  </button>
                  {menuOpenId === module.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-500 rounded-lg shadow-lg z-10">
                      <ul className="py-2 text-sm text-gray-700">
                        <li>
                          <button
                            onClick={() => toggleModuleUnlock(module.id)}
                            className="w-full cursor-pointer px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                          >
                            {module.isUnlocked ? <FaLock /> : <FaUnlock />}
                            {module.isUnlocked ? "Lock Lesson" : "Unlock Lesson"}
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => {
                              setShowAddResource(showAddResource === module.id ? null : module.id);
                              setResourceType(null);
                            }}
                            className="w-full cursor-pointer px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                          >
                            <FaPlus /> Add Resource
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => requestDeleteLesson(module.id)}
                            className="w-full cursor-pointer px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-red-600"
                          >
                            <FaTrash /> Delete Lesson
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
              <div className="px-6 pb-6 mx-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-b-xl relative">
                <div className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">Add New Resource</h3>
                  </div>

                  {resourceType !== null && resourceType !== "quiz" && (
                    <button
                      onClick={() => setResourceType(null)}
                      className="text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1 text-sm mb-4"
                    >
                      <FaChevronUp className="text-xs" /> Back to options
                    </button>
                  )}

                  {resourceType === null ? (
                    <ResourceTypeSelector onSelect={setResourceType} />
                  ) : resourceType === "video" ? (
                    <VideoLinkForm moduleId={module.id} />
                  ) : resourceType === "pdf" || resourceType === "word" ? (
                    <FileUploadForm moduleId={module.id} type={resourceType} />
                  ) : resourceType === "quiz" ? (
                    <QuizForm moduleId={module.id} />
                  ) : null}
                </div>
              </div>
            )}

            {/* Resources */}
            {module.resources.length > 0 && (
              <div className="px-6 pb-6 mt-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaFile className="text-gray-600" /> Resources ({module.resources.length})
                </h3>
                <div className="space-y-3">
                  {module.resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-xl">{getResourceIcon(resource.type)}</div>
                        <div>
                          <h4 className="font-medium text-gray-900">{resource.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Uploaded: {resource.uploadedAt}</span>
                            {resource.size && <span>Size: {resource.size}</span>}
                            {resource.duration && <span>Duration: {resource.duration}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 relative">
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenu(openMenu === resource.id ? null : resource.id)}
                            className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <FaEllipsisV />
                          </button>
                          {openMenu === resource.id && (
                            <div className="absolute right-0 mt-2 w-40 bg-white shadow-md border border-gray-200 rounded-lg z-10">
                              <ul className="text-sm text-gray-700">
                                {resource.type === "quiz" ? (
                                  <li>
                                    <button
                                      onClick={() => setOpenQuiz(resource.id)}
                                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                      <FaQuestionCircle /> Take Quiz
                                    </button>
                                  </li>
                                ) : (
                                  <li>
                                    <a
                                      href={resource.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                                    >
                                      {resource.type === "video" ? <FaPlay /> : <FaExternalLinkAlt />}
                                      {resource.type === "video" ? "Watch" : "Open"}
                                    </a>
                                  </li>
                                )}
                                <li>
                                  <button
                                    onClick={() => requestDeleteResource(module.id, resource.id)}
                                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2"
                                  >
                                    <FaTrash /> Delete
                                  </button>
                                </li>
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {modules.length === 0 && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <FaFile className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No lessons yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first lesson to start organizing your course content.
            </p>
          </div>
        </div>
      )}

     
        <ConfirmDeleteModal
  visible={modals.showDeleteConfirm}
  title="Delete Lesson?"
  description="Are you sure you want to delete this lesson? This action cannot be undone."
  onConfirm={confirmDeleteLesson}
  onCancel={cancelDelete}
/>

<ConfirmDeleteModal
  visible={modals.showResourceDeleteConfirm}
  title="Delete Resource?"
  description="Are you sure you want to delete this resource? This action cannot be undone."
  onConfirm={confirmDeleteResource}
  onCancel={cancelDelete}
/>

      
    </div>
  );
}

export default ModuleManagement;