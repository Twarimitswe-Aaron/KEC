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
      <div className="w-full text-gray-500 text-center py-8">
        {title && <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>}
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      {title && (
        <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>
      )}
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
    </>
  );
};

export default DashboardCard;
