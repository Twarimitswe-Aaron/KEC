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
  FaEdit,
  FaList,
  FaCheckCircle,
  FaRegCircle,
  FaRegCheckSquare,
  FaRegSquare,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { 
  useDeleteLessonMutation, 
  useToggleLessonLockMutation,
  useAddResourceMutation,
  useDeleteResourceMutation
} from "../state/api/lessonApi";
import { Trash2, X } from "lucide-react";
import QuizEditor from './QuizEditor'

// Types
export interface ResourceType {
  id: number;
  uploadedAt: string;
  name: string;
  type: "pdf" | "word" | "video" | "quiz";
  url: string;
  size?: string;
  duration?: string;
  description?: string;
  quiz?: any;
}

export type lessonType = {
  id: number;
  title: string;
  description: string;
  isUnlocked: boolean;
  order: number;
  createdAt: string;
  resources: ResourceType[];
};

export type Question = {
  id: number;
  type: "multiple" | "checkbox" | "truefalse" | "short" | "long" | "number";
  question: string;
  description?: string;
  options?: string[];
  required?: boolean;
  points?: number;
};

export type QuizResponse = {
  questionId: number;
  answer: string | string[];
};

export type IncomingResource = {
  id: number;
  url: string;
  title?: string;
  type?: string;
  size?: string;
  duration?: string;
  uploadedAt?: string;
  quiz?: any;
};

export  interface Lesson {
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

export interface lessonManagementProps {
  lessons: Lesson[];
  courseId: number;
}

export interface ConfirmDeleteModalProps {
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
    <div className="fixed inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md p-4 sm:p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full mx-auto mb-3 sm:mb-4">
          <Trash2 className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-center text-gray-900">{title}</h2>
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 text-center px-2">{description}</p>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2.5 sm:py-3.5 cursor-pointer rounded-lg sm:rounded-xl hover:shadow-lg transition-all font-bold text-sm sm:text-base"
          >
            Delete
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-white border-2 border-gray-200 text-gray-700 px-4 py-2.5 sm:py-3.5 cursor-pointer rounded-lg sm:rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-bold text-sm sm:text-base"
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
    pdf: <FaFilePdf className="text-red-500 text-lg sm:text-xl" />,
    video: <FaPlay className="text-purple-500 text-lg sm:text-xl" />,
    word: <FaFileWord className="text-blue-500 text-lg sm:text-xl" />,
    quiz: <FaQuestionCircle className="text-green-500 text-lg sm:text-xl" />,
  };
  return icons[type as keyof typeof icons] || <FaFile className="text-lg sm:text-xl" />;
};

// Convert Lesson to lessonType
const lessonTolesson = (lesson: Lesson): lessonType => ({
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
      quiz: resource.quiz || SAMPLE_QUIZ,
    })) || [],
});

