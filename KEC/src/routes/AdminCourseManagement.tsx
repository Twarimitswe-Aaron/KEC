import React, { useContext, useEffect, useState } from "react";
import { Plus, CloudUpload, Image, X, GitPullRequest, Upload } from "lucide-react";

// Mock data and types for demonstration
const mockData = [
  {
    id: 1,
    title: "React Fundamentals",
    description: "Learn React from scratch with hands-on projects and real-world examples",
    price: "50,000 RWF",
    image_url: "/images/courseCard.png",
    no_lessons: "15",
    no_hours: "10",
    uploader: { name: "John Doe", avatar_url: "https://via.placeholder.com/40" }
  },
  {
    id: 2,
    title: "Advanced JavaScript",
    description: "Master modern JavaScript concepts and best practices",
    price: "75,000 RWF",
    image_url: "/images/courseCard.png",
    no_lessons: "20",
    no_hours: "15",
    uploader: { name: "Jane Smith", avatar_url: "https://via.placeholder.com/40" }
  },
  {
    id: 3,
    title: "TypeScript Mastery",
    description: "Type-safe JavaScript development with TypeScript",
    price: "60,000 RWF",
    image_url: "/images/courseCard.png",
    no_lessons: "18",
    no_hours: "12",
    uploader: { name: "Mike Johnson", avatar_url: "https://via.placeholder.com/40" }
  },
  {
    id: 4,
    title: "Node.js Backend Development",
    description: "Build scalable backend applications with Node.js",
    price: "65,000 RWF",
    image_url: "/images/courseCard.png",
    no_lessons: "22",
    no_hours: "16",
    uploader: { name: "Sarah Wilson", avatar_url: "https://via.placeholder.com/40" }
  },
  {
    id: 5,
    title: "UI/UX Design Principles",
    description: "Learn modern design principles and create beautiful interfaces",
    price: "45,000 RWF",
    image_url: "/images/courseCard.png",
    no_lessons: "12",
    no_hours: "8",
    uploader: { name: "Alex Brown", avatar_url: "https://via.placeholder.com/40" }
  },
  {
    id: 6,
    title: "Database Design & SQL",
    description: "Master database design and SQL querying",
    price: "55,000 RWF",
    image_url: "/images/courseCard.png",
    no_lessons: "16",
    no_hours: "14",
    uploader: { name: "Emma Davis", avatar_url: "https://via.placeholder.com/40" }
  }
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

const DashboardCard: React.FC<DashboardCardProps> = ({ courses, onCourseAction }) => (
  <div className="grid grid-cols-1 scroll-hide scroll-hide sm:grid-cols-2 lg:grid-cols-2 gap-6">
    {courses.map(course => (
      <div key={course.id} className="bg-white rounded-md shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative">
          <img 
            src={course.image_url} 
            alt={course.title} 
            className="w-full h-48 object-cover"
          />
        
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-[#004e64] mb-2">{course.title}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>
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

// Enhanced Drag & Drop Image Upload Component
interface ImageUploadAreaProps {
  onImageSelect: (imageUrl: string) => void;
  currentImage?: string;
  className?: string;
}

const ImageUploadArea: React.FC<ImageUploadAreaProps> = ({ onImageSelect, currentImage, className = "" }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImage || "");

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewUrl(imageUrl);
      onImageSelect(imageUrl);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const removeImage = () => {
    setPreviewUrl("");
    onImageSelect("");
  };

  return (
    <div className={`w-full ${className}`}>
      <label className="block mb-2 font-medium text-[#004e64]">
        Course Cover Image
      </label>
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-md transition-all duration-300 ease-in-out
          ${isDragging 
            ? 'border-[#004e64] bg-gradient-to-br from-[#004e64]/5 via-[#004e64]/10 to-[#004e64]/5 scale-105' 
            : 'border-[#004e64]/30 hover:border-[#004e64]/50'
          }
          ${previewUrl ? 'p-2' : 'p-8'}
          bg-gradient-to-br from-white via-[#f0fafa] to-white
          hover:shadow-lg hover:shadow-[#004e64]/10
          cursor-pointer group
        `}
      >
        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Course Preview"
              className="w-full h-48 object-cover rounded-md border border-[#004e64]/20 shadow-md"
            />
            <button
              onClick={removeImage}
              type="button"
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
            >
              <X className="w-3 h-3" />
            </button>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
              <span className="text-white font-medium">Click or drag to change</span>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <CloudUpload className="w-12 h-12 text-[#004e64]/60 group-hover:text-[#004e64] transition-colors" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-[#004e64] to-[#022F40] rounded-full flex items-center justify-center">
                  <Image className="w-2 h-2 text-white" />
                </div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-[#004e64] mb-2">
              Drop your image here or click to browse
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
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
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

  useEffect(() => {
    // Use the mock data directly
    setCourses(mockData);
  }, []);

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
      alert("Please fill in all required fields.");
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
      uploader: { name: "Unknown Uploader", avatar_url: "" },
    };

    setCourses((prev) => [...prev, courseToAdd]);
    setShowModal(false);
    setNewCourse({
      id: Date.now(),
      image_url: "",
      title: "",
      description: "",
      price: "",
    });
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
              Uploaded <span className="font-bold text-md">169</span>
            </span>
          </div>
        </div>
      </header>

      {/* Course Cards Grid */}
      <main className="flex-1 overflow-y-auto scroll-hide py-8 px-0">
        <div className="w-full mx-auto lg:grid-2 sm:grid-2 grid-1">
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
              <h2 className="text-3xl font-bold text-[#004e64] bg-gradient-to-r from-[#004e64] to-[#022F40] bg-clip-text ">
                Create New Course
              </h2>
              <button
                onClick={() => setShowModal(false)}
                type="button"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Image Upload Section */}
              <ImageUploadArea
                onImageSelect={handleImageSelect}
                currentImage={newCourse.image_url}
                className="col-span-full object-cover"
              />

              {/* Title and Price Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-medium text-[#004e64]">
                    Course Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={newCourse.title}
                    onChange={handleInputChange}
                    placeholder="Enter course title..."
                    maxLength={50}
                    className="w-full rounded-md px-4 py-3 border border-[#004e64]  text-[#004e64] focus:outline-none focus:ring-1 focus:ring-[#004e64]/50 focus:border-transparent transition-all duration-300 hover:shadow-md"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-400">
                      {newCourse.title.length}/50 characters
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-medium text-[#004e64]">
                    Course Price
                  </label>
                  <input
                    type="text"
                    name="price"
                    value={newCourse.price}
                    onChange={handleInputChange}
                    placeholder="e.g., 100,000 RWF"
                    className="w-full rounded-md px-4 py-3 border border-[#004e64] text-[#004e64] focus:outline-none focus:ring-1 focus:ring-[#004e64]/50 focus:border-transparent transition-all duration-300 hover:shadow-md"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block mb-2 font-medium text-[#004e64]">
                  Course Description
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={newCourse.description}
                  onChange={handleInputChange}
                  maxLength={250}
                  placeholder="Describe what students will learn in this course..."
                  className="w-full rounded-md px-4 py-3 border border-[#004e64] text-[#004e64] resize-none focus:outline-none focus:ring-1 focus:ring-[#004e64]/50 focus:border-transparent transition-all duration-300 hover:shadow-md"
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
                onClick={() => setShowModal(false)}
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