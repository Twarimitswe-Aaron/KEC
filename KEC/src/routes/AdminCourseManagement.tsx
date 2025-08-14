import React, { useEffect, useState } from "react";

interface Course {
  id: number;
  image_url: string;
  title: string;
  description: string;
  price: string;
  open?: boolean;
  no_lessons: string;
  no_hours: string;
  uploader: { name: string; avatar_url: string };
}

// Mock data for demonstration
const mockData: Course[] = [
  {
    id: 1,
    title: "React Fundamentals",
    description: "Learn React from scratch with hands-on projects",
    price: "50,000 RWF",
    image_url: "/images/courseCard.png",
    no_lessons: "15",
    open: true,
    no_hours: "10",
    uploader: {
      name: "John Doe",
      avatar_url: "https://via.placeholder.com/40",
    },
  },
  {
    id: 2,
    title: "Advanced JavaScript",
    description: "Master modern JavaScript concepts",
    price: "75,000 RWF",
    image_url: "/images/courseCard.png",
    no_lessons: "20",
    no_hours: "15",
    open: true,
    uploader: {
      name: "Jane Smith",
      avatar_url: "https://via.placeholder.com/40",
    },
  },
  // Add more mock data as needed
];

interface DashboardCardProps {
  courses: Course[];
  onCourseAction: (id: number) => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ courses, onCourseAction }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
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
              e.currentTarget.src =
                "https://via.placeholder.com/400x200/004e64/white?text=Course+Image";
            }}
          />
        </div>
        <div className="p-4">
          <div className="flex justify-between">
            <h3 className="font-semibold text-[#004e64] mb-2">
              {course.title}
            </h3>
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
              <span>•</span>
              <span>{course.no_hours} hours</span>
            </div>
          </div>
          <div className="flex items-center mt-4">
            <button 
              className="bg-[#004e64] py-2 px-4 text-white rounded-sm"
              onClick={() => onCourseAction(course.id)}
            >
              View
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const AdminCourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    setCourses(mockData);
  }, []);

  const handleCourseAction = (id: number) => {
    console.log("Course action:", id);
    // You can implement navigation or other actions here
  };

  return (
    <div className="p-4">
      <DashboardCard
        courses={courses}
        onCourseAction={handleCourseAction}
      />
    </div>
  );
};

export default AdminCourseManagement;