// Main Component
function ModuleManagement({ lessons: initialLessons, courseId }: lessonManagementProps) {

  // State
  const [showAddResource, setShowAddResource] = useState<number | null>(null);
  const [resourceType, setResourceType] = useState<"pdf" | "video" | "word" | "quiz" | null>(null);
  const [videoLink, setVideoLink] = useState("");
  const [videoName, setVideoName] = useState("");
  const [quizName, setQuizName] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [lessons, setLessons] = useState<lessonType[]>(initialLessons.map(lessonTolesson));
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

  // Handle initialLessons prop updates
  useEffect(() => {
    if (Array.isArray(initialLessons)) {
      setLessons(initialLessons.map(lessonTolesson));
    }
  }, [initialLessons]);

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

  const handleVideoLinkSubmit = async (lessonId: number) => {
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

      const {message} = await addResource({
        lessonId: lessonId,
        title: videoName,
        type: "video",
        description: "",
        url: videoLink
      }).unwrap();

      // setLessons(prev => prev.map(m => 
      //   m.id === lessonId 
      //     ? { 
      //         ...m, 
      //         resources: [...m.resources, {
      //           id: response.data?.id || Date.now(),
      //           name: videoName,
      //           type: "video",
      //           url: videoLink,
      //           uploadedAt: new Date().toISOString().split("T")[0],
      //           duration: "N/A"
      //         }]
      //       } 
      //     : m
      // ));

      setVideoLink("");
      setVideoName("");
      setResourceType(null);
      setShowAddResource(null);
      console.log(message)
      toast.success(message);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to add video resource");
    }
  };

  const handleFileUpload = async (lessonId: number, file: File, type: "pdf" | "word") => {
    try {
      console.log(file)
      const {message} = await addResource({
        lessonId: lessonId,
        title: file.name,
        file,
        type
      }).unwrap();

      // setLessons(prev => prev.map(m => 
      //   m.id === lessonId 
      //     ? { 
      //         ...m, 
      //         resources: [...m.resources, {
      //           id: response.data?.id || Date.now(),
      //           name: file.name,
      //           type,
      //           url: response.data?.url || URL.createObjectURL(file),
      //           uploadedAt: new Date().toISOString().split("T")[0],
      //           size: `${(file.size / 1024 / 1024).toFixed(1)} MB`
      //         }]
      //       } 
      //     : m
      // ));

      toast.success(message);
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

      setLessons(prev =>
        prev.map(lesson =>
          lesson.id === lessonId
            ? {
                ...lesson,
                resources: lesson.resources.filter(r => r.id !== resourceId),
              }
            : lesson
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

  const handleQuizCreation = async (lessonId: number) => {
    if (!quizName.trim()) {
      toast.error("Please enter a quiz name");
      return;
    }

    try {
      console.log(quizName,quizDescription)
      const {message} = await addResource({
        lessonId: lessonId,
        title: quizName,
        type: "quiz",
        description: quizDescription || ""
      }).unwrap();

      // setLessons(prev => prev.map(m => 
      //   m.id === lessonId 
      //     ? { 
      //         ...m, 
      //         resources: [...m.resources, {
      //           id: response.data?.id || Date.now(),
      //           name: quizName,
      //           type: "quiz",
      //           url: "",
      //           uploadedAt: new Date().toISOString().split("T")[0],
      //           quiz: SAMPLE_QUIZ
      //         }]
      //       } 
      //     : m
      // ));


      setQuizName("");
      setQuizDescription("");
      setResourceType(null);
      setShowAddResource(null);
      toast.success(message);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create quiz");
    }
  };

  const handleFileSelect = (lessonId: number, type: "pdf" | "word") => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === "pdf" ? ".pdf" : ".doc,.docx";
      fileInputRef.current.onchange = (e) => {
        const target = e.target as HTMLInputElement;
        if (target.files?.[0]) {
          handleFileUpload(lessonId, target.files[0], type);
        }
      };
      fileInputRef.current.click();
    }
  };

  const togglelessonUnlock = async (lessonId: number) => {
    try {
      const lesson = lessons.find(m => m.id === lessonId);
      if (!lesson) return;

      await toggleLessonLock({
        id: lessonId,
        isUnlocked: !lesson.isUnlocked,
        courseId
      }).unwrap();

      setLessons(prev => prev.map(m =>
        m.id === lessonId ? { ...m, isUnlocked: !m.isUnlocked } : m
      ));

      toast.success(`Lesson ${!lesson.isUnlocked ? "unlocked" : "locked"} successfully!`);
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
      setLessons(prev => prev.filter(m => m.id !== lessonToDelete));
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

  const handleQuizUpdate = (resourceId: number, updatedQuiz: any) => {
    setLessons(prev => prev.map(lesson => ({
      ...lesson,
      resources: lesson.resources.map(resource =>
        resource.id === resourceId
          ? { ...resource, quiz: updatedQuiz }
          : resource
      )
    })));
  };

  // UI Components
  const ResourceTypeSelector = ({ onSelect }: { onSelect: (type: "pdf" | "video" | "word" | "quiz") => void }) => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {[
        { type: "pdf" as const, icon: FaFilePdf, color: "red", label: "PDF Document", desc: "Upload PDF file" },
        { type: "video" as const, icon: FaPlay, color: "purple", label: "Video", desc: "Add video link" },
        { type: "word" as const, icon: FaFileWord, color: "blue", label: "Word Document", desc: "Upload Word file" },
        { type: "quiz" as const, icon: FaQuestionCircle, color: "green", label: "Quiz", desc: "Create assessment" },
      ].map(({ type, icon: Icon, color, label, desc }) => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          className="flex flex-col items-center justify-center p-3 sm:p-5 bg-white rounded-lg sm:rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
        >
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-${color}-100 flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-${color}-200 transition-colors`}>
            <Icon className={`text-lg sm:text-2xl text-${color}-600`} />
          </div>
          <span className="font-medium text-gray-800 text-xs sm:text-base text-center">{label}</span>
          <span className="text-xs text-gray-500 mt-1 hidden sm:block text-center">{desc}</span>
        </button>
      ))}
    </div>
  );

  const VideoLinkForm = ({ lessonId }: { lessonId: number }) => (
    <div className="bg-white p-4 sm:p-5 rounded-lg sm:rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
          <FaLink className="text-purple-600 text-sm sm:text-base" />
        </div>
        <div className="min-w-0">
          <h4 className="font-medium text-gray-800 text-sm sm:text-base">Add Video Link</h4>
          <p className="text-xs sm:text-sm text-gray-600 truncate">Paste the URL of your video resource</p>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Video Title</label>
          <input
            type="text"
            value={videoName}
            onChange={(e) => setVideoName(e.target.value)}
            placeholder="Enter video title"
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm sm:text-base"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Video URL</label>
          <input
            type="url"
            value={videoLink}
            onChange={(e) => setVideoLink(e.target.value)}
            placeholder="https://example.com/video.mp4"
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm sm:text-base"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-4">
        <button
          onClick={() => handleVideoLinkSubmit(lessonId)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base whitespace-nowrap"
        >
          <FaCheck className="text-xs sm:text-sm" /> Add Video
        </button>
        <button
          onClick={() => {
            setResourceType(null);
            setVideoLink("");
            setVideoName("");
          }}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <FaTimes /> Cancel
        </button>
      </div>
    </div>
  );

  const FileUploadForm = ({ lessonId, type }: { lessonId: number; type: "pdf" | "word" }) => (
    <div className="bg-white p-4 sm:p-5 rounded-lg sm:rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${type === "pdf" ? "bg-red-100" : "bg-blue-100"} flex items-center justify-center flex-shrink-0`}>
          {type === "pdf" ? <FaFilePdf className="text-red-600 text-base sm:text-xl" /> : <FaFileWord className="text-blue-800 text-base sm:text-xl" />}
        </div>
        <div className="min-w-0">
          <h4 className="font-medium text-gray-800 text-sm sm:text-base">Upload {type === "pdf" ? "PDF" : "Word"} Document</h4>
          <p className="text-xs sm:text-sm text-gray-600 truncate">Select a file from your device</p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
        <button
          onClick={() => handleFileSelect(lessonId, type)}
          className="bg-blue-800 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <FaFile className="text-xs sm:text-sm" /> Choose File
        </button>
        <button
          onClick={() => setResourceType(null)}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <FaTimes /> Cancel
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2 sm:mt-3">
        {type === "pdf" ? "Supported format: .pdf (Max size: 10MB)" : "Supported formats: .doc, .docx (Max size: 10MB)"}
      </p>
    </div>
  );

  const QuizForm = ({ lessonId }: { lessonId: number }) => (
    <div className="bg-white p-4 sm:p-5 rounded-lg sm:rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <FaQuestionCircle className="text-green-600 text-sm sm:text-base" />
        </div>
        <div className="min-w-0">
          <h4 className="font-medium text-gray-800 text-sm sm:text-base">Create New Quiz</h4>
          <p className="text-xs sm:text-sm text-gray-600 truncate">Set up your quiz with questions and answers</p>
        </div>
      </div>
      <div className="space-y-3 sm:space-y-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Quiz Name</label>
          <input
            type="text"
            value={quizName}
            onChange={(e) => setQuizName(e.target.value)}
            placeholder="Enter quiz name"
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm sm:text-base"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Quiz Description (Optional)</label>
          <textarea
            value={quizDescription}
            onChange={(e) => setQuizDescription(e.target.value)}
            placeholder="Describe what this quiz covers"
            rows={2}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm sm:text-base"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
          <button
            onClick={() => handleQuizCreation(lessonId)}
            className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <FaCheck className="text-xs sm:text-sm" /> Create Quiz
          </button>
          <button
            onClick={() => {
              setResourceType(null);
              setQuizName("");
              setQuizDescription("");
            }}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <FaTimes /> Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const sortedLessons = [...lessons].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Find the currently open quiz resource
  const currentQuizResource = openQuiz 
    ? lessons.flatMap(m => m.resources).find(r => r.id === openQuiz)
    : null;

  return (
    <div className="px-2 sm:px-0">
      <input type="file" ref={fileInputRef} style={{ display: "none" }} />

      {/* Quiz Editor Modal */}
      {openQuiz && currentQuizResource && (
        <QuizEditor
          resource={currentQuizResource}
          onClose={() => setOpenQuiz(null)}
          onUpdate={handleQuizUpdate}
        />
      )}

      <div className="space-y-3">
        {sortedLessons.map((lesson) => (
          <div key={lesson.id} className="group bg-white border border-gray-200 rounded-lg sm:rounded-xl shadow-lg transition-all hover:shadow-xl">
            {/* Header - Responsive */}
            <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2 break-words">
                  {lesson.order}. {lesson.title}
                </h2>
                <p className="text-sm sm:text-base text-gray-600 break-words">{lesson.description}</p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ${lesson.isUnlocked ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {lesson.isUnlocked ? "Unlocked" : "Locked"}
                </span>
                <div
                  className="relative"
                  ref={(el) => {
                    menuWrapperRefs.current[lesson.id] = el;
                  }}
                >
                  <button
                    onClick={() => setMenuOpenId(menuOpenId === lesson.id ? null : lesson.id)}
                    className="p-2 rounded-full cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <FaEllipsisV className="text-gray-600 text-sm sm:text-base" />
                  </button>
                  {menuOpenId === lesson.id && (
                    <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-white border border-gray-500 rounded-lg shadow-lg z-10">
                      <ul className="py-2 text-xs sm:text-sm text-gray-700">
                        <li>
                          <button
                            onClick={() => togglelessonUnlock(lesson.id)}
                            className="w-full cursor-pointer px-3 sm:px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 sm:gap-3"
                          >
                            {lesson.isUnlocked ? <FaLock className="flex-shrink-0" /> : <FaUnlock className="flex-shrink-0" />}
                            <span>{lesson.isUnlocked ? "Lock Lesson" : "Unlock Lesson"}</span>
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => {
                              setShowAddResource(showAddResource === lesson.id ? null : lesson.id);
                              setResourceType(null);
                            }}
                            className="w-full cursor-pointer px-3 sm:px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 sm:gap-3"
                          >
                            <FaPlus className="flex-shrink-0" /> <span>Add Resource</span>
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => requestDeleteLesson(lesson.id)}
                            className="w-full cursor-pointer px-3 sm:px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 sm:gap-3 text-red-600"
                          >
                            <FaTrash className="flex-shrink-0" /> <span>Delete Lesson</span>
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Add Resource - Responsive */}
            {showAddResource === lesson.id && (
              <div className="px-3 sm:px-6 pb-4 sm:pb-6 mx-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-b-lg sm:rounded-b-xl relative">
                <div className="pt-3 sm:pt-4">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">Add New Resource</h3>
                  </div>

                  {resourceType !== null && resourceType !== "quiz" && (
                    <button
                      onClick={() => setResourceType(null)}
                      className="text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1 text-xs sm:text-sm mb-3 sm:mb-4"
                    >
                      <FaChevronUp className="text-xs" /> Back to options
                    </button>
                  )}

                  {resourceType === null ? (
                    <ResourceTypeSelector onSelect={setResourceType} />
                  ) : resourceType === "video" ? (
                    <VideoLinkForm lessonId={lesson.id} />
                  ) : resourceType === "pdf" || resourceType === "word" ? (
                    <FileUploadForm lessonId={lesson.id} type={resourceType} />
                  ) : resourceType === "quiz" ? (
                    <QuizForm lessonId={lesson.id} />
                  ) : null}
                </div>
              </div>
            )}

            {/* Resources - Responsive */}
            {lesson.resources.length > 0 && (
              <div className="px-4 sm:px-6 pb-4 sm:pb-6 mt-3 sm:mt-4">
                <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                  <FaFile className="text-gray-600 flex-shrink-0" /> Resources ({lesson.resources.length})
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {lesson.resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        <div className="text-base sm:text-xl flex-shrink-0 mt-0.5 sm:mt-0">{getResourceIcon(resource.type)}</div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-gray-900 text-sm sm:text-base break-words">{resource.name}</h4>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mt-1">
                            <span className="whitespace-nowrap">Uploaded: {resource.uploadedAt}</span>
                            {resource.size && <span className="whitespace-nowrap">Size: {resource.size}</span>}
                            {resource.duration && <span className="whitespace-nowrap">Duration: {resource.duration}</span>}
                            {resource.type === "quiz" && (
                              <span className="bg-green-100 text-green-800 px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium whitespace-nowrap">
                                {resource.quiz?.length || 0} questions
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 sm:gap-3 relative flex-shrink-0">
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenu(openMenu === resource.id ? null : resource.id)}
                            className="text-gray-600 hover:text-gray-800 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <FaEllipsisV className="text-xs sm:text-sm" />
                          </button>
                          {openMenu === resource.id && (
                            <div className="absolute right-0 mt-2 w-36 sm:w-40 bg-white shadow-md border border-gray-200 rounded-lg z-10">
                              <ul className="text-xs sm:text-sm text-gray-700">
                                {resource.type === "quiz" ? (
                                  <>
                                    <li>
                                      <button
                                        onClick={() => {
                                          setOpenQuiz(resource.id);
                                          setOpenMenu(null);
                                        }}
                                        className="w-full text-left px-3 sm:px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                                      >
                                        <FaEdit className="flex-shrink-0" /> <span>Edit Quiz</span>
                                      </button>
                                    </li>
                                    <li>
                                      <button
                                        onClick={() => {
                                          setOpenMenu(null);
                                        }}
                                        className="w-full text-left px-3 sm:px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                                      >
                                        <FaQuestionCircle className="flex-shrink-0" /> <span>Take Quiz</span>
                                      </button>
                                    </li>
                                  </>
                                ) : (
                                  <li>
                                    <a
                                      href={resource.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 px-3 sm:px-4 py-2 hover:bg-gray-100"
                                    >
                                      {resource.type === "video" ? <FaPlay className="flex-shrink-0" /> : <FaExternalLinkAlt className="flex-shrink-0" />}
                                      <span>{resource.type === "video" ? "Watch" : "Open"}</span>
                                    </a>
                                  </li>
                                )}
                                <li>
                                  <button
                                    onClick={() => {
                                      requestDeleteResource(lesson.id, resource.id);
                                      setOpenMenu(null);
                                    }}
                                    className="w-full text-left px-3 sm:px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2"
                                  >
                                    <FaTrash className="flex-shrink-0" /> <span>Delete</span>
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

      {lessons.length === 0 && (
        <div className="text-center py-8 sm:py-12 px-4">
          <div className="max-w-md mx-auto">
            <FaFile className="text-4xl sm:text-6xl text-gray-300 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No lessons yet</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
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