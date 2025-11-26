import React, { useContext } from "react";
import { BsCameraVideoFill } from "react-icons/bs";
import { UserRoleContext } from "../../UserRoleContext";
import { Link } from "react-router-dom";
import CourseActionsMenu from "../CourseActionsMenu";
import { CourseStatus } from "../../state/api/courseApi";

export interface Course {
  id?: number;
  image_url: string;
  title: string;
  description: string;
  category?: string;
  price: string;
  open: boolean;
  no_lessons: string;
  enrolled?: boolean;
  completed?: boolean;
  createdAt?: string;
  status?: CourseStatus;
  certificateIssued?: boolean;
  certificateStatus?: "PENDING" | "APPROVED" | "REJECTED";

  uploader: {
    id: number;
    email: string;
    name: string;
    avatar_url: string;
  };
}

interface CourseCardProps {
  course: Course;
  onAction: (courseId: number) => void;
  variant?: "default" | "student";
  index: number;
  expandedIndex: number | null;
  onExpand: (index: number | null) => void;
  currentUserId?: number;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onAction,
  variant = "default",
  index,
  expandedIndex,
  onExpand,
  currentUserId,
}) => {
  const userRole = useContext(UserRoleContext);
  const isOwner = currentUserId === course.uploader.id;
  const isAdmin = userRole === "admin";
  const canManage = isOwner || isAdmin;

  return (
    <div className="bg-white w-full rounded-xl shadow-md overflow-hidden relative">
      {/* Course Actions Menu - Top Right */}
      {canManage && course.id && (
        <div className="absolute top-2 right-2 z-10">
          <CourseActionsMenu
            courseId={course.id}
            courseName={course.title}
            courseStatus={course.status}
          />
        </div>
      )}

      {/* Status Badge - Top Left */}
      {course.status && (
        <div className="absolute top-2 left-2 z-10">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${
              course.status === CourseStatus.ACTIVE
                ? "bg-green-500/20 text-green-700 border border-green-500/30"
                : "bg-gray-500/20 text-gray-700 border border-gray-500/30"
            }`}
          >
            {course.status}
          </span>
        </div>
      )}

      {/* Expanded description modal */}
      {expandedIndex === index && (
        <div className="fixed inset-0 bg-[#0006] bg-opacity-10 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
              onClick={() => onExpand(null)}
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
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {course.uploader.name}
                </p>
              </div>

              <p className="text-gray-600 leading-relaxed">
                {course.description}
              </p>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <BsCameraVideoFill className="text-blue-500" />{" "}
                  {course.no_lessons} lessons
                </span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-lg font-bold text-[#022F40]">
                  {course.price}
                </p>
                <button
                  onClick={() => course.id && onAction(course.id)}
                  className="px-6 py-2 bg-[#022F40] text-white rounded hover:bg-opacity-90 transition-colors"
                >
                  {variant === "student"
                    ? "Continue Course"
                    : userRole === "teacher" || userRole === "admin"
                    ? "Edit Course"
                    : "Start course"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card Image */}
      <img
        src={course.image_url}
        alt={course.title}
        className="w-full h-[150px] object-cover"
      />

      {/* Card Body */}
      <div className="p-4 text-left h-[200px] flex flex-col justify-between">
        <div>
          <h2 className="text-md font-semibold truncate">{course.title}</h2>

          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {course.description}
          </p>

          {expandedIndex !== index && (
            <div className="flex justify-between items-center mt-2">
              <button
                className="text-blue-600 text-xs hover:text-blue-800 transition-colors flex items-center gap-1"
                onClick={() => onExpand(index)}
              >
                <span>Read more</span>
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <Link
                to={`/profile/${course.uploader.id}`}
                className="text-sm font-semibold flex items-center gap-1"
              >
                <img
                  src={course.uploader.avatar_url}
                  alt={course.uploader.name}
                  className="w-6 h-6 object-cover rounded-full"
                />
                <span>{course.uploader.name}</span>
              </Link>
            </div>
          )}

          <div className="mt-3 flex justify-between text-xs text-gray-500">
            <p className="font-bold text-[#022F40] text-[15px]">
              {course.price}
            </p>
            <span className="flex items-center gap-1">
              <BsCameraVideoFill /> {course.no_lessons} lessons
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => course.id && onAction(course.id)}
          className="mt-2 py-2 w-full text-sm h-9 border cursor-pointer border-[#022F40] text-[#022F40] hover:bg-[#fff] shadow-2xl hover:text-[#022F40] rounded transition"
        >
          {variant === "student"
            ? "Continue Course"
            : userRole === "teacher" || userRole === "admin"
            ? "View"
            : "Start Course"}
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
