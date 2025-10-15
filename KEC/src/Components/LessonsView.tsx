import React, { useState, useEffect } from "react";
import ModuleManagement from "../Components/ModuleManagement";
import { useParams } from "react-router-dom";
import { useCreateLessonMutation } from "../state/api/lessonApi";
import { useGetCourseDataQuery } from "../state/api/courseApi";
import { X, MoreVertical, Eye, Trash2, Upload, Edit3 } from "lucide-react";
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
  maxStudents: number;
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
    maxStudents: 0,
    isOpen: false,
  },
};

const LessonsView = () => {
  const { id } = useParams();
  const {
    data: courseData,
    isLoading,
    error,
  } = useGetCourseDataQuery(Number(id));
  const [addLesson] = useCreateLessonMutation();

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
        maxStudents: data.maximum || 0,
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
      const { data } = await addLesson({
        courseId: Number(id),
        title: title.trim(),
        description: description.trim(),
      });
      toast.success(data?.message);
    } catch (error: any) {
      toast.error(
        error?.data?.message || error?.message || "Failed to create lesson"
      );
    }

    updateModals({ showAddModule: false });
    resetForm("lesson");
  };

  const handleDeleteCourse = () => {
    updateModals({ showCourseOptions: false, showDeleteConfirm: true });
  };

  const confirmDeleteCourse = () => {
    console.log("Course deleted:", (courseData as CourseData)?.id);
    updateModals({ showDeleteConfirm: false });
  };

  const handleEditCourse = () => {
    updateModals({ showCourseOptions: false, showEditForm: true });
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    formType: "course" | "resource"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
      if (formType === "course") {
        updateForm("course", {
          imageFile: file,
          imagePreview: e.target?.result as string,
        });
      } else {
        updateForm("resource", { file, preview: e.target?.result as string });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateCourse = () => {
    const { course } = forms;

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
    if (course.maxStudents <= 0) {
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

      console.log(
      "Updating course with:",
      Object.fromEntries(courseFormData.entries())
    );

    // TODO: Call updateCourse mutation here
    // Example:
    // updateCourse(courseFormData).unwrap().then(() => {
    //   toast.success("Course updated successfully");
    //   updateModals({ showEditForm: false });
    // }).catch((error) => {
    //   toast.error(error?.data?.message || "Failed to update course");
    // });

    toast.success("Course updated successfully!");
    updateModals({ showEditForm: false });
  };

  const handleAddResource = (lessonId: number) => {
    const { title, file } = forms.resource;

    if (!title.trim()) {
      toast.error("Please enter a resource title");
      return;
    }
    if (!file) {
      toast.error("Please select a resource file");
      return;
    }

    const resourceFormData = new FormData();
    resourceFormData.append("lessonId", String(lessonId));
    resourceFormData.append("title", title.trim());
    resourceFormData.append("file", file);

      console.log(
      "Adding resource:",
      Object.fromEntries(resourceFormData.entries())
    );

    // TODO: Call addResource mutation here
    toast.success("Resource added successfully!");
    updateModals({ showAddResource: null });
    resetForm("resource");
  };

  const handleDeleteResource = (lessonId: number, resourceId: number) => {
    console.log("Deleting resource:", { lessonId, resourceId });
    // TODO: Call deleteResource mutation here
    toast.success("Resource deleted successfully!");
  };

  // Computed values
  const lessons = (courseData as CourseData)?.lesson || [];
  const unlockedCount = lessons.length;
  const totalResources = lessons.reduce(
    (acc, l) => acc + (l.resources?.length || 0),
    0
  );

  // Loading and error states
  if (isLoading) return <p>Loading course data...</p>;
  if (error) return <p>Error loading course data.</p>;

  // UI Components
  const ModalHeader = ({
    title,
    onClose,
  }: {
    title: string;
    onClose: () => void;
  }) => (
            <div className="px-6 pt-3 rounded-t-xl flex justify-between items-center">
      <h2 className="text-xl font-bold text-[#034153]">{title}</h2>
              <button
        onClick={onClose}
        className="text-gray-700 hover:bg-gray-30 p-2 mt-2 rounded-lg transition-all cursor-pointer"
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
  }: {
    onPrimary: () => void;
    onSecondary: () => void;
    primaryText: string;
    secondaryText: string;
    disabled?: boolean;
  }) => (
              <div className="flex gap-3 pt-2">
                <button
        onClick={onPrimary}
        disabled={disabled}
        className="flex-1 bg-[#034153] text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
                >
        {primaryText}
                </button>
                <button
        onClick={onSecondary}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-all border border-gray-300 hover:shadow-md cursor-pointer"
                >
        {secondaryText}
                </button>
              </div>
  );

  const FileUploadArea = ({
    onFileSelect,
    file,
    preview,
    accept = "*/*",
    description = "PDF, DOC, JPG, etc. up to 10MB",
  }: {
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    file: File | null;
    preview?: string;
    accept?: string;
    description?: string;
  }) => (
          <label className="w-full cursor-pointer">
            <div className="border-2 border-dashed border-[#004e64]/30 rounded-xl p-6 hover:border-[#004e64] hover:bg-[#004e64]/5 transition-all text-center">
              <div className="flex flex-col items-center gap-2">
          <Upload className="w-12 h-12 text-[#004e64]/60" />
                <span className="text-[#004e64] font-medium">
            {file ? file.name : "Click to upload"}
                </span>
          <span className="text-xs text-gray-500">{description}</span>
              </div>
            </div>
            <input
              type="file"
        accept={accept}
        onChange={onFileSelect}
              className="hidden"
            />

      {preview && (
        <div className="mt-4 text-center">
          <img
            src={preview}
            alt="Preview"
            className="max-h-32 mx-auto rounded border border-gray-300 object-contain"
          />
        </div>
      )}
          </label>
  );

  const ResourcePreview = () => {
    const { resource } = forms;
    if (!resource.file) return null;

    return (
            <div className="mt-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
              {resource.file.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
              Size: {(resource.file.size / 1024 / 1024).toFixed(2)} MB
              {resource.file.type && ` • Type: ${resource.file.type}`}
                  </p>
                </div>
                
                <div className="relative">
                  <button
              onClick={() =>
                updateForm("resource", { dropdownOpen: !resource.dropdownOpen })
              }
                    className="p-2 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors"
                  >
              <MoreVertical size={20} />
                  </button>

            {resource.dropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                  onClick={() =>
                    updateForm("resource", { dropdownOpen: false })
                  }
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                        <button
                          onClick={() => {
                      if (resource.preview)
                        window.open(resource.preview, "_blank");
                      updateForm("resource", { dropdownOpen: false });
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                    <Eye className="w-4 h-4 mr-2" /> View Resource
                        </button>
                        <button
                          onClick={() => {
                      resetForm("resource");
                      updateForm("resource", { dropdownOpen: false });
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                    <Trash2 className="w-4 h-4 mr-2" /> Remove File
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
        {resource.file.type.startsWith("image/") && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-2">Preview:</p>
                  <img 
              src={resource.preview}
                    alt="Preview" 
                    className="max-h-32 rounded border border-gray-300 object-contain"
                  />
                </div>
              )}
                </div>
    );
  };

  const EditCourseModal = () => {
    // Initialize local form state (you can preload with backend data if needed)
    const [forms, setForms] = useState<FormState>({
      lesson: { title: "", description: "" },
      resource: { title: "", file: null, preview: "" },
      course: {
        title: "",
        description: "",
        image: "",
        imageFile: null,
        imagePreview: "",
        price: "",
        maxStudents: 0,
        isOpen: false,
      },
    });
  
    const [loading, setLoading] = useState(false);
    const [showEditForm, setShowEditForm] = useState(true); // for toggling modal visibility
  
    // ✅ Update nested form fields properly
    const updateForm = (section: keyof FormState, data: Partial<FormState[typeof section]>) => {
      setForms((prev) => ({
        ...prev,
        [section]: { ...prev[section], ...data },
      }));
    };
  
    // ✅ Handle file upload for image with preview
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const preview = URL.createObjectURL(file);
      updateForm("course", { imageFile: file, imagePreview: preview });
    };
  
    // ✅ Submit update request to backend
    const handleUpdateCourse = async () => {
      const { course } = forms;
      try {
        setLoading(true);
        const formData = new FormData();
        formData.append("title", course.title);
        formData.append("description", course.description);
        formData.append("price", course.price);
        formData.append("maxStudents", course.maxStudents.toString());
        formData.append("isOpen", course.isOpen.toString());
        if (course.imageFile) formData.append("image", course.imageFile);
  
        const res = await fetch("http://localhost:4000/api/courses/update", {
          method: "PUT",
          body: formData,
        });
  
        if (!res.ok) throw new Error("Failed to update course");
        const data = await res.json();
        alert("Course updated successfully!");
        console.log("Updated course:", data);
        setShowEditForm(false);
      } catch (error) {
        console.error(error);
        alert("Error updating course!");
      } finally {
        setLoading(false);
      }
    };
  
    // ✅ Reset form
    const resetCourseForm = () => {
      setForms((prev) => ({
        ...prev,
        course: {
          title: "",
          description: "",
          image: "",
          imageFile: null,
          imagePreview: "",
          price: "",
          maxStudents: 0,
          isOpen: false,
        },
      }));
    };
  
    if (!showEditForm) return null;
  
    const { course } = forms;
  
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all max-h-[90vh] overflow-y-auto">
          <ModalHeader
            title="Edit Course"
            onClose={() => {
              setShowEditForm(false);
              resetCourseForm();
            }}
          />
  
          <div className="p-6 space-y-6">
            {/* Course Image */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Course Image
              </label>
              <FileUploadArea
                onFileSelect={handleFileUpload}
                file={course.imageFile}
                preview={course.imagePreview || course.image}
                accept="image/*"
                description="JPG, PNG, etc. up to 10MB"
              />
            </div>

            {/* Course Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                Course Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                placeholder="Enter course title"
                value={course.title}
                onChange={(e) => updateForm("course", { title: e.target.value })}
                className="w-full border border-gray-200 px-3 py-3 rounded-lg focus:border-[#034153] transition-all outline-none"
              />
            </div>
  
            {/* Course Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Course Description <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Describe your course..."
                value={course.description}
                  onChange={(e) =>
                  updateForm("course", { description: e.target.value })
                  }
                rows={4}
                className="w-full border border-gray-200 focus:border-[#034153] px-3 py-2 rounded-lg transition-all outline-none resize-none"
                />
              </div>

            {/* Price and Max Students */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Course Price ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={course.price}
                  onChange={(e) =>
                    updateForm("course", { price: e.target.value })
                  }
                  className="w-full border border-gray-200 px-3 py-3 rounded-lg focus:border-[#034153] transition-all outline-none"
                  min="0"
                  step="0.01"
                />
                    </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Maximum Students <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={course.maxStudents}
                  onChange={(e) =>
                    updateForm("course", { maxStudents: Number(e.target.value) })
                  }
                  className="w-full border border-gray-200 px-3 py-3 rounded-lg focus:border-[#034153] transition-all outline-none"
                  min="1"
                />
                  </div>
            </div>
  
            {/* Course Status */}
            <div className="flex items-center gap-3">
                  <input
                type="checkbox"
                id="courseStatus"
                checked={course.isOpen}
                onChange={(e) =>
                  updateForm("course", { isOpen: e.target.checked })
                }
                className="w-4 h-4 text-[#034153] border-gray-300 rounded focus:ring-[#034153]"
              />
              <label
                htmlFor="courseStatus"
                className="text-sm font-semibold text-gray-700"
              >
                Course is open for enrollment
                </label>
            </div>
  
            {/* Buttons */}
            <ActionButtons
              onPrimary={handleUpdateCourse}
              onSecondary={() => {
                setShowEditForm(false);
                resetCourseForm();
              }}
              primaryText={loading ? "Updating..." : "Update Course"}
              secondaryText="Cancel"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Header Section */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#004e64] via-[#025a73] to-blue-600 bg-clip-text text-transparent">
            {courseData?.title} Lessons
          </h1>
          <p className="text-md text-gray-600 mt-2 max-w-2xl">
            Organize your course content, manage access permissions, and upload
            learning materials
          </p>
          <div className="flex mt-4 items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />{" "}
              {unlockedCount} Unlocked
            </span>
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />{" "}
              {totalResources} Resources
            </span>
          </div>
                      </div>

        <div className="flex gap-2 items-start">
          <button
            className="text-white px-4 py-2 rounded bg-[#034153] cursor-pointer transition-colors whitespace-nowrap"
            onClick={() => updateModals({ showAddModule: true })}
          >
            Add Lesson
          </button>
                      <div className="relative">
                        <button
              className="text-gray-700 cursor-pointer hover:bg-gray-200 px-3 py-2 rounded transition-colors text-xl font-bold"
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
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[#034153] shadow-lg rounded-md py-1 z-20">
                            <button
                    className="w-full text-left cursor-pointer px-4 py-2 hover:bg-gray-100 transition-colors flex items-center gap-2"
                    onClick={handleEditCourse}
                  >
                    <Edit3 size={16} /> Edit Course
                            </button>
                            <button
                    className="w-full text-left px-4 py-2 cursor-pointer hover:bg-red-50 text-red-600 transition-colors flex items-center gap-2"
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

      {/* Add Lesson Modal */}
      {modals.showAddModule && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all">
            <ModalHeader
              title="Create Your Lesson"
              onClose={() => {
                updateModals({ showAddModule: false });
                resetForm("lesson");
              }}
            />
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Lesson Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g: Thermodynamics"
                  value={forms.lesson.title}
                  onChange={(e) =>
                    updateForm("lesson", { title: e.target.value })
                  }
                  className="w-full border-1 border-gray-200 px-3 py-3 rounded-lg focus:border-[#034153] transition-all outline-none"
                />
                      </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Lesson Description
                </label>
                <textarea
                  placeholder="Provide a brief overview of what students will learn in this lesson..."
                  value={forms.lesson.description}
                  onChange={(e) =>
                    updateForm("lesson", { description: e.target.value })
                  }
                  rows={4}
                  className="w-full border-1 border-gray-200 focus:border-[#034153] px-3 py-2 rounded-lg transition-all outline-none resize-none"
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
              />
              </div>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {modals.showEditForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all max-h-[90vh] overflow-y-auto">
            <div className="px-6 pt-3 rounded-t-xl flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#034153]">Edit Course</h2>
              <button
                onClick={() => {
                  updateModals({ showEditForm: false });
                  resetCourseForm();
                }}
                className="text-gray-700 cursor-pointer hover:bg-gray-30 p-2 mt-2 rounded-lg transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Course Image */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Course Image
                </label>
                <label className="w-full cursor-pointer">
                  <div className="border-2 border-dashed border-[#004e64]/30 rounded-xl p-6 hover:border-[#004e64] hover:bg-[#004e64]/5 transition-all text-center">
                    <div className="flex flex-col items-center gap-2">
                      {forms.course.imagePreview ? (
                        <img src={forms.course.imagePreview} alt="Course preview" className="w-32 h-32 object-cover rounded-lg" />
                      ) : (
                        <svg className="w-12 h-12 text-[#004e64]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                      <span className="text-[#004e64] font-medium">
                        {forms.course.imageFile ? forms.course.imageFile.name : "Click to upload image"}
                      </span>
                      <span className="text-xs text-gray-500">JPG, PNG, etc. up to 10MB</span>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Course Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter course title"
                  value={forms.course.title}
                  onChange={(e) => updateForm("course", { title: e.target.value })}
                  className="w-full border border-gray-200 px-3 py-3 rounded-lg focus:border-[#034153] transition-all outline-none"
                />
              </div>

              {/* Course Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Course Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Describe your course..."
                  value={forms.course.description}
                  onChange={(e) => updateForm("course", { description: e.target.value })}
                  rows={4}
                  className="w-full border border-gray-200 focus:border-[#034153] px-3 py-2 rounded-lg transition-all outline-none resize-none"
                />
              </div>

              {/* Price and Max Students */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Course Price ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={forms.course.price}
                    onChange={(e) => updateForm("course", { price: e.target.value })}
                    className="w-full border border-gray-200 px-3 py-3 rounded-lg focus:border-[#034153] transition-all outline-none"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Maximum Students <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={forms.course.maxStudents}
                    onChange={(e) => updateForm("course", { maxStudents: Number(e.target.value) })}
                    className="w-full border border-gray-200 px-3 py-3 rounded-lg focus:border-[#034153] transition-all outline-none"
                    min="1"
                  />
                </div>
              </div>

              {/* Course Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="courseStatus"
                  checked={forms.course.isOpen}
                  onChange={(e) => updateForm("course", { isOpen: e.target.checked })}
                  className="w-4 h-4 text-[#034153] border-gray-300 rounded focus:ring-[#034153]"
                />
                <label htmlFor="courseStatus" className="text-sm font-semibold text-gray-700">
                  Course is open for enrollment
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleUpdateCourse}
                  className="flex-1 bg-[#034153] text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer"
                >
                  Update Course
                </button>
                <button
                  onClick={() => {
                    updateModals({ showEditForm: false });
                    resetCourseForm();
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-all border border-gray-300 hover:shadow-md cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Resource Modal */}
      {modals.showAddResource !== null && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all">
            <ModalHeader
              title="Add Resource"
              onClose={() => {
                    updateModals({ showAddResource: null });
                resetForm("resource");
              }}
            />
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Resource Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g: Lecture Notes"
                  value={forms.resource.title}
                  onChange={(e) =>
                    updateForm("resource", { title: e.target.value })
                  }
                  className="w-full border-1 border-gray-200 px-3 py-3 rounded-lg focus:border-[#034153] transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Resource File <span className="text-red-500">*</span>
                </label>
                <FileUploadArea
                  onFileSelect={(e) => handleFileUpload(e, "resource")}
                  file={forms.resource.file}
                />
                <ResourcePreview />
              </div>

              <ActionButtons
                onPrimary={() => handleAddResource(modals.showAddResource!)}
                onSecondary={() => {
                  updateModals({ showAddResource: null });
                  resetForm("resource");
                }}
                primaryText="Save Resource"
                secondaryText="Cancel"
                disabled={!forms.resource.file || !forms.resource.title.trim()}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {modals.showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-[#034153]">
              Confirm Delete
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this course? This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDeleteCourse}
                className="flex-1 bg-red-500 text-white px-4 py-3 cursor-pointer rounded-md hover:bg-red-600 transition-colors font-medium"
              >
                Delete Course
              </button>
              <button
                onClick={() => updateModals({ showDeleteConfirm: false })}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 cursor-pointer rounded-md hover:bg-gray-400 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Module Management */}
      <ModuleManagement
        lessons={lessons}
        onAddResource={(lessonId: number) =>
          updateModals({ showAddResource: lessonId })
        }
        onDeleteResource={handleDeleteResource}
      />
    </div>
  );
};

export default LessonsView;
