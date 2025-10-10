import React,{useContext} from "react";
import { useNavigate } from "react-router-dom";
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
  uploader: { name: string; avatar_url: string };
}

interface DashboardCardProps {
  courses: Course[];
  onCourseAction: (id: number) => void;
}


const DashboardCard: React.FC<DashboardCardProps> = ({ courses, onCourseAction }) => (

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
          <div className="p-4">
            <div className="flex justify-between">
              <h3 className="font-semibold text-[#004e64] mb-2">{course.title}</h3>
              {course.open ? (
                <span className="text-green-500 text-sm font-medium">Open</span>
              ) : (
                <span className="text-red-500 text-sm font-medium">Closed</span>
              )}
            </div>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {course.description}
            </p>
            <div className="flex justify-between items-center">
              <p className="text-[#004e64] font-bold">{course.price}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{course.no_lessons} lessons</span>
              </div>
            </div>
            <div className="flex items-center mt-4">
              <button
                className="bg-[#004e64] cursor-pointer py-2 px-4 text-white rounded-sm"
                onClick={() => onCourseAction(course.id)}
              >
                View
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);


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


const EmptyDisplay: React.FC<{ onConfirmCourse: () => void }> = ({ onConfirmCourse }) => {
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
        Start by creating your first course to share your knowledge with learners.
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
  const { data: courses = [], isLoading, isFetching } = useGetUploadedCoursesQuery();

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
