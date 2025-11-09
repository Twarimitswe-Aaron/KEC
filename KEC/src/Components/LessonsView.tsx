import React, { useState, useEffect, useContext, useMemo } from "react";
import ModuleManagement from "../Components/ModuleManagement";
import { useParams } from "react-router-dom";
import { useCreateLessonMutation } from "../state/api/lessonApi";
import {
  useGetCourseDataQuery,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
} from "../state/api/courseApi";
import { X, Edit3, Trash2, Image, BookOpen, Users } from "lucide-react";
import { toast } from "react-toastify";
import { SearchContext } from "../SearchContext";

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
  content: string; // Used for searching the lesson description/body
  resources: Resource[];
}

interface Resource {
  id: number;
  type?: "multiple" | "checkbox" | "truefalse" | "labeling";
  title: string;
  description?: string;
  url: string;
}

interface Lesson {
  id: number;
  title: string;
  content: string;
  resources: Resource[];
}

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

// Type guard to check if data matches CourseData structure
function isCourseData(data: any): data is CourseData {
  return (
    data &&
    typeof data === "object" &&
    Array.isArray(data.lesson) &&
    data.lesson.every(
      (lesson: any) =>
        lesson &&
        typeof lesson.id === "number" &&
        typeof lesson.title === "string" &&
        typeof lesson.content === "string" &&
        Array.isArray(lesson.resources)
    )
  );
}


const transformToCourseData = (data: any): CourseData => {
  if (!data)
    return {
      id: 0,
      title: "",
      description: "",
      image_url: "",
      price: "0",
      maximum: 0,
      open: false,
      lesson: [],
    };

  return {
    ...data,
    lesson: Array.isArray(data.lesson)
      ? data.lesson.map((l: any) => ({
          ...l,
          resources: Array.isArray(l.resources)
            ? l.resources.map((r: any) => ({
                id: r.id || 0,
                type: r.type,
                title: r.title || "",
                description: r.description,
                url: r.url || "",
              }))
            : [],
        }))
      : [],
  };
};

const INITIAL_FORM_STATE = {
  lesson: { title: "", description: "" },
  resource: { title: "", file: null, preview: "" },
  course: {
    title: "",
    description: "",
    image: "",
    imageFile: null as File | null,
    imagePreview: "",
    price: "",
    maxStudents: null,
    isOpen: false,
  },
};

type FormKey = keyof typeof INITIAL_FORM_STATE;

