import React, { useEffect, useState, useContext } from "react";
import { Course } from "../Components/Dashboard/CourseCard";
import { UserRoleContext } from "../UserRoleContext";
import { FaEye, FaTimes, FaCheck, FaTrash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useConfirmCourseMutation, useDeleteCourseMutation, useGetUnconfirmedCoursesQuery } from "../state/api/courseApi";

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
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null as 'confirm' | 'delete' | null,
    course: null as Course | null
  });
  
  const userRole = useContext(UserRoleContext);

  // RTK Query hooks
  const { data: coursesData, isLoading, isError, refetch } = useGetUnconfirmedCoursesQuery();
  const [confirmCourse] = useConfirmCourseMutation();
  const [deleteCourse] = useDeleteCourseMutation();

  const [loading, setLoading] = useState<{ [key: number]: { confirm: boolean; delete: boolean } }>({});

  const handleViewDetails = (course: Course) => {
    setSelectedCourse(course);
    navigate("/course-management/view-lessons");
  };

  const handleCloseDetails = () => {
    setSelectedCourse(null);
  };

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

  if (isLoading) return <div className="min-h-screen p-4 flex justify-center items-center"><p className="text-gray-400">Loading courses...</p></div>;
  if (isError) return <div className="min-h-screen p-4 flex justify-center items-center"><p className="text-red-500">Failed to load courses.</p></div>;

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center -mt-6 text-center mb-8">
          <div className="bg-white px-3 py-2 rounded-lg shadow-sm ">
            <h4 className="font-bold text-[17px] text-[#004e64]">
              Requested Courses ({coursesData?.length || 0})
            </h4>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
          {coursesData && coursesData.length > 0 ? (
            coursesData.map((course: any) => (
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
                      <span>{course.no_lessons || '0'} lessons</span>

                    </div>
                  </div>

                 <div className="flex my-3 gap-1.5">
                 <Link
                to={`/profile/${course.uploader.id}`}
                className="flex items-center gap-2"
              >
                <img
                  src={course.uploader.avatar_url}
                  alt={`${course.uploader.name} avatar`}
                  className="w-8 h-8 rounded-full border-none shadow-sm object-cover"
                />
                <p className=" text-gray-500 text-sm">{course.uploader.name.split(" ")[1]}</p>
              </Link>
                 </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleConfirmCourse(course)}
                      disabled={course.id ? loading[course.id]?.confirm : false}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white font-medium transition-all duration-200 ${
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
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400">No requested courses found.</p>
            </div>
          )}
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