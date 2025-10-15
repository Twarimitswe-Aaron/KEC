import React, { useState, useEffect } from "react";
import ModuleManagement from "../Components/ModuleManagement";
import { useParams } from "react-router-dom";
import { 
  useCreateLessonMutation, 
  useDeleteLessonMutation 
} from "../state/api/lessonApi";
import { 
  useGetCourseDataQuery, 
  useUpdateCourseMutation, 
  useDeleteCourseMutation 
} from "../state/api/courseApi";
import { X, Edit3, Trash2, Image, BookOpen, Users } from "lucide-react";
import { toast } from "react-toastify";

// Types
interface CourseData {
  id: number;
  title: string;
  description: string;
  image_url: string;
  price: string;
  maximum: number;
  open: boolean;
  lesson: Lesson[];
}

interface Lesson {
  id: number;
  title: string;
  content: string;
  resources: Resource[];
}

interface Resource {
  id: number;
  url: string;
}

interface ModalStates {
  showAddModule: boolean;
  showCourseOptions: boolean;
  showEditForm: boolean;
  showDeleteConfirm: boolean;
  showAddResource: number | null;
}

interface FormState {
  lesson: { title: string; description: string };
  resource: {
    title: string;
    file: File | null;
    preview: string;
    dropdownOpen?: boolean;
  };
  course: {
    title: string;
    description: string;
    image: string;
    imageFile: File | null;
    imagePreview: string;
    price: string;
    maxStudents: number | null;
    isOpen: boolean;
  };
}

// Constants
const INITIAL_FORM_STATE: FormState = {
  lesson: { title: "", description: "" },
  resource: { title: "", file: null, preview: "" },
  course: {
    title: "",
    description: "",
    image: "",
    imageFile: null,
    imagePreview: "",
    price: "",
    maxStudents: null,
    isOpen: false,
  },
};