const LessonsView = () => {
  const { searchQuery } = useContext(SearchContext);
  const { id } = useParams();
  const {
    data: courseData,
    isLoading,
    error,
    refetch: refetchCourse,
  } = useGetCourseDataQuery(Number(id));
  const [addLesson, { isLoading: isCreatingLesson }] =
    useCreateLessonMutation();
  const [updateCourse, { isLoading: isUpdatingCourse }] =
    useUpdateCourseMutation();
  const [deleteCourse, { isLoading: isDeletingCourse }] =
    useDeleteCourseMutation();

  

  const [modals, setModals] = useState({
    showAddModule: false,
    showCourseOptions: false,
    showEditForm: false,
    showDeleteConfirm: false,
    showAddResource: null,
  });
  const [forms, setForms] = useState(INITIAL_FORM_STATE); 

  const transformedCourseData = transformToCourseData(courseData);
  const baseLessons = isCourseData(transformedCourseData)
  ? transformedCourseData.lesson
  : [];
  console.log(baseLessons,"now let me check")



  const filteredLessons = useMemo(() => {
    if (!searchQuery || searchQuery.trim() === "") {
      return baseLessons;
    }

    const lowerCaseQuery = searchQuery.toLowerCase().trim();
 
    const filtered = baseLessons.filter((lesson) => {
      const title = lesson.title?.toLowerCase() || "";
      const content = lesson.content?.toLowerCase() || "";

      const titleMatch = title.includes(lowerCaseQuery);
      const contentMatch = content.includes(lowerCaseQuery);

     
      const resourceMatch = Array.isArray(lesson.resources)
        ? lesson.resources.some((resource) =>
            resource.url?.toLowerCase().includes(lowerCaseQuery)
          )
        : false;

      const isMatch = titleMatch || contentMatch || resourceMatch;
      return isMatch;
    });

    return filtered;
  }, [baseLessons, searchQuery]); 

  //tomorrow i weill start from here ineed you to help me to be working with this next

  const lessons = courseData?.lesson; 
  console.log(lessons, "filteredLessons");
  const updateModals = (updates: any) =>
    setModals((prev) => ({ ...prev, ...updates }));
  const updateForm = (form: FormKey, updates: any) =>
    setForms((prev) => ({ ...prev, [form]: { ...prev[form], ...updates } }));
  const resetForm = (form: FormKey) =>
    setForms((prev) => ({ ...prev, [form]: INITIAL_FORM_STATE[form] }));

  const resetCourseForm = () =>
    courseData &&
    updateForm("course", {
      title: courseData.title || "",
      description: courseData.description || "",
      image: courseData.image_url || "",
      imageFile: null,
      imagePreview: courseData.image_url || "",
      price: courseData.price || "",
      maxStudents: courseData.maximum || null,
      isOpen: courseData.open || false,
    });

  useEffect(() => {
    courseData && resetCourseForm();
  }, [courseData]);

  const handleAddModule = async () => {
    const { title, description } = forms.lesson;
    if (!title.trim() || !description.trim()) {
      toast.error(
        `Please enter ${
          !title.trim() ? "a lesson title" : "a lesson description"
        }`
      );
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
      refetchCourse();
    } catch (error: any) {
      toast.error(
        error?.data?.message || error?.message || "Failed to create lesson"
      );
    }
  };

  const handleDeleteCourse = () =>
    updateModals({ showCourseOptions: false, showDeleteConfirm: true });

  const confirmDeleteCourse = async () => {
    try {
      const response = await deleteCourse(Number(id)).unwrap();
      toast.success(response?.message || "Course deleted successfully");
      updateModals({ showDeleteConfirm: false });
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
    if (
      !course.title.trim() ||
      !course.description.trim() ||
      !course.price.trim() ||
      !course.maxStudents ||
      course.maxStudents <= 0
    ) {
      toast.error(
        !course.title.trim()
          ? "Please enter a course title"
          : !course.description.trim()
          ? "Please enter a course description"
          : !course.price.trim()
          ? "Please enter a course price"
          : "Please enter a valid maximum number of students"
      );
      return;
    }

    const courseFormData = new FormData();
    courseFormData.append("id", String(id));
    courseFormData.append("title", course.title.trim());
    courseFormData.append("description", course.description.trim());
    courseFormData.append("coursePrice", course.price.trim());
    courseFormData.append("maximum", String(course.maxStudents));
    courseFormData.append("open", String(course.isOpen));

    // Only append image file if it exists
    if (course.imageFile) {
      courseFormData.append("image", course.imageFile);
      courseFormData.append("imageChanged", "true");
    } else if (course.image) {
      courseFormData.append("image_url", course.image);
      courseFormData.append("imageChanged", "false");
    }

    try {
      const { message } = await updateCourse(courseFormData).unwrap();
      toast.success(message || "Course updated successfully");
      updateModals({ showEditForm: false });
      refetchCourse();
    } catch (error: any) {
      toast.error(
        error?.data?.message || error?.message || "Failed to update course"
      );
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    key: string,
    type = "string"
  ) => {
    let value: any = e.target.value;
    if (type === "number") value = value === "" ? null : Number(value);
    else if (type === "boolean" && "checked" in e.target)
      value = (e.target as HTMLInputElement).checked;
    updateForm("course", { [key]: value });
  };

  const unlockedCount = lessons.length;
  const totalResources = lessons.reduce(
    (acc, l) => acc + (l.resources?.length || 0),
    0
  );

  const LessonsViewSkeleton = () => {
    return (
      <div className="relative">
              
        <div className="mb-8 bg-gray-100 rounded-2xl p-6 border border-gray-200">
               
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                   
            <div className="flex-1">
                       
              <div className="h-8 bg-gray-300 rounded-lg w-3/4 mb-4 animate-pulse"></div>
                       
              <div className="h-4 bg-gray-300 rounded w-full mb-2 animate-pulse"></div>
                       
              <div className="h-4 bg-gray-300 rounded w-2/3 mb-4 animate-pulse"></div>
                       
              <div className="flex mt-4 items-center gap-6 text-sm">
                           
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                               
                  <div className="w-4 h-4 bg-gray-300 rounded animate-pulse"></div>
                               
                  <div className="h-4 bg-gray-300 rounded w-16 animate-pulse"></div>
                             
                </div>
                           
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                               
                  <div className="w-3 h-3 bg-gray-300 rounded-full animate-pulse"></div>
                               
                  <div className="h-4 bg-gray-300 rounded w-16 animate-pulse"></div>
                             
                </div>
                           
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                               
                  <div className="w-4 h-4 bg-gray-300 rounded animate-pulse"></div>
                               
                  <div className="h-4 bg-gray-300 rounded w-16 animate-pulse"></div>
                             
                </div>
                         
              </div>
                     
            </div>
                   
            <div className="flex gap-2 items-start">
                       
              <div className="h-10 bg-gray-300 rounded-xl w-32 animate-pulse"></div>
                       
              <div className="h-10 bg-gray-300 rounded-xl w-10 animate-pulse"></div>
                     
            </div>
                 
          </div>
             
        </div>
              {/* Module Management Skeleton */}   
        <div className="space-y-4">
               
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="bg-white rounded-2xl p-6 border border-gray-200 animate-pulse"
            >
                       
              <div className="flex items-center justify-between mb-4">
                           <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                           
                <div className="flex gap-2">
                               
                  <div className="h-8 bg-gray-300 rounded-lg w-8"></div>       
                          <div className="h-8 bg-gray-300 rounded-lg w-8"></div>
                             
                </div>
                         
              </div>
                       
              <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>       
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>       
            </div>
          ))}
             
        </div>
         
      </div>
    );
  };
  if (isLoading) return <LessonsViewSkeleton />;
  if (error)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
           
        <div className="text-center bg-red-50 border-1 border-red-200 rounded-2xl p-8 max-w-md">
               
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
               
          <p className="text-red-600 text-lg font-bold mb-2">
            Failed to Load Course
          </p>
               
          <p className="text-gray-600 mb-4">
            We couldn't fetch the course data. Please try again.
          </p>
               
          <button
            onClick={() => refetchCourse()}
            className="bg-[#034153] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#025a73] transition-all"
          >
            Retry
          </button>
                 
        </div>
         
      </div>
    );

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
        {subtitle && (
          <p className="text-[#a8dadc] text-sm mt-0.5">{subtitle}</p>
        )}
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
  }: any) => (
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
         
      <div className="mb-8 bg-gradient-to-br from-[#034153]/5 to-[#004e64]/5 rounded-2xl p-6 border border-[#034153]/10">
             
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                 
          <div className="flex-1">
                     
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#004e64] via-[#025a73] to-blue-600 bg-clip-text text-transparent">
              {courseData?.title}
            </h1>
                     
            <p className="text-md text-gray-600 mt-2 max-w-2xl">
              Organize your course content, manage access permissions, and
              upload learning materials
            </p>
                     
            <div className="flex mt-4 items-center gap-6 text-sm">
                         
              <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                <BookOpen className="w-4 h-4 text-green-500" />
                <span className="font-semibold text-gray-700">
                  {courseData?.no_lessons}{" "}
                  <span className="sm:inline hidden">Lessons</span>
                </span>
              </span>
                         
              <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="font-semibold text-gray-700">
                  {totalResources}{" "}
                  <span className="sm:inline hidden">Resources</span>
                </span>
              </span>
                         
              <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                <Users className="w-4 h-4 text-purple-500" />
                <span className="font-semibold text-gray-700">
                  <span className="sm:inline hidden">Max</span>{" "}
                  {courseData?.maximum || 0}
                </span>
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
         
      {modals.showAddModule && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
           
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg transform transition-all animate-in zoom-in-95 duration-200">
               
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
                       
                <label className="block text-sm font-medium text-gray-700 mb-2">
                              Lesson Title{" "}
                  <span className="text-red-500">*</span>       
                </label>
                       
                <input
                  type="text"
                  placeholder="e.g., Introduction to Thermodynamics"
                  value={forms.lesson.title}
                  onChange={(e) =>
                    updateForm("lesson", { title: e.target.value })
                  }
                  className="w-full bg-white border border-gray-200 px-4 py-2.5 rounded-lg focus:border-[#034153] focus:ring-2 focus:ring-[#034153]/20 transition-all outline-none"
                />
                     
              </div>
                   
              <div>
                       
                <label className="block text-sm font-medium text-gray-700 mb-2">
                              Lesson Description{" "}
                  <span className="text-red-500">*</span>       
                </label>
                       
                <textarea
                  placeholder="Provide a brief overview of what students will learn in this lesson..."
                  value={forms.lesson.description}
                  onChange={(e) =>
                    updateForm("lesson", { description: e.target.value })
                  }
                  rows={4}
                  className="w-full bg-white border border-gray-200 px-4 py-2.5 rounded-lg focus:border-[#034153] focus:ring-2 focus:ring-[#034153]/20 transition-all outline-none resize-none"
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
                      file &&
                        updateForm("course", {
                          imageFile: file,
                          imagePreview: URL.createObjectURL(file),
                        });
                    }}
                    className="hidden"
                  />
                               
                </label>
                           
              </div>
                         
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
                         
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                             
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    Course Price (RWF) <span className="text-red-500">*</span>
                  </label>
                                 
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                      ₣
                    </span>
                                     
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
                                 
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      forms.course.isOpen
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {forms.course.isOpen ? "Open" : "Closed"}
                  </span>
                               
                </div>
                           
              </div>
                         
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
              Are you sure you want to delete{" "}
              <span className="font-semibold">"{courseData?.title}"</span>? This
              action cannot be undone and all lessons will be permanently
              removed.
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
            <ModuleManagement courseId={Number(id)} lessons={lessons} /> 
    </div>
  );
};

export default LessonsView;
