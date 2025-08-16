import React, { useEffect, useState, useContext } from "react";
import DashboardCard from "../Components/Dashboard/DashboardCard";
import { Coursedata } from "../services/mockData";
import { Course } from "../Components/Dashboard/CourseCard";
import { UserRoleContext } from "../UserRoleContext";
import { FaEye, FaTimes, FaCheck, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// Confirmation Modal Component
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  confirmColor?: string;
  cancelColor?: string;
}

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText, 
  confirmColor = "bg-[#034153]",
  cancelColor = "bg-gray-500" 
}: ConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#00000090] bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[#004e64]">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
          >
            <FaTimes />
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">{message}</p>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className={`${cancelColor} cursor-pointer text-white px-4 py-2 rounded hover:opacity-90 transition-opacity`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`${confirmColor} text-white px-4 py-2 rounded hover:opacity-90 transition-opacity`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const RequestedCourses = () => {
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [enrollingCourse, setEnrollingCourse] = useState<Course | null>(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null as 'confirm' | 'delete' | null,
    course: null as Course | null
  });
  const [loading, setLoading] = useState<{ [key: number]: { confirm: boolean; delete: boolean } }>({});
  const userRole = useContext(UserRoleContext);

  const handleViewDetails = (course: Course) => {
    setSelectedCourse(course);
    navigate("/course-management/view-lessons");
  };

  const handleCloseDetails = () => {
    setSelectedCourse(null);
  };

  const data: Coursedata[] = [
    {
      id: 1,
      image_url: "/images/courseCard.png",
      title: "Thermodynamics",
      description:
        "Explore energy transfer, heat, and the laws of thermodynamics in detail through real-world applications.",
      price: "100,000frw",
      enrolled: false,
      open: true,
      no_lessons: "10",
      no_hours: "22hrs32min",
      uploader: {
        name: "Irakoze Rachel",
        avatar_url: "/images/avatars/rachel.png",
      },
    },
    {
      id: 2,
      image_url: "/images/courseCard.png",
      title: "Advanced Thermodynamics",
      open: true,
      description:
        "Explore energy transfer, heat, and the laws of thermodynamics in detail through real-world applications.",
      price: "100,000frw",
      no_lessons: "10",
      enrolled: true,
      no_hours: "22hrs32min",
      uploader: {
        name: "Irakoze Rachel",
        avatar_url: "/images/avatars/rachel.png",
      },
    },
    {
      id: 3,
      image_url: "/images/courseCard.png",
      title: "Basic Thermodynamics",
      description:
        "Explore energy transfer, heat, and the laws of thermodynamics in detail through real-world applications.",
      price: "100,000frw",
      open: false,
      no_lessons: "10",
      enrolled: false,
      no_hours: "22hrs32min",
      uploader: {
        name: "Irakoze Rachel",
        avatar_url: "/images/avatars/rachel.png",
      },
    },
    {
      id: 4,
      image_url: "/images/courseCard.png",
      title: "Thermodynamics Applications",
      description:
        "Explore energy transfer, heat, and the laws of thermodynamics in detail through real-world applications.",
      price: "100,000frw",
      open: false,
      enrolled: false,
      no_lessons: "10",
      no_hours: "22hrs32min",
      uploader: {
        name: "Irakoze Rachel",
        avatar_url: "/images/avatars/rachel.png",
      },
    },
    {
      id: 5,
      image_url: "/images/courseCard.png",
      title: "Industrial Thermodynamics",
      description:
        "Explore energy transfer, heat, and the laws of thermodynamics in detail through real-world applications.",
      price: "100,000frw",
      no_lessons: "10",
      no_hours: "22hrs32min",
      open: false,
      enrolled: false,
      uploader: {
        name: "Irakoze Rachel",
        avatar_url: "/images/avatars/rachel.png",
      },
    },
    {
      id: 6,
      image_url: "/images/courseCard.png",
      title: "Fluid Mechanics",
      description:
        "Covers fluid statics and dynamics, pressure distributions, and practical system design with flow analysis.",
      price: "90,000frw",
      no_lessons: "12",
      no_hours: "18hrs40min",
      enrolled: true,
      open: false,
      uploader: {
        name: "Ndayambaje Yves",
        avatar_url: "/images/avatars/yves.png",
      },
    },
  ];

  const [courses, setCourses] = useState<Course[]>();

  useEffect(() => {
    const fetchData = async () => {
      setCourses(data);
    };
    fetchData();
  }, []);

  const handleConfirmCourse = (course: Course) => {
    setConfirmModal({
      isOpen: true,
      type: 'confirm',
      course: course
    });
  };

  const handleDeleteCourse = (course: Course) => {
    setConfirmModal({
      isOpen: true,
      type: 'delete',
      course: course
    });
  };

  const executeConfirmCourse = async () => {
    if (!confirmModal.course?.id) return;
    
    const courseId = confirmModal.course.id;
    setLoading(prev => ({
      ...prev,
      [courseId]: { ...prev[courseId], confirm: true }
    }));

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log("Course confirmed:", courseId);
      
      // Here you would typically update the course status or remove it from the list
      // For demo purposes, we'll just log it
      
      // You could update the courses state here
      // setCourses(prevCourses => prevCourses?.filter(c => c.id !== courseId));
      
    } catch (error) {
      console.error("Error confirming course:", error);
    } finally {
      setLoading(prev => ({
        ...prev,
        [courseId]: { ...prev[courseId], confirm: false }
      }));
      setConfirmModal({ isOpen: false, type: null, course: null });
    }
  };

  const executeDeleteCourse = async () => {
    if (!confirmModal.course?.id) return;
    
    const courseId = confirmModal.course.id;
    setLoading(prev => ({
      ...prev,
      [courseId]: { ...prev[courseId], delete: true }
    }));

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log("Course deleted:", courseId);
      
      // Here you would typically remove the course from the list
      // setCourses(prevCourses => prevCourses?.filter(c => c.id !== courseId));
      
    } catch (error) {
      console.error("Error deleting course:", error);
    } finally {
      setLoading(prev => ({
        ...prev,
        [courseId]: { ...prev[courseId], delete: false }
      }));
      setConfirmModal({ isOpen: false, type: null, course: null });
    }
  };

  const handleModalConfirm = () => {
    if (confirmModal.type === 'confirm') {
      executeConfirmCourse();
    } else if (confirmModal.type === 'delete') {
      executeDeleteCourse();
    }
  };

  const closeModal = () => {
    setConfirmModal({ isOpen: false, type: null, course: null });
  };

  return (
    <div className="min-h-screen  p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center -mt-6 text-center mb-8">
          <div className="bg-white px-3 py-2 rounded-lg shadow-sm ">
            <h4 className="font-bold text-[17px] text-[#004e64]">
              Requested Courses ({data.length})
            </h4>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
          {data.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200"
            >
              <div className="relative">
                <img
                  src={course.image_url}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://via.placeholder.com/400x200/004e64/white?text=${course.title}`;
                  }}
                />
                <div className="absolute top-3 right-3">
                  <button
                    className="bg-white/90 cursor-pointer backdrop-blur-sm text-[#004e64] p-2 rounded-full hover:bg-white hover:text-[#003a4c] transition-all duration-200 shadow-md"
                    onClick={() => handleViewDetails(course)}
                    title="View course details"
                  >
                    <FaEye className="text-sm" />
                  </button>
                </div>
              </div>

              <div className="p-5">
                <div className="mb-3">
                  <h3 className="font-semibold text-[#004e64] text-lg mb-1 line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="mb-4">
                  <p className="text-[#004e64] font-semibold text-lg">{course.price}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                    <span>{course.no_lessons} lessons</span>
                    <span>{course.no_hours}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleConfirmCourse(course)}
                    disabled={course.id ? loading[course.id]?.confirm : false}
                    className={`flex-1  flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white font-medium transition-all duration-200 ${
                      course.id && loading[course.id]?.confirm
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-[#034153] hover:bg-[#025a70] cursor-pointer hover:shadow-md'
                    }`}
                  >
                    {course.id && loading[course.id]?.confirm ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FaCheck className="text-sm" />
                    )}
                    {course.id && loading[course.id]?.confirm ? 'Confirming...' : 'Confirm'}
                  </button>

                  <button
                    onClick={() => handleDeleteCourse(course)}
                    disabled={course.id ? loading[course.id]?.delete : false}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white font-medium transition-all duration-200 ${
                      course.id && loading[course.id]?.delete
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-red-500 hover:bg-red-600 cursor-pointer hover:shadow-md'
                    }`}
                  >
                    {course.id && loading[course.id]?.delete ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FaTrash className="text-sm" />
                    )}
                    {course.id && loading[course.id]?.delete ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          onClose={closeModal}
          onConfirm={handleModalConfirm}
          title={
            confirmModal.type === 'confirm' 
              ? 'Confirm Course Request' 
              : 'Delete Course Request'
          }
          message={
            confirmModal.type === 'confirm'
              ? `Are you sure you want to confirm the course "${confirmModal.course?.title}"? This action will approve the course request.`
              : `Are you sure you want to delete the course request "${confirmModal.course?.title}"? This action cannot be undone.`
          }
          confirmText={confirmModal.type === 'confirm' ? 'Confirm Course' : 'Delete Course'}
          confirmColor={confirmModal.type === 'confirm' ? 'bg-[#034153]' : 'bg-red-500'}
        />
      </div>
    </div>
  );
};

export default RequestedCourses;