const LessonsView = () => {
  const { id } = useParams();
  const {
    data: courseData,
    isLoading,
    error,
    refetch: refetchCourse,
  } = useGetCourseDataQuery(Number(id));
  
  const [addLesson, { isLoading: isCreatingLesson }] = useCreateLessonMutation();
  const [updateCourse, { isLoading: isUpdatingCourse }] = useUpdateCourseMutation();
  const [deleteCourse, { isLoading: isDeletingCourse }] = useDeleteCourseMutation();

  // State
  const [modals, setModals] = useState<ModalStates>({
    showAddModule: false,
    showCourseOptions: false,
    showEditForm: false,
    showDeleteConfirm: false,
    showAddResource: null,
  });

  const [forms, setForms] = useState<FormState>(INITIAL_FORM_STATE);

  // Helper functions
  const updateModals = (updates: Partial<ModalStates>) => {
    setModals((prev) => ({ ...prev, ...updates }));
  };

  const updateForm = (
    form: keyof FormState,
    updates: Partial<FormState[keyof FormState]>
  ) => {
    setForms((prev) => ({ ...prev, [form]: { ...prev[form], ...updates } }));
  };

  const resetForm = (form: keyof FormState) => {
    setForms((prev) => ({ ...prev, [form]: INITIAL_FORM_STATE[form] }));
  };

  const resetCourseForm = () => {
    if (courseData) {
      const data = courseData as CourseData;
      updateForm("course", {
        title: data.title || "",
        description: data.description || "",
        image: data.image_url || "",
        imageFile: null,
        imagePreview: data.image_url || "",
        price: data.price || "",
        maxStudents: data.maximum || null,
        isOpen: data.open || false,
      });
    }
  };

  // Effects
  useEffect(() => {
    if (courseData) resetCourseForm();
  }, [courseData]);

  // Handlers
  const handleAddModule = async () => {
    const { title, description } = forms.lesson;

    if (!title.trim()) {
      toast.error("Please enter a lesson title");
      return;
    }
    if (!description.trim()) {
      toast.error("Please enter a lesson description");
      return;
    }

    try {
      const response = await addLesson({
        courseId: Number(id),
        title: title.trim(),
        description: description.trim(),
      }).unwrap();
      
      toast.success(response?.message || "Lesson created successfully");
      updateModals({ showAddModule: false });
      resetForm("lesson");
      refetchCourse(); // Refresh course data
    } catch (error: any) {
      toast.error(
        error?.data?.message || error?.message || "Failed to create lesson"
      );
    }
  };

  const handleDeleteCourse = () => {
    updateModals({ showCourseOptions: false, showDeleteConfirm: true });
  };

  const confirmDeleteCourse = async () => {
    try {
      const response = await deleteCourse(Number(id)).unwrap();
      toast.success(response?.message || "Course deleted successfully");
      updateModals({ showDeleteConfirm: false });
      // Navigate back to courses list
      window.history.back();
    } catch (error: any) {
      toast.error(
        error?.data?.message || error?.message || "Failed to delete course"
      );
      updateModals({ showDeleteConfirm: false });
    }
  };

  const handleEditCourse = () => {
    resetCourseForm();
    updateModals({ showCourseOptions: false, showEditForm: true });
  };

  const handleUpdateCourse = async () => {
    const { course } = forms;

    // Validation
    if (!course.title.trim()) {
      toast.error("Please enter a course title");
      return;
    }
    if (!course.description.trim()) {
      toast.error("Please enter a course description");
      return;
    }
    if (!course.price.trim()) {
      toast.error("Please enter a course price");
      return;
    }
    if (!course.maxStudents || course.maxStudents <= 0) {
      toast.error("Please enter a valid maximum number of students");
      return;
    }

    const courseFormData = new FormData();
    courseFormData.append("id", String(id));
    courseFormData.append("title", course.title.trim());
    courseFormData.append("description", course.description.trim());
    courseFormData.append("coursePrice", course.price.trim());
    courseFormData.append("maximum", String(course.maxStudents));
    courseFormData.append("open", String(course.isOpen));

    if (course.imageFile) {
      courseFormData.append("image", course.imageFile);
      courseFormData.append("imageChanged", "true");
    } else {
      courseFormData.append("image_url", course.image);
      courseFormData.append("imageChanged", "false");
    }

    try {
      const response = await updateCourse(courseFormData).unwrap();
      toast.success(response?.message || "Course updated successfully");
      updateModals({ showEditForm: false });
      refetchCourse(); // Refresh course data
    } catch (error: any) {
      toast.error(
        error?.data?.message || error?.message || "Failed to update course"
      );
    }
  };

  // Input handler for course form
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    key: keyof FormState["course"],
    type: "string" | "number" | "boolean" = "string"
  ) => {
    let value: any = e.target.value;

    if (type === "number") {
      value = value === "" ? null : Number(value);
    } else if (type === "boolean" && "checked" in e.target) {
      value = (e.target as HTMLInputElement).checked;
    }

    updateForm("course", { [key]: value });
  };

  // Computed values
  const lessons = (courseData as CourseData)?.lesson || [];
  const unlockedCount = lessons.length;
  const totalResources = lessons.reduce(
    (acc, l) => acc + (l.resources?.length || 0),
    0
  );

  // Loading and error states
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-[#034153] absolute top-0 left-0"></div>
        </div>
        <p className="text-gray-600 font-medium">Loading course data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 text-lg font-bold mb-2">Failed to Load Course</p>
          <p className="text-gray-600 mb-4">We couldn't fetch the course data. Please try again.</p>
          <button
            onClick={() => refetchCourse()}
            className="bg-[#034153] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#025a73] transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // UI Components
  const ModalHeader = ({
    title,
    subtitle,
    onClose,
  }: {
    title: string;
    subtitle?: string;
    onClose: () => void;
  }) => (
    <div className="bg-gradient-to-r from-[#034153] to-[#004e64] px-6 py-4 flex justify-between items-center rounded-t-2xl">
      <div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        {subtitle && <p className="text-[#a8dadc] text-sm mt-0.5">{subtitle}</p>}
      </div>
      <button
        onClick={onClose}
        className="text-white/90 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-200"
      >
        <X size={24} />
      </button>
    </div>
  );

  const ActionButtons = ({
    onPrimary,
    onSecondary,
    primaryText,
    secondaryText,
    disabled = false,
    loading = false,
  }: {
    onPrimary: () => void;
    onSecondary: () => void;
    primaryText: string;
    secondaryText: string;
    disabled?: boolean;
    loading?: boolean;
  }) => (
    <div className="flex gap-3 pt-2">
      <button
        onClick={onPrimary}
        disabled={disabled || loading}
        className="flex-1 bg-gradient-to-r from-[#034153] to-[#004e64] text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
      >
        {loading ? "Processing..." : primaryText}
      </button>
      <button
        onClick={onSecondary}
        disabled={loading}
        className="flex-1 bg-white hover:bg-gray-50 text-gray-700 px-6 py-3.5 rounded-xl font-bold transition-all border-2 border-gray-200 hover:border-gray-300 hover:shadow-md cursor-pointer disabled:opacity-50"
      >
        {secondaryText}
      </button>
    </div>
  );

  return (
    <div className="relative">
      {/* Header Section - Enhanced */}
      <div className="mb-8 bg-gradient-to-br from-[#034153]/5 to-[#004e64]/5 rounded-2xl p-6 border border-[#034153]/10">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#004e64] via-[#025a73] to-blue-600 bg-clip-text text-transparent">
              {courseData?.title}
            </h1>
            <p className="text-md text-gray-600 mt-2 max-w-2xl">
              Organize your course content, manage access permissions, and upload
              learning materials
            </p>
            <div className="flex mt-4 items-center gap-6 text-sm">
              <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                <BookOpen className="w-4 h-4 text-green-500" />
                <span className="font-semibold text-gray-700">{unlockedCount} Lessons</span>
              </span>
              <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="font-semibold text-gray-700">{totalResources} Resources</span>
              </span>
              <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                <Users className="w-4 h-4 text-purple-500" />
                <span className="font-semibold text-gray-700">Max {courseData?.maximum || 0}</span>
              </span>
            </div>
          </div>

          <div className="flex gap-2 items-start">
            <button
              className="bg-gradient-to-r from-[#034153] to-[#004e64] text-white px-5 py-2.5 rounded-xl cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-0.5 font-semibold whitespace-nowrap"
              onClick={() => updateModals({ showAddModule: true })}
            >
              + Add Lesson
            </button>
            <div className="relative">
              <button
                className="text-gray-700 cursor-pointer hover:bg-gray-200 px-3 py-2 rounded-xl transition-colors text-xl font-bold"
                onClick={() =>
                  updateModals({ showCourseOptions: !modals.showCourseOptions })
                }
              >
                ⋮
              </button>
              {modals.showCourseOptions && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => updateModals({ showCourseOptions: false })}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-[#034153]/20 shadow-xl rounded-xl py-1 z-20 overflow-hidden">
                    <button
                      className="w-full text-left cursor-pointer px-4 py-2.5 hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700 font-medium"
                      onClick={handleEditCourse}
                    >
                      <Edit3 size={16} /> Edit Course
                    </button>
                    <button
                      className="w-full text-left px-4 py-2.5 cursor-pointer hover:bg-red-50 text-red-600 transition-colors flex items-center gap-2 font-medium"
                      onClick={handleDeleteCourse}
                    >
                      <Trash2 size={16} /> Delete Course
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Lesson Modal - Enhanced */}
      {modals.showAddModule && (
        <div className="fixed inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all animate-in zoom-in-95 duration-200">
            <ModalHeader
              title="Create New Lesson"
              subtitle="Add a new lesson to your course"
              onClose={() => {
                updateModals({ showAddModule: false });
                resetForm("lesson");
              }}
            />
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">
                  Lesson Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Introduction to Thermodynamics"
                  value={forms.lesson.title}
                  onChange={(e) =>
                    updateForm("lesson", { title: e.target.value })
                  }
                  className="w-full bg-gray-50 border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-[#034153] focus:bg-white focus:ring-2 focus:ring-[#034153]/10 transition-all outline-none font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">
                  Lesson Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Provide a brief overview of what students will learn in this lesson..."
                  value={forms.lesson.description}
                  onChange={(e) =>
                    updateForm("lesson", { description: e.target.value })
                  }
                  rows={4}
                  className="w-full bg-gray-50 border-2 border-gray-200 focus:border-[#034153] focus:bg-white px-4 py-3 rounded-xl transition-all outline-none resize-none focus:ring-2 focus:ring-[#034153]/10 font-medium"
                />
              </div>
              <ActionButtons
                onPrimary={handleAddModule}
                onSecondary={() => {
                  updateModals({ showAddModule: false });
                  resetForm("lesson");
                }}
                primaryText="Create Lesson"
                secondaryText="Cancel"
                loading={isCreatingLesson}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Course Modal - Enhanced */}
      {modals.showEditForm && (
        <div className="fixed inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <ModalHeader
              title="Edit Course"
              subtitle="Update your course information"
              onClose={() => {
                updateModals({ showEditForm: false });
                resetCourseForm();
              }}
            />

            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Course Image */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">
                  Course Image
                </label>
                <label className="w-full cursor-pointer group">
                  <div className="relative border-2 border-dashed border-[#004e64]/30 rounded-xl p-8 hover:border-[#004e64] hover:bg-gradient-to-br hover:from-[#004e64]/5 hover:to-[#034153]/5 transition-all duration-300 text-center group-hover:shadow-lg">
                    <div className="flex flex-col items-center gap-3">
                      {forms.course.imagePreview ? (
                        <div className="relative">
                          <img
                            src={forms.course.imagePreview}
                            alt="Course preview"
                            className="w-40 h-40 object-cover rounded-xl shadow-md ring-2 ring-[#004e64]/20"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                            <Image className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#004e64]/10 to-[#034153]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Image className="w-12 h-12 text-[#004e64]" />
                        </div>
                      )}
                      <div className="space-y-1">
                        <span className="text-[#034153] font-semibold block group-hover:text-[#004e64] transition-colors">
                          {forms.course.imageFile
                            ? forms.course.imageFile.name
                            : "Click to upload image"}
                        </span>
                        <span className="text-xs text-gray-500 block">
                          JPG, PNG, or WEBP up to 10MB
                        </span>
                      </div>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        updateForm("course", {
                          imageFile: file,
                          imagePreview: URL.createObjectURL(file),
                        });
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Course Title */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">
                  Course Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Advanced Web Development"
                  value={forms.course.title}
                  onChange={(e) => handleInputChange(e, "title")}
                  className="w-full bg-gray-50 border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-[#034153] focus:bg-white focus:ring-2 focus:ring-[#034153]/10 transition-all outline-none font-medium"
                />
              </div>

              {/* Course Description */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">
                  Course Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Provide a detailed description of what students will learn..."
                  value={forms.course.description}
                  onChange={(e) => handleInputChange(e, "description")}
                  rows={4}
                  className="w-full bg-gray-50 border-2 border-gray-200 focus:border-[#034153] focus:bg-white px-4 py-3 rounded-xl transition-all outline-none resize-none focus:ring-2 focus:ring-[#034153]/10 font-medium"
                />
              </div>

              {/* Price and Max Students */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    Course Price (RWF) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₣</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={forms.course.price}
                      onChange={(e) => handleInputChange(e, "price", "string")}
                      className="w-full bg-gray-50 border-2 border-gray-200 pl-9 pr-4 py-3 rounded-xl focus:border-[#034153] focus:bg-white focus:ring-2 focus:ring-[#034153]/10 transition-all outline-none font-medium"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    Maximum Students <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 100"
                    value={forms.course.maxStudents ?? ""}
                    onChange={(e) =>
                      handleInputChange(e, "maxStudents", "number")
                    }
                    className="w-full bg-gray-50 border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-[#034153] focus:bg-white focus:ring-2 focus:ring-[#034153]/10 transition-all outline-none font-medium"
                    min="1"
                  />
                </div>
              </div>

              {/* Course Status */}
              <div className="bg-gradient-to-r from-[#034153]/5 to-[#004e64]/5 border-2 border-[#034153]/10 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="courseStatus"
                    checked={forms.course.isOpen}
                    onChange={(e) =>
                      updateForm("course", { isOpen: e.target.checked })
                    }
                    className="w-5 h-5 text-[#034153] border-gray-300 rounded focus:ring-[#034153] cursor-pointer"
                  />
                  <label
                    htmlFor="courseStatus"
                    className="text-sm font-bold text-gray-800 cursor-pointer flex-1"
                  >
                    Course is open for enrollment
                  </label>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${forms.course.isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {forms.course.isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <ActionButtons
                onPrimary={handleUpdateCourse}
                onSecondary={() => {
                  updateModals({ showEditForm: false });
                  resetCourseForm();
                }}
                primaryText="Update Course"
                secondaryText="Cancel"
                loading={isUpdatingCourse}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - Enhanced */}
      {modals.showDeleteConfirm && (
        <div className="fixed inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-center text-gray-900">
              Delete Course?
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              Are you sure you want to delete <span className="font-semibold">"{courseData?.title}"</span>? This action cannot be undone and all lessons will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDeleteCourse}
                disabled={isDeletingCourse}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3.5 cursor-pointer rounded-xl hover:shadow-lg transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {isDeletingCourse ? "Deleting..." : "Delete Course"}
              </button>
              <button
                onClick={() => updateModals({ showDeleteConfirm: false })}
                disabled={isDeletingCourse}
                className="flex-1 bg-white border-2 border-gray-200 text-gray-700 px-4 py-3.5 cursor-pointer rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-bold disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Module Management */}
      <ModuleManagement lessons={lessons} />
    </div>
  );
};

export default LessonsView;