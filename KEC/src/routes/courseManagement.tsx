import React, { useContext, useEffect, useState } from "react";
import { CiUndo, CiRedo } from "react-icons/ci";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import DashboardCard from "../Components/Dashboard/DashboardCard";
import { data } from "../services/mockData";
import { UserRoleContext } from "../UserRoleContext";
import { toast } from "react-toastify";
import { CloudUpload, X, Image } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
        relative border-2 border-dashed rounded-lg transition-all duration-300  ease-in-out
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
  const navigate=useNavigate()
  const userRole = useContext(UserRoleContext);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newCourse, setNewCourse] = useState<NewCourseFormData>({
    id: Date.now(),
    image_url: "",
    title: "",
    description: "",
    price: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setCourses(data);
    };
    fetchData();
  }, []);

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

    const courseToAdd: Course = {
      id: newCourse.id || Date.now(),
      image_url: image_url,
      title: title,
      description: description,
      price: price,
      open: true,
      enrolled: false,
      no_lessons: "1",
     
      uploader: {
        name: "Admin",
        avatar_url: "https://via.placeholder.com/40",
      },
    };
    navigate("/create-modules")
    
  };

  return (
    <div className="h-screen flex flex-col  ">
      <div className="flex flex-col">
        {userRole === "teacher" && (
          <div>
            <div className="z-10  flex place-items-start justify-between p-3 rounded-lg bg-white shadow-lg">
              <span className="md:text-2xl text-lg font-normal text-gray-800">
                Courses
              </span>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 flex items-center justify-center cursor-pointer rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100">
                  <CiUndo />
                </button>
                <button className="w-8 h-8 flex items-center justify-center cursor-pointer rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100">
                  <CiRedo />
                </button>
                <button className="w-8 h-8 flex items-center justify-center cursor-pointer rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100">
                  <HiOutlineAdjustmentsHorizontal />
                </button>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-[#1a3c34] cursor-pointer to-[#2e856e] text-white rounded-full hover:from-[#2e856e] hover:to-[#1a3c34]"
                >
                  <span>Add</span>
                  <span>+</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="scroll-hide scroll-y-auto overflow-y-auto h-full ">
        <DashboardCard
          courses={courses}
          onCourseAction={handleCourseCreation}
        />
      </div>

      {showModal && (
        <div className="fixed inset-0 scroll-hide bg-black/50  justify-center items-center z-50 px-4">
          <div className="bg-white mx-auto scroll-hide w-full max-w-3xl p-8 rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh] border border-[#004e64]/10 ">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-[#004e64] bg-gradient-to-r from-[#004e64] to-[#022f40] bg-clip-text ">
                Create course
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-2 z-1000 cursor-pointer hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-6">
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

              {/* title and price row */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="">
                  <label className="block mb-2 font-medium text-[#004e64] ">
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

              <div className="">
                <label className="block mb-2 font-medium text-[#004e64] ">
                  Course Description *
                </label>
                <textarea
                  maxLength={250}
                  onChange={handleInputChange}
                  value={newCourse.description}
                  placeholder="Describe what students will learn in this course..."
                  name="description"
                  id=""
                  className="w-full rounded-md px-4 py-3 border border-[#004e64]/30 text-[#004e64] resize-none focus:outline-none focus:ring-2 focus:ring-[#004e64]/50 focus:border-transparent transition-all duration-300 hover:shadow-md"
                  rows={4}
                />
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-400">
                    {newCourse.description.length}/250 characters
                  </span>
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
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
