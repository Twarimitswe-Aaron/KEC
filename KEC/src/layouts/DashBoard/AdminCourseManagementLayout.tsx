import React, { useEffect, useState } from "react";

import {
  Plus,
  CloudUpload,
  Image,
  X,
  GitPullRequest,
  Upload,
} from "lucide-react";
import { FaUserGraduate } from "react-icons/fa6";
import { toast } from "react-toastify";
import { Outlet, useNavigate } from "react-router-dom";

import { useCreateCourseMutation } from "../../state/api/courseApi";
import { useGetUserQuery } from "../../state/api/authApi";

interface NewCourseFormData {
  course_avatar: File | null;

  image_url: string;
  title: string;
  description: string;
  price: string;
  category?: string;
  uploader: {
    id: number;
  };
}

interface ImageUploadAreaProps {
  onImageSelect: (file: File | null, previewUrl: string) => void;
  currentImage?: string; // This is the base64 URL for preview
  className?: string;
  courseData?: {
    title: string;
    description: string;
    price: string;
  };
}

const ImageUploadArea: React.FC<ImageUploadAreaProps> = ({
  onImageSelect, // Now expects (file, previewUrl)
  currentImage,
  className = "",
  courseData = { title: "", description: "", price: "" },
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImage || "");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setPreviewUrl(currentImage || "");
  }, [currentImage]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPG, PNG, GIF)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setPreviewUrl(imageUrl);

      onImageSelect(file, imageUrl);
      setIsLoading(false);
    };
    reader.onerror = () => {
      toast.error("Error reading file");
      setIsLoading(false);

      onImageSelect(null, "");
    };
    reader.readAsDataURL(file); // Only for local preview
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <label className="block mb-2 font-medium text-[#004e64]">
        Course Cover Image *
      </label>

      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
                    relative border-2 border-dashed rounded-lg transition-all duration-300 ease-in-out
                    ${
                      isDragging
                        ? "border-[#004e64] bg-gradient-to-br from-[#004e64]/10 via-[#004e64]/15 to-[#004e64]/10 scale-102 shadow-lg"
                        : "border-[#004e64]/30 hover:border-[#004e64]/50"
                    }
                    ${previewUrl ? "p-3" : "p-8"}
                    bg-gradient-to-br from-white via-[#f8feff] to-white
                    hover:shadow-md hover:shadow-[#004e64]/10
                    cursor-pointer group
                    min-h-[120px]
                `}
      >
        {/* ... (Existing JSX for loading, preview, and placeholder) ... */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004e64]"></div>
            <p className="mt-2 text-sm text-gray-500">Processing image...</p>
          </div>
        ) : previewUrl ? (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#004e64]/10 to-[#004e64]/5 rounded-full border border-[#004e64]/20">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-[#004e64]">
                  Live Course Card Preview
                </span>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-full max-w-sm">
                <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-[#004e64]/10 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
                  <div className="relative group">
                    <img
                      src={previewUrl}
                      alt="Course Preview"
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://via.placeholder.com/400x200/004e64/white?text=Invalid+Image";
                      }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                      <div className="text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <CloudUpload className="w-8 h-8 text-white mx-auto mb-2 drop-shadow-lg" />
                        <span className="text-white font-medium text-sm drop-shadow-lg">
                          Click or drag to change image
                        </span>
                      </div>
                    </div>

                    <div className="absolute top-3 left-3 bg-gradient-to-r from-[#004e64] to-[#022F40] text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
                      PREVIEW
                    </div>
                  </div>

                  <div className="p-5 bg-white">
                    <h3 className="font-bold text-[#004e64] mb-3 text-lg leading-tight">
                      {courseData.title || "Your Course Title Will Appear Here"}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3">
                      {courseData.description ||
                        "Your detailed course description will be displayed here. This preview shows exactly how your course will appear to students browsing the course catalog."}
                    </p>

                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-[#004e64] rounded-full"></div>
                          <span>N/A lessons</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-lg font-bold text-[#004e64] bg-gradient-to-r from-[#004e64] to-[#022F40] bg-clip-text">
                        {courseData.price || "Set Your Price"}
                      </div>
                      <div className="px-3 py-1 bg-gradient-to-r from-[#004e64]/10 to-[#004e64]/5 rounded-full">
                        <span className="text-xs font-semibold text-[#004e64]">
                          NEW
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600 font-medium">
                ✨ This is exactly how your course will appear on the dashboard
              </p>
              <p className="text-xs text-gray-500">
                Update the form fields above to see changes reflected in
                real-time
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <CloudUpload
                  className={`w-12 h-12 transition-colors ${
                    isDragging
                      ? "text-[#004e64] scale-110"
                      : "text-[#004e64]/60 group-hover:text-[#004e64]"
                  }`}
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-[#004e64] to-[#022F40] rounded-full flex items-center justify-center">
                  <Image className="w-2 h-2 text-white" />
                </div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-[#004e64] mb-2">
              {isDragging
                ? "Drop your image here!"
                : "Drop your image here or click to browse"}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Supports: JPG, PNG, GIF (Max 10MB)
            </p>
            <div className="flex justify-center">
              <div className="px-4 py-2 bg-gradient-to-r from-[#004e64] to-[#022F40] text-white text-sm font-medium rounded-md shadow-md group-hover:shadow-lg transition-shadow">
                Browse Files
              </div>
            </div>
          </div>
        )}

        <input
          id="file-input"
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      {previewUrl && (
        <div className="mt-2 text-xs text-gray-500">
          ✓ Image uploaded successfully
        </div>
      )}
    </div>
  );
};

const AdminCourseManagementLayout: React.FC = () => {
  const [createCourse, { isLoading }] = useCreateCourseMutation();
  const { data } = useGetUserQuery();
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const [newCourse, setNewCourse] = useState<NewCourseFormData>({
    uploader: { id: 0 },
    course_avatar: null,
    image_url: "",
    title: "",
    description: "",
    price: "",
    category: "",
  });

  const resetState = () => {
    setShowModal(false);
    setNewCourse({
      uploader: { id: 0 },

      course_avatar: null,
      image_url: "",
      title: "",
      description: "",
      price: "",
      category: "",
    });
  };

  useEffect(() => {
    // Ensure reset happens on mount (or cleanup on unmount)
    return () => {
      // resetState(); // Commented out as cleanup should only be on unmount
    };
  }, []);

  const handleCloseModal = () => {
    resetState();
  };

  useEffect(() => {
    if (data?.id) {
      setNewCourse((prev) => ({
        ...prev,
        uploader: { id: data.id },
      }));
    }
  }, [data]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "title" && value.length > 50) return;
    if (name === "description" && value.length > 250) return;

    if (name in newCourse) {
      setNewCourse((prev) => ({
        ...prev,
        [name as keyof NewCourseFormData]: value,
      }));
    }
  };

  const handleImageSelect = (file: File | null, previewUrl: string) => {
    setNewCourse((prev) => ({
      ...prev,
      course_avatar: file,
      image_url: previewUrl,
    }));
  };

  const handleAddCourse = async () => {
    const { course_avatar, title, description, price, category } = newCourse;

    if (!course_avatar || !title || !description || !price) {
      toast.error(
        "Please fill in all required fields including the course image."
      );
      return;
    }
    if (!data?.id) {
      toast.error("User ID not found. Please refresh your page.");
      return;
    }

    const formData = new FormData();

    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    if (category && category.trim()) {
      formData.append("category", category.trim());
    }

    formData.append("course_avatar", course_avatar);

    formData.append("uploader", JSON.stringify({ id: data.id }));

    try {
      console.log(formData);

      const response = await toast.promise(
        createCourse(formData as any).unwrap(),
        {
          pending: "Creating course...",
          success: "Course created successfully!",
          error: "Error creating course",
        }
      );

      resetState();
      // Navigate to the lessons view of the newly created course
      if (response && response.id) {
        navigate(`/course-management/${response.id}`);
      } else {
        // Fallback if ID is missing (shouldn't happen with backend fix)
        navigate("/course-management");
      }
    } catch (err) {
      // Error is handled by toast.promise
      console.error("Failed to create course:", err);
    }
  };

  return (
    <div className="flex flex-col h-screen font-sans bg-gradient-to-br from-[#f9fafb] via-white to-[#f0fafa]">
      <header className="sticky top-20 z-30 bg-white/80 backdrop-blur-md py-6 px-4 shadow-lg border-b rounded-b-md border-[#004e64]/10">
        <div className="flex justify-around gap-4 items-center max-w-6xl mx-auto">
          <div
            onClick={() => navigate("/course-management/requestedCourses")}
            className="flex text-center items-center gap-3 px-4 py-3 border-[#004e64]/20 shadow-lg rounded-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
          >
            <GitPullRequest className="text-[#004e64] text-sm group-hover:scale-110 transition-transform" />
            <span className="text-[#004e64] hidden sm:inline ">Requested</span>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#004e64] via-[#025d75] to-[#022F40] text-white font-semibold rounded-md shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
          >
            <Plus className="text-lg" />
            <span className="hidden sm:inline ">Course</span>
          </button>

          <div
            onClick={() => {
              navigate("/course-management");
            }}
            className="flex items-center gap-3 px-6 py-3 shadow-lg rounded-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
          >
            <Upload className="text-[#004e64] text-xl group-hover:scale-110 transition-transform" />
            <span className="text-[#004e64] hidden sm:inline ">Uploaded</span>
          </div>

          <div
            onClick={() => navigate("/course-management/students")}
            className="flex items-center gap-3 px-6 py-3 shadow-lg rounded-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
          >
            <FaUserGraduate className="text-[#004e64] text-xl group-hover:scale-110 transition-transform" />
            <span className="text-[#004e64] hidden  lg:hidden md:inline">
              Students <span className="font-bold text-md"></span>
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto scroll-hide bg-white p-4">
        <div className="w-full max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 scroll-hide bg-black/50 flex justify-center items-center z-50 px-4">
          <div className="bg-white/80 backdrop-blur-sm scroll-hide w-full max-w-3xl p-6 rounded-2xl shadow-xl overflow-y-auto max-h-[90vh] border border-white/50 mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Create Course
              </h2>
              <button
                onClick={handleCloseModal}
                type="button"
                className="p-2 z-1000 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Image Upload Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 transition-all duration-300 hover:shadow-2xl">
                <ImageUploadArea
                  onImageSelect={handleImageSelect}
                  currentImage={newCourse.image_url}
                  className="col-span-full"
                  courseData={{
                    title: newCourse.title,
                    description: newCourse.description,
                    price: newCourse.price,
                  }}
                />
              </div>

              {/* Form Fields Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 transition-all duration-300 hover:shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Course Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={newCourse.title}
                      onChange={handleInputChange}
                      placeholder="Enter course title..."
                      maxLength={50}
                      className="w-full rounded-lg px-3 py-2 text-sm border border-gray-300 hover:border-blue-400 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-400">
                        {newCourse.title.length}/50 characters
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Course Price *
                    </label>
                    <input
                      type="text"
                      name="price"
                      value={newCourse.price}
                      onChange={handleInputChange}
                      placeholder="e.g., 100,000 RWF"
                      className="w-full rounded-lg px-3 py-2 text-sm border border-gray-300 hover:border-blue-400 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={newCourse.category || ""}
                      onChange={handleInputChange}
                      placeholder="e.g., Thermodynamics"
                      className="w-full rounded-lg px-3 py-2 text-sm border border-gray-300 hover:border-blue-400 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Course Description *
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    value={newCourse.description}
                    onChange={handleInputChange}
                    maxLength={250}
                    placeholder="Describe what students will learn in this course..."
                    className="w-full rounded-lg px-3 py-2 text-sm border border-gray-300 hover:border-blue-400 hover:shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-400">
                      {newCourse.description.length}/250 characters
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                onClick={handleCloseModal}
                type="button"
                disabled={isLoading}
                className="px-6 py-3 rounded-md cursor-pointer bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 font-medium hover:from-gray-100 hover:to-gray-200 transition-all duration-300 border border-gray-300 hover:shadow-md disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCourse}
                type="button"
                disabled={isLoading}
                className="px-6 py-3 rounded-md cursor-pointer bg-gradient-to-r from-[#004e64] via-[#025d75] to-[#022F40] text-white font-semibold hover:from-[#022F40] hover:to-[#011d2b] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isLoading ? "Creating..." : "Create Course"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourseManagementLayout;
