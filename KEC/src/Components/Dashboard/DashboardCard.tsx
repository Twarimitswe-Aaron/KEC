import React, { useState, useContext } from "react";
import { FaEye } from "react-icons/fa";

import CourseCard, { Course } from "./CourseCard";
import { UserRoleContext } from "../../UserRoleContext";

interface DashboardCardProps {
  courses: Course[];
  onCourseAction: (id: number) => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  courses,
  onCourseAction,
}) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const userRole = useContext(UserRoleContext);

  const handleViewDetails = (course: Course) => {
    setSelectedCourse(course);
  };

  const handleCloseDetails = () => {
    setSelectedCourse(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 mt-4 scroll-hide sm:grid-cols-2 lg:grid-cols-2 gap-6">
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
                  userRole?.toLowerCase() === "admin" )&& (
                    <div className="">
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
                <p className="text-[#004e64] ">{course.price}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{course.no_lessons} lessons</span>
                  <span>•</span>
                  <span>{course.no_hours} hours</span>
                </div>
              </div>

              {userRole === "student" && course.id !== undefined && (
                <button
                  onClick={() => onCourseAction(course.id!)}
                  className="mt-4 bg-[#004e64] cursor-pointer text-white px-4 py-2 rounded hover:bg-[#003a4c] transition-colors"
                >
                  Enroll Now
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedCourse && (
        <div className="fixed inset-0 bg-[#00000080] bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-md shadow-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto relative">
            {/* Close button for the modal */}
            <button
              onClick={handleCloseDetails}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl font-bold"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-[#004e64] mb-4">
              {selectedCourse.title}
            </h2>

            <p className="text-gray-700 mb-4">{selectedCourse.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800">
              <p>
                <strong>Price:</strong> {selectedCourse.price}
              </p>
              <p>
                <strong>Lessons:</strong> {selectedCourse.no_lessons}
              </p>
              <p>
                <strong>Hours:</strong> {selectedCourse.no_hours}
              </p>
              <p>
                <strong>students:</strong> {12}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardCard;
