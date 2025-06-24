import React, { useState } from "react";
import CourseCard, { Course } from "./CourseCard";

interface DashboardCardProps {
  courses: Course[];
  onCourseAction: (id: number) => void;
}


const DashboardCard: React.FC<DashboardCardProps> = ({
courses,
onCourseAction,
}) => (
<div className="grid grid-cols-1 scroll-hide sm:grid-cols-2 lg:grid-cols-2 gap-6">
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
        <h3 className="font-semibold text-[#004e64] mb-2 ">{course.title}</h3>
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
      </div>
    </div>
  ))}
</div>
);

export default DashboardCard;
