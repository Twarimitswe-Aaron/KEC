import React, { useState, useEffect } from "react";
import ModuleManagement from "../Components/ModuleManagement";
import { useParams } from "react-router-dom";
import { useCreateLessonMutation } from "../state/api/lessonApi";
import { useGetCourseDataQuery } from "../state/api/courseApi";
// Import mutation hooks (uncomment when available)
// import { useUpdateCourseMutation, useCreateLessonMutation, useAddResourceMutation, useDeleteResourceMutation } from '../state/api/courseApi';
import { X, MoreVertical } from "lucide-react";
import { toast } from "react-toastify";

// Define types
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

// State interfaces
interface ModalStates {
  showAddModule: boolean;
  showCourseOptions: boolean;
  showEditForm: boolean;
  showDeleteConfirm: boolean;
  showAddResource: number | null;
}

interface ResourceFormState {
  title: string;
  file: File | null;
  preview: string;
  dropdownOpen?: boolean; // Add this line
}

interface LessonFormState {
  title: string;
  description: string;
}

interface ResourceFormState {
  title: string;
  file: File | null;
  preview: string;
}

interface CourseFormState {
  title: string;
  description: string;
  image: string;
  imageFile: File | null;
  imagePreview: string;
  price: string;
  maxStudents: number;
  isOpen: boolean;
}

