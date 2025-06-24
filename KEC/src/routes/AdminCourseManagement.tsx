import React, { useContext, useEffect, useState } from "react";
import {
  Plus,
  CloudUpload,
  Image,
  X,
  GitPullRequest,
  Upload,
} from "lucide-react";

// Mock data and types for demonstration
const mockData = [
  {
    id: 1,
    title: "React Fundamentals",
    description:
      "Learn React from scratch with hands-on projects and real-world examples",
    price: "50,000 RWF",
    image_url: "/images/courseCard.png",
    no_lessons: "15",
    no_hours: "10",
    uploader: {
      name: "John Doe",
      avatar_url: "https://via.placeholder.com/40",
    },
  },
  {
    id: 2,
    title: "Advanced JavaScript",
    description: "Master modern JavaScript concepts and best practices",
    price: "75,000 RWF",
    image_url: "/images/courseCard.png",
    no_lessons: "20",
    no_hours: "15",
    uploader: {
      name: "Jane Smith",
      avatar_url: "https://via.placeholder.com/40",
    },
  },
  {
    id: 3,
    title: "TypeScript Mastery",
    description: "Type-safe JavaScript development with TypeScript",
    price: "60,000 RWF",
    image_url: "/images/courseCard.png",
    no_lessons: "18",
    no_hours: "12",
    uploader: {
      name: "Mike Johnson",
      avatar_url: "https://via.placeholder.com/40",
    },
  },
  {
    id: 4,
    title: "Node.js Backend Development",
    description: "Build scalable backend applications with Node.js",
    price: "65,000 RWF",
    image_url: "/images/courseCard.png",
    no_lessons: "22",
    no_hours: "16",
    uploader: {
      name: "Sarah Wilson",
      avatar_url: "https://via.placeholder.com/40",
    },
  },
  {
    id: 5,
    title: "UI/UX Design Principles",
    description:
      "Learn modern design principles and create beautiful interfaces",
    price: "45,000 RWF",
    image_url: "/images/courseCard.png",
    no_lessons: "12",
    no_hours: "8",
    uploader: {
      name: "Alex Brown",
      avatar_url: "https://via.placeholder.com/40",
    },
  },
  {
    id: 6,
    title: "Database Design & SQL",
    description: "Master database design and SQL querying",
    price: "55,000 RWF",
    image_url: "/images/courseCard.png",
    no_lessons: "16",
    no_hours: "14",
    uploader: {
      name: "Emma Davis",
      avatar_url: "https://via.placeholder.com/40",
    },
  },
];

interface Course {
  id: number;
  image_url: string;
  title: string;
  description: string;
  price: string;
  no_lessons: string;
  no_hours: string;
  uploader: { name: string; avatar_url: string };
}

interface NewCourseFormData {
  id?: number;
  image_url: string;
  title: string;
  description: string;
  price: string;
}

