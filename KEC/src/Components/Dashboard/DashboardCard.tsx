import React, { useState, useContext } from "react";
import { FaEye } from "react-icons/fa";
import CourseCard, { Course } from "./CourseCard";
import { UserRoleContext } from "../../UserRoleContext";
import { useNavigate } from "react-router-dom";
import { useEnrollCourseMutation } from "../../state/api/courseApi";

// Add fade-in-up animation
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

interface DashboardCardProps {
  courses: Course[];
  onCourseAction: (id: number) => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  courses,
  onCourseAction,
}) => {
  const navigate = useNavigate();

  const [enrollingCourse, setEnrollingCourse] = useState<Course | null>(null);
  const userRole = useContext(UserRoleContext);
  const [enrollCourse, { isLoading: isEnrolling }] = useEnrollCourseMutation();

  const handleViewDetails = (course: Course) => {
    navigate(`/course-creation/course/${course.id}`);
  };
  const handleEnrollingCourse = async () => {
    if (!enrollingCourse?.id) return;
    try {
      await enrollCourse(enrollingCourse.id).unwrap();
      setEnrollingCourse(null);
      navigate(`/dashboard/course/${enrollingCourse.id}`);
    } catch (err) {
      setEnrollingCourse(null);
    }
  };

  const handleCloseDetails = () => {};

  return (
    <>
      {/* Course cards */}
      <div className="grid grid-cols-1 mt-4 scroll-hide sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {courses.map((course, index) => (
          <div
            key={course.id}
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/50 overflow-hidden hover:scale-[1.02] hover:-translate-y-1 animate-fade-in-up"
            style={{ animationDelay: `${index * 50}ms` }}
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
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[#004e64] mb-2 ">
                  {course.title}
                </h3>
                {(userRole?.toLowerCase() === "teacher" ||
                  userRole?.toLowerCase() === "admin") && (
                  <div>
                    <p
                      className="text-[#004e64] cursor-pointer hover:text-[#003a4c] transition-colors text-lg flex items-center gap-2"
                      onClick={() => handleViewDetails(course)}
                    >
                      <FaEye />
                    </p>
                  </div>
                )}
              </div>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {course.description}
              </p>
              <div className="flex justify-between items-center">
                <div className="bg-[#034153]/10 px-2.5 py-1 rounded-lg">
                  <p className="text-[#034153] font-bold text-sm">
                    RWF {course.price}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{course.no_lessons} lessons</span>
                </div>
              </div>

              {userRole === "student" && course.id !== undefined && (
                <button
                  onClick={() => {
                    if (course.enrolled) {
                      onCourseAction(course.id!); // continue course
                      navigate(`/dashboard/course/${course.id}`);
                    } else if (course.open) {
                      setEnrollingCourse(course); // open enrollment modal
                    }
                  }}
                  disabled={
                    course.completed || (!course.open && !course.enrolled)
                  }
                  className={`mt-4  w-full px-4 py-2 rounded text-white transition-colors ${
                    course.completed
                      ? "bg-gray-400 cursor-not-allowed"
                      : course.enrolled
                      ? "bg-[#034153] cursor-pointer"
                      : course.open
                      ? "bg-[#034154] cursor-pointer"
                      : "bg-gray-400  cursor-not-allowed"
                  }`}
                >
                  {course.completed
                    ? "Completed"
                    : course.enrolled
                    ? "Continue Course"
                    : course.open
                    ? "Start Course"
                    : "Course Closed"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Enrollment Modal */}
      {enrollingCourse && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative transform scale-100 animate-in slide-in-from-bottom-4 duration-500">
            {/* Close Button */}
            <button
              onClick={() => setEnrollingCourse(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Header with Course Info */}
            <div className="mb-2">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#004e64] to-[#025a73] bg-clip-text text-transparent mb-3">
                {enrollingCourse.title}
              </h2>

              <p className="text-gray-600 leading-relaxed mb-2">
                {enrollingCourse.description}
              </p>

              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-md p-2 border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-md">Course Price</span>
                  <span className="text-lg font-bold text-[#004e64]">
                    RWF {enrollingCourse.price}
                  </span>
                </div>
              </div>
            </div>

            {/* Enhanced Enrollment Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEnrollingCourse();
              }}
              className="space-y-2"
            >
              {/* Location Input */}
              <div className="space-y-2">
                <label className="block text-gray-700 font-semibold text-sm tracking-wide">
                  Location
                </label>
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    required
                    placeholder="Enter your address"
                    className="w-full pl-10 pr-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004e64] focus:border-transparent transition-all duration-200 bg-white"
                  />
                </div>
              </div>

              {/* Phone Input */}
              <div className="space-y-2">
                <label className="block text-gray-700 font-semibold text-sm tracking-wide">
                  Phone Number
                </label>
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <input
                    type="tel"
                    required
                    placeholder="+250 xxx xxx xxx"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004e64] focus:border-transparent transition-all duration-200 bg-white"
                  />
                </div>
              </div>

              {/* Payment Section */}
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-md p-5 border border-amber-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
                    <span className="text-gray-700 font-medium">
                      Payment Status
                    </span>
                  </div>
                  <span className="text-amber-600 font-bold text-sm bg-amber-100 px-3 py-1 rounded-full">
                    PENDING
                  </span>
                </div>

                <button
                  type="button"
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold py-3 px-6 rounded-md shadow-lg hover:shadow-xl transform cursor-pointer hover:scale-101 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  Complete Payment
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isEnrolling}
                className="w-full bg-gradient-to-r from-[#004e64] to-[#025a73] hover:from-[#003a4c] hover:to-[#014d61] text-white font-bold py-4 px-6 rounded-md shadow-lg hover:shadow-xl transform hover:scale-101 cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {isEnrolling ? "Enrolling..." : "Confirm Enrollment"}
              </button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
              <svg
                className="w-4 h-4 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                />
              </svg>
              Your information is secure and encrypted
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardCard;