const LessonsView = () => {
  const { id } = useParams();
  const {
    data: courseData,
    isLoading,
    error,
  } = useGetCourseDataQuery(Number(id));
  const [addLesson] = useCreateLessonMutation();

  // Mutation hooks (uncomment when implemented)
  // const [updateCourse, { isLoading: isUpdatingCourse }] = useUpdateCourseMutation();
  // const [createLesson, { isLoading: isCreatingLesson }] = useCreateLessonMutation();
  // const [addResource, { isLoading: isAddingResource }] = useAddResourceMutation();
  // const [deleteResource, { isLoading: isDeletingResource }] = useDeleteResourceMutation();

  // Organized state objects
  const [modals, setModals] = useState<ModalStates>({
    showAddModule: false,
    showCourseOptions: false,
    showEditForm: false,
    showDeleteConfirm: false,
    showAddResource: null,
  });

  const [lessonForm, setLessonForm] = useState<LessonFormState>({
    title: "",
    description: "",
  });

  const [resourceForm, setResourceForm] = useState<ResourceFormState>({
    title: "",
    file: null,
    preview: "",
  });

  const [courseForm, setCourseForm] = useState<CourseFormState>({
    title: "",
    description: "",
    image: "",
    imageFile: null,
    imagePreview: "",
    price: "",
    maxStudents: 0,
    isOpen: false,
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Helper functions for state updates
  const updateModals = (updates: Partial<ModalStates>) => {
    setModals((prev) => ({ ...prev, ...updates }));
  };

  const updateLessonForm = (updates: Partial<LessonFormState>) => {
    setLessonForm((prev) => ({ ...prev, ...updates }));
  };

  const updateResourceForm = (updates: Partial<ResourceFormState>) => {
    setResourceForm((prev) => ({ ...prev, ...updates }));
  };

  const updateCourseForm = (updates: Partial<CourseFormState>) => {
    setCourseForm((prev) => ({ ...prev, ...updates }));
  };

  // Reset functions
  const resetLessonForm = () => {
    setLessonForm({ title: "", description: "" });
  };

  const resetResourceForm = () => {
    setResourceForm({ title: "", file: null, preview: "" });
  };

  const resetCourseForm = () => {
    if (courseData) {
      const data = courseData as CourseData;
      setCourseForm({
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

  // Effect to populate course form when courseData is available
  useEffect(() => {
    if (courseData) {
      resetCourseForm();
    }
  }, [courseData]);

  if (isLoading) return <p>Loading course data...</p>;
  if (error) return <p>Error loading course data.</p>;

  const lessons = (courseData as CourseData)?.lesson || [];
  const unlockedCount = lessons.length;
  const lockedCount = 0;
  const totalResources = lessons.reduce(
    (acc, l) => acc + (l.resources?.length || 0),
    0
  );

  // Handlers for Course and Lesson
  const handleAddModule = async () => {
    const title = lessonForm.title.trim();
    const description = lessonForm.description.trim();

    if (!title) {
      toast.error("Please enter a lesson title");
      return;
    } else if (!description) {
      toast.error("Please enter a lesson description");
      return;
    }
    try {
      const { data } = await addLesson({
        courseId: Number(id),
        title,
        description,
      });
      toast.success(data?.message);
    } catch (error: any) {
      toast.error(
        error?.data?.message || error?.message || "Failed to create lesson"
      );
    }
    // TODO: Call createLesson(lessonFormData)
    updateModals({ showAddModule: false });
    resetLessonForm();
  };

  const handleDeleteCourse = () => {
    updateModals({ showCourseOptions: false, showDeleteConfirm: true });
  };

  const confirmDeleteCourse = () => {
    console.log("Course deleted:", (courseData as CourseData)?.id);
    // TODO: Call backend API to delete course
    updateModals({ showDeleteConfirm: false });
  };

  const handleEditCourse = () => {
    updateModals({ showCourseOptions: false, showEditForm: true });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateCourseForm({ imageFile: file });
      const reader = new FileReader();
      reader.onload = (e) => {
        updateCourseForm({ imagePreview: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    } else {
      updateCourseForm({
        imageFile: null,
        imagePreview: courseData?.image_url || "",
      });
    }
  };

  const handleUpdateCourse = () => {
    const courseFormData = new FormData();
    courseFormData.append("id", String(id));
    courseFormData.append("title", courseForm.title);
    courseFormData.append("description", courseForm.description);
    courseFormData.append("coursePrice", courseForm.price);
    courseFormData.append("maximum", String(courseForm.maxStudents));
    courseFormData.append("open", String(courseForm.isOpen));

    if (courseForm.imageFile) {
      courseFormData.append("image", courseForm.imageFile);
      courseFormData.append("imageChanged", "true");
    } else {
      courseFormData.append("image_url", courseForm.image);
      courseFormData.append("imageChanged", "false");
    }

    console.log("Preparing to update course with FormData:");
    for (const [key, value] of courseFormData.entries()) {
      console.log(
        `${key}: ${
          typeof value === "object" && value instanceof File
            ? value.name
            : value
        }`
      );
    }

    // TODO: Call updateCourse(courseFormData)
    updateModals({ showEditForm: false });
  };

  // Resource Handlers
  const handleResourceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateResourceForm({ file });
      const reader = new FileReader();
      reader.onload = (e) => {
        updateResourceForm({ preview: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    } else {
      updateResourceForm({ file: null, preview: "" });
    }
  };

  const handleAddResource = (lessonId: number) => {
    const title = resourceForm.title.trim();
    if (!title) {
      toast.error("Please enter a resource title");
      return;
    }
    if (!resourceForm.file) {
      toast.error("Please select a resource file");
      return;
    }

    const resourceFormData = new FormData();
    resourceFormData.append("lessonId", String(lessonId));
    resourceFormData.append("title", title);
    resourceFormData.append("file", resourceForm.file);

    console.log("Preparing to add resource with FormData:");
    for (const [key, value] of resourceFormData.entries()) {
      console.log(
        `${key}: ${
          typeof value === "object" && value instanceof File
            ? value.name
            : value
        }`
      );
    }

    // TODO: Call addResource(resourceFormData)
    updateModals({ showAddResource: null });
    resetResourceForm();
  };

  const handleDeleteResource = (lessonId: number, resourceId: number) => {
    const resourceFormData = new FormData();
    resourceFormData.append("lessonId", String(lessonId));
    resourceFormData.append("resourceId", String(resourceId));

    console.log("Preparing to delete resource with FormData:");
    for (const [key, value] of resourceFormData.entries()) {
      console.log(`${key}: ${value}`);
    }

    // TODO: Call deleteResource(resourceFormData)
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
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              {unlockedCount} Unlocked
            </span>
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              {lockedCount} Locked
            </span>
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
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
                    className="w-full text-left cursor-pointer px-4 py-2 hover:bg-gray-100 transition-colors"
                    onClick={handleEditCourse}
                  >
                    Edit Course
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 cursor-pointer hover:bg-red-50 text-red-600 transition-colors"
                    onClick={handleDeleteCourse}
                  >
                    Delete Course
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add Lesson/Module Modal */}
      {modals.showAddModule && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all">
            <div className="px-6 pt-3 rounded-t-xl flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-[#034153]">
                  Create Your Lesson
                </h2>
              </div>
              <button
                onClick={() => {
                  updateModals({ showAddModule: false });
                  resetLessonForm();
                }}
                className="text-gray-700 cursor-pointer hover:bg-gray-30 p-2 mt-2 rounded-lg transition-all"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Lesson Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g: Thermodynamics"
                  value={lessonForm.title}
                  onChange={(e) => updateLessonForm({ title: e.target.value })}
                  className="w-full border-1 border-gray-200 px-3 py-3 rounded-lg focus:border-[#034153] transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Lesson Description
                </label>
                <textarea
                  placeholder="Provide a brief overview of what students will learn in this lesson..."
                  value={lessonForm.description}
                  onChange={(e) =>
                    updateLessonForm({ description: e.target.value })
                  }
                  rows={4}
                  className="w-full border-1 border-gray-200 focus:border-[#034153] px-3 py-2 rounded-lg transition-all outline-none resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddModule}
                  className="flex-1 bg-[#034153] cursor-pointer text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Create Lesson
                </button>
                <button
                  onClick={() => {
                    updateModals({ showAddModule: false });
                    resetLessonForm();
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

{modals.showAddResource !== null && (
  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all">
      {/* Header */}
      <div className="px-6 pt-3 rounded-t-xl flex justify-between items-center">
        <h2 className="text-xl font-bold text-[#034153]">Add Resource</h2>
        <button
          onClick={() => {
            updateModals({ showAddResource: null });
            resetResourceForm();
          }}
          className="text-gray-700 cursor-pointer hover:bg-gray-30 p-2 mt-2 rounded-lg transition-all"
        >
          <X size={24} />
        </button>
      </div>

      {/* Body */}
      <div className="p-6 space-y-5">
        {/* Title input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Resource Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g: Lecture Notes"
            value={resourceForm.title}
            onChange={(e) => updateResourceForm({ title: e.target.value })}
            className="w-full border-1 border-gray-200 px-3 py-3 rounded-lg focus:border-[#034153] transition-all outline-none"
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Resource File <span className="text-red-500">*</span>
          </label>
          <label className="w-full cursor-pointer">
            <div className="border-2 border-dashed border-[#004e64]/30 rounded-xl p-6 hover:border-[#004e64] hover:bg-[#004e64]/5 transition-all text-center">
              <div className="flex flex-col items-center gap-2">
                <svg
                  className="w-12 h-12 text-[#004e64]/60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span className="text-[#004e64] font-medium">
                  {resourceForm.file
                    ? resourceForm.file.name
                    : "Click to upload resource"}
                </span>
                <span className="text-xs text-gray-500">
                  PDF, DOC, JPG, etc. up to 10MB
                </span>
              </div>
            </div>
            <input
              type="file"
              accept="*/*"
              onChange={handleResourceFileUpload}
              className="hidden"
            />
          </label>

          {/* Preview Section with Three Dots Dropdown */}
          {resourceForm.file && (
            <div className="mt-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    {resourceForm.file.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Size: {(resourceForm.file.size / 1024 / 1024).toFixed(2)} MB
                    {resourceForm.file.type && ` • Type: ${resourceForm.file.type}`}
                  </p>
                </div>
                
                {/* Three dots dropdown */}
                <div className="relative">
                  <button
                    onClick={() => updateResourceForm({ dropdownOpen: !resourceForm.dropdownOpen })}
                    className="p-2 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>

                  {resourceForm.dropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => updateResourceForm({ dropdownOpen: false })}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                        <button
                          onClick={() => {
                            // Open file in new tab for preview
                            if (resourceForm.preview) {
                              window.open(resourceForm.preview, '_blank');
                            }
                            updateResourceForm({ dropdownOpen: false });
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Resource
                        </button>
                        <button
                          onClick={() => {
                            resetResourceForm();
                            updateResourceForm({ dropdownOpen: false });
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Remove File
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* File type specific preview */}
              {resourceForm.file.type.startsWith('image/') && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-2">Preview:</p>
                  <img 
                    src={resourceForm.preview} 
                    alt="Preview" 
                    className="max-h-32 rounded border border-gray-300 object-contain"
                  />
                </div>
              )}
              {resourceForm.file.type.startsWith('application/pdf') && (
                <div className="mt-3 flex items-center text-sm text-gray-600">
                  <svg className="w-8 h-8 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  PDF Document
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => handleAddResource(modals.showAddResource!)}
            disabled={!resourceForm.file || !resourceForm.title.trim()}
            className="flex-1 bg-[#034153] text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
          >
            Save Resource
          </button>
          <button
            onClick={() => {
              updateModals({ showAddResource: null });
              resetResourceForm();
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

      {/* Edit Course Modal */}
      {modals.showAddResource !== null && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all">
            <div className="px-6 pt-3 rounded-t-xl flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#034153]">Add Resource</h2>
              <button
                onClick={() => {
                  updateModals({ showAddResource: null });
                  resetResourceForm();
                }}
                className="text-gray-700 cursor-pointer hover:bg-gray-30 p-2 mt-2 rounded-lg transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Resource Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Resource Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g: Lecture Notes"
                  value={resourceForm.title}
                  onChange={(e) =>
                    updateResourceForm({ title: e.target.value })
                  }
                  className="w-full border-1 border-gray-200 px-3 py-3 rounded-lg focus:border-[#034153] transition-all outline-none"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Resource File <span className="text-red-500">*</span>
                </label>
                <label className="w-full cursor-pointer">
                  <div className="border-2 border-dashed border-[#004e64]/30 rounded-xl p-6 hover:border-[#004e64] hover:bg-[#004e64]/5 transition-all text-center">
                    <div className="flex flex-col items-center gap-2">
                      <svg
                        className="w-12 h-12 text-[#004e64]/60"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <span className="text-[#004e64] font-medium">
                        {resourceForm.file
                          ? resourceForm.file.name
                          : "Click to upload resource"}
                      </span>
                      <span className="text-xs text-gray-500">
                        PDF, DOC, JPG, etc. up to 10MB
                      </span>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="*/*"
                    onChange={handleResourceFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Preview Section */}
                {resourceForm.preview && (
                  <div className="mt-6 border rounded-lg p-4 bg-gray-50 relative">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-semibold text-gray-700">
                          {resourceForm.file?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {resourceForm.file
                            ? `${(resourceForm.file.size / 1024).toFixed(1)} KB`
                            : ""}
                        </p>
                      </div>

                      {/* Three Dots Menu */}
                      <div className="relative">
                        <button
                          onClick={() => setShowMenu((prev) => !prev)}
                          className="p-2 hover:bg-gray-200 rounded-full transition-all"
                        >
                          <MoreVertical size={18} />
                        </button>
                        {showMenu && (
                          <div className="absolute right-0 mt-2 w-28 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                            <button
                              onClick={() => {
                                window.open(resourceForm.preview, "_blank");
                                setShowMenu(false);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            >
                              Open
                            </button>
                            <button
                              onClick={() => {
                                resetResourceForm();
                                setShowMenu(false);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* File Preview */}
                    {resourceForm.file?.type.startsWith("image/") ? (
                      <img
                        src={resourceForm.preview}
                        alt="preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-sm text-gray-600 italic">
                        Preview not available for this file type.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleAddResource(modals.showAddResource!)}
                  className="flex-1 bg-[#034153] cursor-pointer text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Save Resource
                </button>
                <button
                  onClick={() => {
                    updateModals({ showAddResource: null });
                    resetResourceForm();
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

      {/* Delete Confirmation Modal */}
      {modals.showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-[#034153]">
              Confirm Delete
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this course? This action cannot be
              undone and will remove all associated lessons, and assignments.
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
