import React, { useEffect, useState, useContext } from "react";
import { Course } from "../Components/Dashboard/CourseCard";
import { UserRoleContext } from "../UserRoleContext";
import { FaEye, FaTimes, FaCheck, FaTrash } from "react-icons/fa";
import { BookOpen } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useConfirmCourseMutation,
  useDeleteCourseMutation,
  useCoursesQuery,
} from "../state/api/courseApi";
import { SearchContext } from "../SearchContext";

// Add this CSS for the fade-in-up animation
const styles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fade-in-up {
    animation: fadeInUp 0.5s ease-out forwards;
    opacity: 0;
  }
`;

// Inject the styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

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
  cancelColor = "bg-gray-500",
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
  const { searchQuery } = useContext(SearchContext);
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null as "confirm" | "delete" | null,
    course: null as Course | null,
  });

  const userRole = useContext(UserRoleContext);

  // RTK Query hooks
  const {
    data: coursesData,
    isLoading,
    isError,
    refetch,
  } = useCoursesQuery({ unconfirmed: true });
  const [confirmCourse] = useConfirmCourseMutation();
  const [deleteCourse] = useDeleteCourseMutation();

  const [loading, setLoading] = useState<{
    [key: number]: { confirm: boolean; delete: boolean };
  }>({});

  const handleViewDetails = (course: Course) => {
    navigate(`/course-management/view-lessons/${course.id}`);
  };

  const handleCloseDetails = () => {
    setSelectedCourse(null);
  };

  const handleConfirmCourse = (course: Course) => {
    setConfirmModal({
      isOpen: true,
      type: "confirm",
      course: course,
    });
  };

  const handleDeleteCourse = (course: Course) => {
    setConfirmModal({
      isOpen: true,
      type: "delete",
      course: course,
    });
  };

  const executeConfirmCourse = async () => {
    if (!confirmModal.course?.id) return;

    const courseId = confirmModal.course.id;
    setLoading((prev) => ({
      ...prev,
      [courseId]: { ...prev[courseId], confirm: true },
    }));

    try {
      const { message } = await confirmCourse(courseId).unwrap();
      toast.success(message);
      await refetch();
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        (err as Error)?.message ??
        "Something went wrong";
      toast.error(message);
      console.error("Error confirming course:", err);
    } finally {
      setLoading((prev) => ({
        ...prev,
        [courseId]: { ...prev[courseId], confirm: false },
      }));
      setConfirmModal({ isOpen: false, type: null, course: null });
    }
  };

  const executeDeleteCourse = async () => {
    if (!confirmModal.course?.id) return;

    const courseId = confirmModal.course.id;
    setLoading((prev) => ({
      ...prev,
      [courseId]: { ...prev[courseId], delete: true },
    }));

    try {
      const { message } = await deleteCourse(courseId).unwrap();
      toast.success(message);
      await refetch();
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        (err as Error)?.message ??
        "Something went wrong";
      toast.error(message);
      console.error("Error deleting course:", err);
    } finally {
      setLoading((prev) => ({
        ...prev,
        [courseId]: { ...prev[courseId], delete: false },
      }));
      setConfirmModal({ isOpen: false, type: null, course: null });
    }
  };

  const handleModalConfirm = () => {
    if (confirmModal.type === "confirm") {
      executeConfirmCourse();
    } else if (confirmModal.type === "delete") {
      executeDeleteCourse();
    }
  };

  const closeModal = () => {
    setConfirmModal({ isOpen: false, type: null, course: null });
  };

  if (isLoading)
    return (
      <div className="min-h-screen p-4 flex justify-center items-center">
        <p className="text-gray-400">Loading courses...</p>
      </div>
    );
  if (isError)
    return (
      <div className="min-h-screen p-4 flex justify-center items-center">
        <p className="text-red-500">Failed to load courses.</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-center text-center -mt-1 mb-8">
          <div className="bg-white px-3 py-2 rounded-lg shadow-sm">
            <h4 className="font-bold text-[17px] text-[#004e64]">
              Requested Courses ({coursesData?.length || 0})
            </h4>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 pb-8">
          {coursesData && coursesData.length > 0 ? (
            coursesData
              .filter((course: Course) =>
                course.title.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((course: Course, index: number) => (
                <div
                  key={course.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Course Image */}
                  <div className="relative h-40 overflow-hidden bg-gradient-to-br from-[#034153] to-[#004e64]">
                    <img
                      src={
                        course.image_url ||
                        `https://via.placeholder.com/400x200/034153/white?text=${encodeURIComponent(
                          course.title
                        )}`
                      }
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = `https://via.placeholder.com/400x200/034153/white?text=${encodeURIComponent(
                          course.title
                        )}`;
                      }}
                    />

                    {/* Status Badge */}
                    <div className="absolute top-2 left-2">
                      <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-[10px] font-semibold shadow-md backdrop-blur-sm flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                        Pending
                      </span>
                    </div>

                    {/* View Button */}
                    <div className="absolute top-2 right-2">
                      <button
                        className="bg-white text-[#034153] p-1.5 rounded-lg hover:bg-[#034153] hover:text-white transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 cursor-pointer"
                        onClick={() => handleViewDetails(course)}
                        title="View course details"
                      >
                        <FaEye className="text-xs" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3">
                    {/* Title & Description */}
                    <div className="mb-3">
                      <h3 className="font-bold text-[#004e64] text-base mb-1 line-clamp-1 group-hover:text-[#034153] transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                    </div>

                    {/* Price & Lessons */}
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                      <div className="bg-[#034153]/10 px-2.5 py-1 rounded-lg">
                        <p className="text-[#034153] font-bold text-sm">
                          RWF {course.price}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded-lg">
                        <BookOpen className="w-3 h-3 text-blue-600" />
                        <span className="text-blue-700 font-semibold text-xs">
                          {course.no_lessons || "0"}
                        </span>
                      </div>
                    </div>

                    {/* Uploader Info */}
                    <div className="mb-3">
                      <Link
                        to={`/profile/${course.uploader.id}`}
                        className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-lg transition-colors"
                      >
                        <img
                          src={
                            course.uploader.avatar_url ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              course.uploader.name
                            )}&background=022F40&color=ffffff&rounded=true&size=28`
                          }
                          alt={`${course.uploader.name} avatar`}
                          className="w-7 h-7 rounded-full border border-gray-200 object-cover"
                        />
                        <div>
                          <p className="text-gray-700 font-medium text-xs">
                            {course.uploader.name}
                          </p>
                          <p className="text-gray-400 text-[10px]">
                            Instructor
                          </p>
                        </div>
                      </Link>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleConfirmCourse(course)}
                        disabled={
                          course.id ? loading[course.id]?.confirm : false
                        }
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                          course.id && loading[course.id]?.confirm
                            ? "bg-gray-300 cursor-not-allowed text-gray-500"
                            : "bg-[#034153] hover:bg-[#025a70] text-white cursor-pointer shadow-md hover:shadow-lg"
                        }`}
                      >
                        {course.id && loading[course.id]?.confirm ? (
                          <>
                            <div className="w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                            <span>...</span>
                          </>
                        ) : (
                          <>
                            <FaCheck className="text-xs" />
                            <span>Confirm</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleDeleteCourse(course)}
                        disabled={
                          course.id ? loading[course.id]?.delete : false
                        }
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                          course.id && loading[course.id]?.delete
                            ? "bg-gray-300 cursor-not-allowed text-gray-500"
                            : "bg-red-500 hover:bg-red-600 text-white cursor-pointer shadow-md hover:shadow-lg"
                        }`}
                      >
                        {course.id && loading[course.id]?.delete ? (
                          <>
                            <div className="w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                            <span>...</span>
                          </>
                        ) : (
                          <>
                            <FaTrash className="text-xs" />
                            <span>Delete</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20">
              <div className="bg-gray-50 rounded-2xl p-12 shadow-sm border border-gray-200 text-center max-w-md">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  No Course Requests
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  There are currently no course requests to review. New requests
                  will appear here when instructors submit courses for approval.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          onClose={closeModal}
          onConfirm={handleModalConfirm}
          title={
            confirmModal.type === "confirm"
              ? "Confirm Course Request"
              : "Delete Course Request"
          }
          message={
            confirmModal.type === "confirm"
              ? `Are you sure you want to confirm the course "${confirmModal.course?.title}"? This action will approve the course request.`
              : `Are you sure you want to delete the course request "${confirmModal.course?.title}"? This action cannot be undone.`
          }
          confirmText={
            confirmModal.type === "confirm" ? "Confirm Course" : "Delete Course"
          }
          confirmColor={
            confirmModal.type === "confirm" ? "bg-[#034153]" : "bg-red-500"
          }
        />
      </div>
    </div>
  );
};

export default RequestedCourses;