// Mock DashboardCard component
interface DashboardCardProps {
  courses: Course[];
  onCourseAction: (id: number) => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  courses,
  onCourseAction,
}) => (
  <div className="grid grid-cols-1 scroll-hide scroll-hide sm:grid-cols-2 lg:grid-cols-2 gap-6">
    {courses.map((course) => (
      <div
        key={course.id}
        className="bg-white rounded-md shadow-md overflow-hidden hover:shadow-lg transition-shadow"
      >
        <div className="relative">
          <img
            src={course.image_url}
            alt={course.title}
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.currentTarget.src =
                "https://via.placeholder.com/400x200/004e64/white?text=Course+Image";
            }}
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-[#004e64] mb-2">{course.title}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {course.description}
          </p>
          <div className="flex justify-between items-center">
            <p className="text-[#004e64] font-bold">{course.price}</p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{course.no_lessons} lessons</span>
              <span>•</span>
              <span>{course.no_hours} hours</span>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

interface ImageUploadAreaProps {
  onImageSelect: (imageUrl: string) => void;
  currentImage?: string;
  className?: string;
  courseData?: {
    title: string;
    description: string;
    price: string;
  };
}

const ImageUploadArea: React.FC<ImageUploadAreaProps> = ({
  onImageSelect,
  currentImage,
  className = "",
  courseData = { title: "", description: "", price: "" },
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImage || "");
  const [isLoading, setIsLoading] = useState(false);

  // Update preview when currentImage changes
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
    // Only set dragging to false if we're leaving the drop zone entirely
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
      alert("Please select a valid image file (JPG, PNG, GIF)");
      return;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setPreviewUrl(imageUrl);
      onImageSelect(imageUrl);
      setIsLoading(false);
    };
    reader.onerror = () => {
      alert("Error reading file");
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl("");
    onImageSelect("");
  };

  const handleClickToUpload = () => {
    const fileInput = document.getElementById("file-input") as HTMLInputElement;
    fileInput?.click();
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
        onClick={handleClickToUpload}
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
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004e64]"></div>
            <p className="mt-2 text-sm text-gray-500">Processing image...</p>
          </div>
        ) : previewUrl ? (
          <div className="space-y-6">
            {/* Preview Header */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#004e64]/10 to-[#004e64]/5 rounded-full border border-[#004e64]/20">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-[#004e64]">
                  Live Course Card Preview
                </span>
              </div>
            </div>

            {/* Centered Course Card Preview */}
            <div className="flex justify-center">
              <div className="w-full max-w-sm">
                <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-[#004e64]/10 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
                  <div className="relative group">
                    <img
                      src={previewUrl}
                      alt="Course Preview"
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        console.error("Image failed to load:", previewUrl);
                        e.currentTarget.src =
                          "https://via.placeholder.com/400x200/004e64/white?text=Invalid+Image";
                      }}
                    />

                

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                      <div className="text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <CloudUpload className="w-8 h-8 text-white mx-auto mb-2 drop-shadow-lg" />
                        <span className="text-white font-medium text-sm drop-shadow-lg">
                          Click or drag to change image
                        </span>
                      </div>
                    </div>

                    {/* Corner Badge */}
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-[#004e64] to-[#022F40] text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
                      PREVIEW
                    </div>
                  </div>

                  {/* Course Card Content */}
                  <div className="p-5 bg-white">
                    <h3 className="font-bold text-[#004e64] mb-3 text-lg leading-tight">
                      {courseData.title || "Your Course Title Will Appear Here"}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3">
                      {courseData.description ||
                        "Your detailed course description will be displayed here. This preview shows exactly how your course will appear to students browsing the course catalog."}
                    </p>

                    {/* Course Stats */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-[#004e64] rounded-full"></div>
                          <span>N/A lessons</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-[#004e64] rounded-full"></div>
                          <span>N/A hours</span>
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex justify-between items-center">
                      <div className="text-2xl font-bold text-[#004e64] bg-gradient-to-r from-[#004e64] to-[#022F40] bg-clip-text">
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

            {/* Preview Footer */}
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

const AdminCourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newCourse, setNewCourse] = useState<NewCourseFormData>({
    id: Date.now(),
    image_url: "",
    title: "",
    description: "",
    price: "",
  });

  // Reset function
  const resetState = () => {
    setShowModal(false);
    setNewCourse({
      id: Date.now(),
      image_url: "",
      title: "",
      description: "",
      price: "",
    });
  };

  // Load initial data
  useEffect(() => {
    setCourses(mockData);

    // Cleanup function
    return () => {
      resetState();
    };
  }, []);

  // Handle modal close
  const handleCloseModal = () => {
    resetState();
  };

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

  const handleImageSelect = (imageUrl: string) => {
    setNewCourse((prev) => ({
      ...prev,
      image_url: imageUrl,
    }));
  };

  const handleAddCourse = () => {
    const { image_url, title, description, price } = newCourse;

    if (!image_url || !title || !description || !price) {
      alert("Please fill in all required fields including the course image.");
      return;
    }

    const courseToAdd: Course = {
      id: newCourse.id || Date.now(),
      image_url: image_url,
      title: title,
      description: description,
      price: price,
      no_lessons: "N/A",
      no_hours: "N/A",
      uploader: {
        name: "Admin User",
        avatar_url: "https://via.placeholder.com/40",
      },
    };

    setCourses((prev) => [courseToAdd, ...prev]);
    resetState();
    alert("Course created successfully!");
  };

  return (
    <div className="flex flex-col h-screen font-sans bg-gradient-to-br from-[#f9fafb] via-white to-[#f0fafa]">
      {/* Header */}
      <header className="sticky top-20 z-30 bg-white/80 backdrop-blur-md py-6 px-4 shadow-lg border-b rounded-b-md border-[#004e64]/10">
        <div className="flex justify-around gap-4 items-center max-w-6xl mx-auto">
          <div className="flex  text-center items-center gap-3 px-4 py-3  border-[#004e64]/20 shadow-lg rounded-md hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <GitPullRequest className="text-[#004e64] text-sm group-hover:scale-110 transition-transform" />
            <span className="text-[#004e64] hidden sm:inline ">
              Requested <span className=" text-md">110</span>
            </span>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#004e64] via-[#025d75] to-[#022F40] text-white font-semibold rounded-md shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
          >
            <Plus className="text-lg" />
            <span className="hidden sm:inline">Add Course</span>
          </button>

          <div className="flex items-center gap-3 px-6 py-3  shadow-lg rounded-md  hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <Upload className="text-[#004e64] text-xl group-hover:scale-110 transition-transform" />
            <span className="text-[#004e64] hidden sm:inline">
              Uploaded{" "}
              <span className="font-bold text-md">{courses.length}</span>
            </span>
          </div>
        </div>
      </header>

      {/* Course Cards Grid */}
      <main className="flex-1 overflow-y-auto scroll-hide py-8 px-4">
        <div className="w-full max-w-6xl mx-auto">
          <DashboardCard
            courses={courses}
            onCourseAction={(id) => console.log("Course action:", id)}
          />
        </div>
      </main>

      {/* Enhanced Modal Form */}
      {showModal && (
        <div className="fixed inset-0 scroll-hide bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 px-4">
          <div className="bg-white scroll-hide w-full max-w-3xl p-8 rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh] border border-[#004e64]/10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-[#004e64] bg-gradient-to-r from-[#004e64] to-[#022F40] bg-clip-text">
                Create New Course
              </h2>
              <button
                onClick={handleCloseModal}
                type="button"
                className="p-2 z-1000 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Image Upload Section */}
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

              {/* Title and Price Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-medium text-[#004e64]">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={newCourse.title}
                    onChange={handleInputChange}
                    placeholder="Enter course title..."
                    maxLength={50}
                    className="w-full rounded-md px-4 py-3 border border-[#004e64]/30 text-[#004e64] focus:outline-none focus:ring-2 focus:ring-[#004e64]/50 focus:border-transparent transition-all duration-300 hover:shadow-md"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-400">
                      {newCourse.title.length}/50 characters
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-medium text-[#004e64]">
                    Course Price *
                  </label>
                  <input
                    type="text"
                    name="price"
                    value={newCourse.price}
                    onChange={handleInputChange}
                    placeholder="e.g., 100,000 RWF"
                    className="w-full rounded-md px-4 py-3 border border-[#004e64]/30 text-[#004e64] focus:outline-none focus:ring-2 focus:ring-[#004e64]/50 focus:border-transparent transition-all duration-300 hover:shadow-md"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block mb-2 font-medium text-[#004e64]">
                  Course Description *
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={newCourse.description}
                  onChange={handleInputChange}
                  maxLength={250}
                  placeholder="Describe what students will learn in this course..."
                  className="w-full rounded-md px-4 py-3 border border-[#004e64]/30 text-[#004e64] resize-none focus:outline-none focus:ring-2 focus:ring-[#004e64]/50 focus:border-transparent transition-all duration-300 hover:shadow-md"
                />
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-400">
                    {newCourse.description.length}/250 characters
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleCloseModal}
                type="button"
                className="px-6 py-3 rounded-md cursor-pointer bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 font-medium hover:from-gray-100 hover:to-gray-200 transition-all duration-300 border border-gray-300 hover:shadow-md"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCourse}
                type="button"
                className="px-6 py-3 rounded-md cursor-pointer bg-gradient-to-r from-[#004e64] via-[#025d75] to-[#022F40] text-white font-semibold hover:from-[#022F40] hover:to-[#011d2b] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Create Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourseManagement;
