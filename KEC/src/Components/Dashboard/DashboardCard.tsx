import React, { useState } from "react";
import CourseCard, { Course } from "./CourseCard";

interface DashboardCardProps {
  courses: Course[];
  onCourseAction: (courseId: number) => void;
  variant?: 'default' | 'student';
  title?: string;
  emptyMessage?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  courses,
  onCourseAction,
  variant = 'default',
  title,
  emptyMessage = 'No courses available'
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!courses || courses.length === 0) {
    return (
      <div className="w-full px-4 py-6">
        <p className="text-gray-500 text-center">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full my-6">
      {title && (
        <h2 className="text-xl font-semibold my-4 text-gray-800">{title}</h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {courses.map((course, index) => (
          <CourseCard
            key={course.id || index}
            course={course}
            onAction={onCourseAction}
            variant={variant}
            index={index}
            expandedIndex={expandedIndex}
            onExpand={setExpandedIndex}
          />
        ))}
      </div>
    </div>
  );
};

export default DashboardCard;
