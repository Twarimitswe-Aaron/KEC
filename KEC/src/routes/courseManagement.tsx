import React, { useContext, useEffect, useState } from "react";
import { CiUndo, CiRedo } from "react-icons/ci";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import DashboardCard from "../Components/Dashboard/DashboardCard";
import { UserRoleContext } from "../UserRoleContext";
import { useCoursesQuery } from "../state/api/courseApi";
import { toast } from "react-toastify";
import { CloudUpload, X, Image } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { Filter, ArrowUpNarrowWide } from "lucide-react";

export interface Course {
  id?: number;
  image_url: string;
  title: string;
  description: string;
  price: string;
  open: boolean;
  enrolled: boolean;
  no_lessons: string;

  uploader: {
    id: number;
    email: string;
    name: string;
    avatar_url: string;
  };
}

interface NewCourseFormData {
  id?: number;
  image_url: string;
  title: string;
  description: string;
  price: string;
  category?: string;
}

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

  useEffect(() => {
    setPreviewUrl(currentImage || "");
  }, [currentImage]);
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragerEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDrageLeaver = (e: React.DragEvent<HTMLDivElement>) => {
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
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };
  const handleFileSelect = (file: File) => {
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPG, PNG, GIF)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast("File size must be less than 10MB");
      return;
    }
    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setPreviewUrl(imageUrl);
      setIsLoading(false);
    };

    reader.onerror = (e) => {
      toast.error("Error reading file. Please try again.");
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

  const handleClickToUpload = () => {
    const fileInput = document.createElement("file-input") as HTMLInputElement;
    fileInput?.click();
  };

  return (
    <div className={`w-full  ${className}`}>
      <label className="block mb-2 font-medium text-[#004e64] ">
        Course Cover Image *
      </label>
      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragerEnter}
        onDragLeave={handleDrageLeaver}
        onDrop={handleDrop}
        className={`
        relative border-2 border-dashed rounded-lg transition-all duration-300 ease-in-out
        ${
          isDragging
            ? "border-blue-500 bg-blue-50 scale-[1.01] shadow-lg"
            : "border-gray-300 hover:border-blue-400 hover:shadow-sm"
        }  
        ${previewUrl ? "p-3" : "p-6"}
        bg-white
          cursor-pointer group
          min-h-[100px]

        `}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004e64]">
              <p className="mt-2 text-sm text-gray-500">Processing image</p>
            </div>
          </div>
        ) : previewUrl ? (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#004e64]/5 rounded-full border border-[#004e64]/20 ">
                <div className="w-2 h-2 bg-green-500 rounded full animate-pulse"></div>
                <span className="text-sm font-medium text-[#004e64] ">
                  Live Course Card Preview
                </span>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-full max-w-sm">
                <div className="bg-white rounded-lg shadow-xl overflow-hidden border-[#004e64]/10 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
                  <div className="relative group">
                    <img
                      src={previewUrl}
                      alt="Course Preview"
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        console.log("Error loading image", e);
                        e.currentTarget.src = `https://via.placeholder.com/400x200/004e64/white?text=Course+Image`;
                      }}
                    />

                    {/* <button className="absolute top-3 right-3 rounded-full bg-red-500/90 backdrop-blur-sm text-white p-2 rouded-full hover:bg-red-600 transition-all duration-300 shadow-lg transform hover:scale-110 z-999">
                      <X className="w-4 h-4" />
                    </button> */}
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                      <div className="text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <CloudUpload className="w-8 h-8 text-white mx-auto mb-2 drop-shadow-lg" />
                        <span className="text-white font-medium text-sm drop-shadow-lg">
                          Click or drag to change image
                        </span>
                      </div>
                    </div>
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-[#004e64] to-[#022F40] text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg ">
                      PREVIEW
                    </div>
                  </div>
                  <div className="p-5 bg-whi">
                    <h3 className="font-bold text-[#004e64] mb-3 text-lg leading-tight ">
                      {courseData.title ||
                        "Your Course Title Will Appear Here "}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3">
                      {courseData.description ||
                        "Your detailed course description will be displayed  here This preview shows exactly how your course will appear to students browsing the course catalog."}
                    </p>

                    {/* Cousecard stats */}
                    <div className="flex justify-between w-full items-center mb-4">
                      <div className="flex items-center gap-3 text-sm justify-between  text-gray-500">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-[#004e64] rounded-full"></div>
                          <span>1 lesson</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-[#004e64] rounded-full"></div>
                          <span>1 hour</span>
                        </div>
                      </div>
                    </div>

                    {/* Course Price */}
                    <div className="flex justify-between items-center">
                      <div className="text-lg font-bold text-[#004e64] bg-gradient-to-r from-[#004e64] to-[#022F40] bg-clip-text ">
                        {courseData.price || "Set your price"}
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
                      ? "text-[#004e64] scale-110 "
                      : "text-[#004e64]/60 group-hover:text-[#004e64]  "
                  }`}
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-[#004e64] to-[022f40] rounded-full flex items-center justify-center ">
                  <Image className="w-2 h-2 text-white" />
                </div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-[#004e64] mb-2 ">
              {isDragging
                ? "Drop your image here"
                : "Drop your Image here or click to browse"}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Supports: JPG, PNG, GIF (Max 10MB)
            </p>
            <div className="flex justify-center">
              <div className="px-4 py-2 bg-gradient-to-r from-[#004e64] to-[#022f40] text-white text-sm font-medium rounded-md shadow-md group-hover:shadow-lg transition-shadow ">
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

const CourseManagement = () => {
  const navigate = useNavigate();
  const userRole = useContext(UserRoleContext);
  const { userData } = useUser();
  const { data: courses = [], isLoading } = useCoursesQuery();
  const [showModal, setShowModal] = useState(false);

  // Filter and Sort State
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterOwnership, setFilterOwnership] = useState("all"); // 'all', 'my_courses', 'others'
  const [sortBy, setSortBy] = useState("newest");

  const [newCourse, setNewCourse] = useState<NewCourseFormData>({
    id: Date.now(),
    image_url: "",
    title: "",
    description: "",
    price: "",
    category: "",
  });

  const handleCourseCreation = (courseId: number) => {
    console.log("Starting course:", courseId);
  };

  const handleCloseModal = () => setShowModal(false);
  const handleImageSelect = (imageUrl: string) => {
    setNewCourse((prev) => ({
      ...prev,
      image_url: imageUrl,
    }));
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

  const handleAddCourse = () => {
    const { image_url, title, description, price } = newCourse;
    if (!image_url || !title || !description || !price) {
      toast.error("Please fill all the fields");
      return;
    }
    // Logic to add course would go here (likely a mutation)
    navigate("/create-modules");
  };

  // Get unique categories for filter dropdown
  const categories = Array.from(
    new Set(courses.map((c: any) => c.category || "Uncategorized"))
  );

  const filteredCourses = courses
    .filter((course: any) => {
      // Category Filter
      if (filterCategory !== "all" && course.category !== filterCategory)
        return false;

      // Ownership Filter
      if (filterOwnership === "my_courses") {
        return course.uploader.id === userData?.id;
      }
      if (filterOwnership === "others") {
        return course.uploader.id !== userData?.id;
      }

      return true;
    })
    .sort((a: any, b: any) => {
      if (sortBy === "newest") {
        return (b.id || 0) - (a.id || 0);
      }
      if (sortBy === "oldest") {
        return (a.id || 0) - (b.id || 0);
      }
      if (sortBy === "price_high") {
        return (
          parseFloat(b.price.replace(/[^0-9.-]+/g, "")) -
          parseFloat(a.price.replace(/[^0-9.-]+/g, ""))
        );
      }
      if (sortBy === "price_low") {
        return (
          parseFloat(a.price.replace(/[^0-9.-]+/g, "")) -
          parseFloat(b.price.replace(/[^0-9.-]+/g, ""))
        );
      }
      return 0;
    });

  return (
    <div className="h-screen flex flex-col  ">
      {/* Filter Bar */}
      <div className="">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Category Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Category:
                </span>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#004e64] bg-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat: any) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ownership Filter (Only for Teachers/Admins) */}
              {(userRole === "teacher" || userRole === "admin") && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">
                    Show:
                  </span>
                  <select
                    value={filterOwnership}
                    onChange={(e) => setFilterOwnership(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#004e64] bg-transparent"
                  >
                    <option value="all">All Courses</option>
                    <option value="my_courses">My Courses</option>
                    <option value="others">Others' Courses</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">
                  Sort by:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#004e64] bg-transparent"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="price_low">Price: Low to High</option>
                </select>
              </div>
              <button
                onClick={() =>
                  setSortBy((prev) => (prev === "newest" ? "oldest" : "newest"))
                }
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ArrowUpNarrowWide className="h-4 w-4 text-gray-600" />
              </button>

              {/* Add Button */}
              {(userRole === "teacher" || userRole === "admin") && (
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-1 px-4 py-1.5 bg-gradient-to-r from-[#1a3c34] cursor-pointer to-[#2e856e] text-white rounded-full hover:from-[#2e856e] hover:to-[#1a3c34] text-sm shadow-sm hover:shadow-md transition-all"
                >
                  <span>Add</span>
                  <span>+</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="scroll-hide scroll-y-auto overflow-y-auto h-full ">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004e64]"></div>
          </div>
        ) : (
          <DashboardCard
            courses={filteredCourses}
            onCourseAction={handleCourseCreation}
            currentUserId={userData?.id}
          />
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 scroll-hide bg-black/50 flex justify-center items-center z-50 px-4">
          <div className="bg-white/80 backdrop-blur-sm scroll-hide w-full max-w-3xl p-6 rounded-2xl shadow-xl overflow-y-auto max-h-[90vh] border border-white/50 mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Create Course
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-2 z-1000 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
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
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 transition-all duration-300 hover:shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Course Title *
                    </label>
                    <input
                      placeholder="Enter course title..."
                      maxLength={50}
                      className="w-full rounded-lg px-3 py-2 text-sm border border-gray-300 hover:border-blue-400 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      type="text"
                      value={newCourse.title}
                      name="title"
                      onChange={handleInputChange}
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
                      placeholder="e.g., 100,000 RWF"
                      className="w-full rounded-lg px-3 py-2 text-sm border border-gray-300 hover:border-blue-400 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      type="text"
                      value={newCourse.price}
                      name="price"
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <input
                      placeholder="e.g., Thermodynamics"
                      className="w-full rounded-lg px-3 py-2 text-sm border border-gray-300 hover:border-blue-400 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      type="text"
                      value={newCourse.category || ""}
                      name="category"
                      onChange={handleInputChange}
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
                    maxLength={250}
                    placeholder="Describe what students will learn in this course..."
                    className="w-full rounded-lg px-3 py-2 text-sm border border-gray-300 hover:border-blue-400 hover:shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={newCourse.description}
                    onChange={handleInputChange}
                  ></textarea>
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
                type="button"
                onClick={handleCloseModal}
                className="px-6 py-3 rounded-md cursor-pointer bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 font-medium hover:from-gray-100 hover:to-gray-200 transition-all duration-300 border border-gray-300 hover:shadow-md disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCourse}
                className="px-6 py-3 rounded-md cursor-pointer bg-gradient-to-r from-[#004e64] via-[#025d75] to-[#022F40] text-white font-semibold hover:from-[#022F40] hover:to-[#011d2b] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
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

export default CourseManagement;
