import { useEffect, useRef, useState } from "react";
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
  FaEdit,
} from "react-icons/fa";
import { toast } from "react-toastify";
import {
  useDeleteLessonMutation,
  useToggleLessonLockMutation,
  useAddResourceMutation,
  useDeleteResourceMutation,
} from "../state/api/lessonApi";
import { Trash2 } from "lucide-react";
import QuizEditor from "./QuizEditor";

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
  name?: string;
  type?: string;
  size?: string;
  duration?: string;
  createdAt?: string;
  quiz?: any;
};

export interface Lesson {
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
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-center w-14 h-14 bg-red-100 rounded-full mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold mb-3 text-center text-gray-900">
          {title}
        </h2>
        <p className="text-sm text-gray-600 mb-6 text-center">
          {description}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg transition-colors font-medium"
          >
            Delete
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg transition-colors font-medium"
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

// Convert Lesson to lessonType
const lessonTolesson = (lesson: Lesson): lessonType => ({
  id: lesson.id,
  title: lesson.title,
  description: lesson.description || lesson.content || "",
  isUnlocked: lesson.isUnlocked ?? true,
  order: lesson.order || lesson.id,
  createdAt: lesson.createdAt || "",
  resources:
    lesson.resources?.map((resource) => ({
      id: resource.id,
      name: resource.name || "Untitled Resource",
      type: (resource.type as "pdf" | "video" | "quiz" | "word") || "pdf",
      url: resource.url,
      uploadedAt: resource.createdAt || "",
      size: resource.size,
      duration: resource.duration,
      quiz: resource.quiz || SAMPLE_QUIZ,
    })) || [],
});

// Main Component
function ModuleManagement({
  lessons: initialLessons,
  courseId,
}: lessonManagementProps) {
  // State
  const [showAddResource, setShowAddResource] = useState<number | null>(null);
  const [resourceType, setResourceType] = useState<
    "pdf" | "video" | "word" | "quiz" | null
  >(null);
  const [videoLink, setVideoLink] = useState("");
  const [videoName, setVideoName] = useState("");
  const [quizName, setQuizName] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [lessons, setLessons] = useState<lessonType[]>(
    initialLessons.map(lessonTolesson)
  );
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [openQuiz, setOpenQuiz] = useState<number | null>(null);
  const [deleteLesson] = useDeleteLessonMutation();
  const [toggleLessonLock] = useToggleLessonLockMutation();
  const [addResource] = useAddResourceMutation();
  const [deleteResource] = useDeleteResourceMutation();
  const [openResourceMenu, setOpenResourceMenu] = useState<number | null>(null);
  const [modals, setModals] = useState({
    showDeleteConfirm: false,
    showResourceDeleteConfirm: false,
  });

  const [lessonToDelete, setLessonToDelete] = useState<number | null>(null);
  const [resourceToDelete, setResourceToDelete] = useState<{
    lessonId: number;
    resourceId: number;
  } | null>(null);

  // Refs
  const menuWrapperRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const resourceMenuRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle initialLessons prop updates
  useEffect(() => {
    if (Array.isArray(initialLessons)) {
      setLessons(initialLessons.map(lessonTolesson));
    }
  }, [initialLessons]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close lesson menu
      if (menuOpenId !== null) {
        const wrapper = menuWrapperRefs.current[menuOpenId];
        if (wrapper && !wrapper.contains(event.target as Node)) {
          setMenuOpenId(null);
        }
      }

      // Close resource menu
      if (openResourceMenu !== null) {
        const wrapper = resourceMenuRefs.current[openResourceMenu];
        if (wrapper && !wrapper.contains(event.target as Node)) {
          setOpenResourceMenu(null);
        }
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpenId(null);
        setOpenResourceMenu(null);
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
  }, [menuOpenId, openResourceMenu]);

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
      const { message } = await addResource({
        lessonId: lessonId,
        title: videoName,
        type: "video",
        description: "",
        url: videoLink,
      }).unwrap();

      setVideoLink("");
      setVideoName("");
      setResourceType(null);
      setShowAddResource(null);
      toast.success(message);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to add video resource");
    }
  };

  const handleFileUpload = async (
    lessonId: number,
    file: File,
    type: "pdf" | "word"
  ) => {
    try {
      const { message } = await addResource({
        lessonId: lessonId,
        title: file.name,
        file,
        type,
      }).unwrap();

      toast.success(message);
      setResourceType(null);
      setShowAddResource(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to upload file");
    }
  };

  const requestDeleteResource = (lessonId: number, resourceId: number) => {
    setResourceToDelete({ lessonId, resourceId });
    setModals((prev) => ({ ...prev, showResourceDeleteConfirm: true }));
  };

  const confirmDeleteResource = async () => {
    if (!resourceToDelete) return;

    const { lessonId, resourceId } = resourceToDelete;

    try {
      await deleteResource({ lessonId, resourceId }).unwrap();

      setLessons((prev) =>
        prev.map((lesson) =>
          lesson.id === lessonId
            ? {
                ...lesson,
                resources: lesson.resources.filter((r) => r.id !== resourceId),
              }
            : lesson
        )
      );

      toast.success("Resource deleted successfully!");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete resource");
    } finally {
      setResourceToDelete(null);
      setModals((prev) => ({ ...prev, showResourceDeleteConfirm: false }));
    }
  };

  const handleQuizCreation = async (lessonId: number) => {
    if (!quizName.trim()) {
      toast.error("Please enter a quiz name");
      return;
    }

    try {
      const { message } = await addResource({
        lessonId: lessonId,
        title: quizName,
        type: "quiz",
        description: quizDescription || "",
      }).unwrap();

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
      const lesson = lessons.find((m) => m.id === lessonId);
      if (!lesson) return;

      await toggleLessonLock({
        id: lessonId,
        isUnlocked: !lesson.isUnlocked,
        courseId,
      }).unwrap();

      setLessons((prev) =>
        prev.map((m) =>
          m.id === lessonId ? { ...m, isUnlocked: !m.isUnlocked } : m
        )
      );

      toast.success(
        `Lesson ${!lesson.isUnlocked ? "unlocked" : "locked"} successfully!`
      );
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
      setLessons((prev) => prev.filter((m) => m.id !== lessonToDelete));
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
    setLessons((prev) =>
      prev.map((lesson) => ({
        ...lesson,
        resources: lesson.resources.map((resource) =>
          resource.id === resourceId
            ? { ...resource, quiz: updatedQuiz }
            : resource
        ),
      }))
    );
  };

  // UI Components
  const ResourceTypeSelector = ({
    onSelect,
  }: {
    onSelect: (type: "pdf" | "video" | "word" | "quiz") => void;
  }) => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[
        {
          type: "pdf" as const,
          icon: FaFilePdf,
          color: "red",
          label: "PDF",
        },
        {
          type: "video" as const,
          icon: FaPlay,
          color: "purple",
          label: "Video",
        },
        {
          type: "word" as const,
          icon: FaFileWord,
          color: "blue",
          label: "Word",
        },
        {
          type: "quiz" as const,
          icon: FaQuestionCircle,
          color: "green",
          label: "Quiz",
        },
      ].map(({ type, icon: Icon, color, label }) => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all"
        >
          <div className={`w-12 h-12 rounded-full bg-${color}-100 flex items-center justify-center mb-2`}>
            <Icon className={`text-xl text-${color}-600`} />
          </div>
          <span className="font-medium text-gray-800 text-sm">{label}</span>
        </button>
      ))}
    </div>
  );



  const FileUploadForm = ({
    lessonId,
    type,
  }: {
    lessonId: number;
    type: "pdf" | "word";
  }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-full ${type === "pdf" ? "bg-red-100" : "bg-blue-100"} flex items-center justify-center`}>
          {type === "pdf" ? (
            <FaFilePdf className="text-red-600 text-lg" />
          ) : (
            <FaFileWord className="text-blue-600 text-lg" />
          )}
        </div>
        <h4 className="font-medium text-gray-800">
          Upload {type === "pdf" ? "PDF" : "Word"}
        </h4>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => handleFileSelect(lessonId, type)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <FaFile /> Choose File
        </button>
        <button
          onClick={() => setResourceType(null)}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <FaTimes /> Cancel
        </button>
      </div>
    </div>
  );
const QuizForm = ({ lessonId }: { lessonId: number }) => {
  const handleQuizNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuizName(e.target.value);
  };

  const handleQuizDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuizDescription(e.target.value);
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-[#034153]/10 flex items-center justify-center">
          <FaQuestionCircle className="text-[#034153]" />
        </div>
        <h4 className="font-medium text-gray-800">Create Quiz</h4>
      </div>
      <div className="space-y-3">
        <div>
          <label 
            htmlFor={`quiz-name-${lessonId}`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Quiz Name
          </label>
          <input
            id={`quiz-name-${lessonId}`}
            type="text"
            value={quizName}
            onChange={handleQuizNameChange}
            placeholder="Enter quiz name"
            autoComplete="off"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#034153]"
          />
        </div>
        <div>
          <label 
            htmlFor={`quiz-description-${lessonId}`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description (Optional)
          </label>
          <textarea
            id={`quiz-description-${lessonId}`}
            value={quizDescription}
            onChange={handleQuizDescriptionChange}
            placeholder="Describe what this quiz covers"
            rows={2}
            autoComplete="off"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#034153]"
          />
        </div>
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={() => handleQuizCreation(lessonId)}
            className="bg-[#034153] hover:bg-[#034153]/90 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <FaCheck /> Create Quiz
          </button>
          <button
            type="button"
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
};

const VideoLinkForm = ({ lessonId }: { lessonId: number }) => {
  const handleVideoNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoName(e.target.value);
  };

  const handleVideoLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoLink(e.target.value);
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-[#034153]/10 flex items-center justify-center">
          <FaLink className="text-[#034153]" />
        </div>
        <h4 className="font-medium text-gray-800">Add Video Link</h4>
      </div>

      <div className="space-y-3">
        <div>
          <label 
            htmlFor={`video-title-${lessonId}`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Video Title
          </label>
          <input
            id={`video-title-${lessonId}`}
            type="text"
            value={videoName}
            onChange={handleVideoNameChange}
            placeholder="Enter video title"
            autoComplete="off"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#034153]"
          />
        </div>

        <div>
          <label 
            htmlFor={`video-url-${lessonId}`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Video URL
          </label>
          <input
            id={`video-url-${lessonId}`}
            type="url"
            value={videoLink}
            onChange={handleVideoLinkChange}
            placeholder="https://example.com/video.mp4"
            autoComplete="off"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#034153]"
          />
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={() => handleVideoLinkSubmit(lessonId)}
          className="bg-[#034153] hover:bg-[#034153]/90 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <FaCheck /> Add Video
        </button>
        <button
          type="button"
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
};

  // Sort lessons by createdAt DESC (newest first = last created at bottom)
  const sortedLessons = [...lessons].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // Find the currently open quiz resource
  const currentQuizResource = openQuiz
    ? lessons.flatMap((m) => m.resources).find((r) => r.id === openQuiz)
    : null;

  return (
    <div className="w-full">
      <input type="file" ref={fileInputRef} style={{ display: "none" }} />

      {/* Quiz Editor Modal  */}
      {openQuiz && currentQuizResource && (
        <QuizEditor
          resource={currentQuizResource}
          onClose={() => setOpenQuiz(null)}
          onUpdate={handleQuizUpdate}
        />
      )}

      <div className="space-y-4">
        {sortedLessons.map((lesson, index) => (
          <div
            key={lesson.id}
            className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  {index + 1}. {lesson.title}
                </h2>
                <p className="text-sm text-gray-600 break-words">
                  {lesson.description}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    lesson.isUnlocked
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {lesson.isUnlocked ? "Unlocked" : "Locked"}
                </span>
                <div
                  className="relative"
                  ref={(el) => {
                    menuWrapperRefs.current[lesson.id] = el;
                  }}
                >
                  <button
                    onClick={() =>
                      setMenuOpenId(menuOpenId === lesson.id ? null : lesson.id)
                    }
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <FaEllipsisV className="text-gray-600" />
                  </button>
                  {menuOpenId === lesson.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                      <ul className="py-1 text-sm">
                        <li>
                          <button
                            onClick={() => {
                              togglelessonUnlock(lesson.id);
                              setMenuOpenId(null);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                          >
                            {lesson.isUnlocked ? <FaLock /> : <FaUnlock />}
                            <span>
                              {lesson.isUnlocked ? "Lock Lesson" : "Unlock Lesson"}
                            </span>
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => {
                              setShowAddResource(
                                showAddResource === lesson.id ? null : lesson.id
                              );
                              setResourceType(null);
                              setMenuOpenId(null);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                          >
                            <FaPlus /> <span>Add Resource</span>
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => {
                              requestDeleteLesson(lesson.id);
                              setMenuOpenId(null);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-red-600"
                          >
                            <FaTrash /> <span>Delete Lesson</span>
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Add Resource */}
            {showAddResource === lesson.id && (
              <div className="px-4 sm:px-6 pb-4 bg-gray-50 border-t border-gray-200">
                <div className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-gray-800">
                      Add New Resource
                    </h3>
                  </div>

                  {resourceType !== null && resourceType !== "quiz" && (
                    <button
                      onClick={() => setResourceType(null)}
                      className="text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1 text-sm mb-3"
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

            {/* Resources */}
            {lesson.resources.length > 0 && (
              <div className="px-4 sm:px-6 pb-4 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 my-4 flex items-center gap-2">
                  <FaFile className="text-gray-500" /> Resources ({lesson.resources.length})
                </h3>
                <div className="space-y-2">
                  {lesson.resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="flex items-center justify-between gap-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="text-xl flex-shrink-0">
                          {getResourceIcon(resource.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-gray-900 text-sm truncate">
                            {resource.name}
                          </h4>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                            <span>{resource.uploadedAt}</span>
                            {resource.size && <span>Size: {resource.size}</span>}
                            {resource.duration && <span>Duration: {resource.duration}</span>}
                            {resource.type === "quiz" && (
                              <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
                                {resource.quiz?.length || 0} questions
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div
                          className="relative"
                          ref={(el) => {
                            resourceMenuRefs.current[resource.id] = el;
                          }}
                        >
                          <button
                            onClick={() =>
                              setOpenResourceMenu(
                                openResourceMenu === resource.id ? null : resource.id
                              )
                            }
                            className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <FaEllipsisV />
                          </button>
                          {openResourceMenu === resource.id && (
                            <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg border border-gray-200 rounded-lg z-20">
                              <ul className="py-1 text-sm">
                                {resource.type === "quiz" ? (
                                  <>
                                    <li>
                                      <button
                                        onClick={() => {
                                          setOpenQuiz(resource.id);
                                          setOpenResourceMenu(null);
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                                      >
                                        <FaEdit /> <span>Edit Quiz</span>
                                      </button>
                                    </li>
                                    <li>
                                      <button
                                        onClick={() => {
                                          setOpenResourceMenu(null);
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                                      >
                                        <FaQuestionCircle /> <span>Take Quiz</span>
                                      </button>
                                    </li>
                                  </>
                                ) : (
                                  <li>
                                    <a
                                      href={
                                        resource.type === "word"
                                          ? `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(
                                              resource.url
                                            )}`
                                          : resource.url
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50"
                                      onClick={() => setOpenResourceMenu(null)}
                                    >
                                      {resource.type === "video" ? (
                                        <FaPlay />
                                      ) : (
                                        <FaExternalLinkAlt />
                                      )}
                                      <span>
                                        {resource.type === "video"
                                          ? "Watch"
                                          : resource.type === "word"
                                          ? "Open Word"
                                          : "Open PDF"}
                                      </span>
                                    </a>
                                  </li>
                                )}
                                <li>
                                  <button
                                    onClick={() => {
                                      requestDeleteResource(lesson.id, resource.id);
                                      setOpenResourceMenu(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2"
                                  >
                                    <FaTrash /> <span>Delete</span>
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
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <FaFile className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No lessons yet
            </h3>
            <p className="text-gray-600">
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