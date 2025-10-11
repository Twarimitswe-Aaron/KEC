import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGetUploadedCoursesQuery } from "./../state/api/courseApi";
import { BookOpen } from "lucide-react";
import { UserRoleContext } from "../UserRoleContext";

interface Course {
  id: number;
  image_url: string;
  title: string;
  description: string;
  price: string;
  open?: boolean;
  no_lessons: string;
  uploader: { id: number; email: string; name: string; avatar_url: string };
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
  return (
    <div>
    <div className="flex justify-center text-center -mt-6 mb-8">
      <div className="bg-white px-3 py-2 rounded-lg shadow-sm">
        <h4 className="font-bold text-[17px] text-[#004e64]">
          Uploaded Courses ({courses.length})
        </h4>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 mt-4 lg:grid-cols-2 gap-6">
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
            />
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
              <p className="text-[#004e64] font-semibold text-lg">
                {course.price}
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                <span>{course.no_lessons || "0"} lessons</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
              onClick={()=>navigate(`${course.id}`)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white font-medium transition-all duration-200 
                       bg-[#034153] hover:bg-[#025a70] cursor-pointer hover:shadow-md
                      `}
              >
                View
              </button>

             <div className="flex gap-2 items-center pl-2 rounded-l-lg rounded-r-full shadow-md cursor-pointer" >
             <p className=" text-gray-500 text-sm">{course.uploader.name.split(" ")[1]}</p>
             <Link
                to={`/profile/${course.uploader.id}`}
                className="flex items-center gap-2"
              >
                <img
                  src={course.uploader.avatar_url}
                  alt={`${course.uploader.name} avatar`}
                  className="w-10 h-10 rounded-full border-none shadow-sm object-cover"
                />
              </Link>
             </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
  );
};


const CourseSkeleton: React.FC = () => (
  <div className="bg-white rounded-md shadow-md overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-300"></div>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded w-full"></div>
      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      <div className="flex justify-between items-center mt-3">
        <div className="h-4 bg-gray-300 rounded w-16"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="mt-4 h-8 bg-gray-300 rounded-sm w-full"></div>
    </div>
  </div>
);

const EmptyDisplay: React.FC<{ onConfirmCourse: () => void }> = ({
  onConfirmCourse,
}) => {
  const userRole = useContext(UserRoleContext);
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="bg-[#e6ebf560] p-6 rounded-full mb-6 shadow-sm">
        <BookOpen className="text-[#004e64]" size={60} />
      </div>
      <h3 className="text-xl font-semibold text-[#004e64] mb-2">
        No Courses Uploaded Yet
      </h3>
      <p className="text-gray-500 text-sm mb-6 text-center max-w-sm">
        Start by creating your first course to share your knowledge with
        learners.
      </p>
      {userRole === "admin" && (
        <button
          onClick={onConfirmCourse}
          className="bg-[#004e64] cursor-pointer hover:bg-[#006b86] text-white py-2 px-5 rounded-md shadow-md transition-all"
        >
          Confirm Course
        </button>
      )}
    </div>
  );
};

const AdminCourseManagement: React.FC = () => {
  const navigate = useNavigate();
  const {
    data: courses = [],
    isLoading,
    isFetching,
  } = useGetUploadedCoursesQuery();

  const handleCourseAction = (id: number) => {
    navigate(`${id}/create-modules`);
  };

  const handleConfirmCourse = () => {
    navigate("requestedCourses");
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex justify-center text-center -mt-6 mb-8">
          <div className="bg-white px-3 py-2 rounded-lg shadow-sm">
            <h4 className="font-bold text-[17px] text-[#004e64]">
              Loading Courses...
            </h4>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mt-4">
          {[...Array(4)].map((_, i) => (
            <CourseSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {isFetching && !isLoading && (
        <div className="text-center text-sm text-gray-500 mb-2">
          Updating course list...
        </div>
      )}
      {courses.length === 0 ? (
        <EmptyDisplay onConfirmCourse={handleConfirmCourse} />
      ) : (
        <DashboardCard courses={courses} onCourseAction={handleCourseAction} />
      )}
    </div>
  );
};

export default AdminCourseManagement;
