import React from 'react';
import { Course } from '../types/dashboard';
import Skeleton from './Skeleton';

interface HeaderCourseCardProps {
  courses: Course[];
  selectedCourse: string;
  onCourseChange: (courseId: string) => void;
}

const HeaderCourseCard: React.FC<HeaderCourseCardProps> = ({
  courses,
  selectedCourse,
  onCourseChange
}) => {
  // Fallback data in case backend is not ready
  const fallbackCourses: Course[] = [
    {
      id: '1',
      name: 'Advanced Thermodynamics',
      description: 'Learn how to simulate machines using temperature',
      instructor: 'John Doe',
      progress: 75
    },
    {
      id: '2',
      name: 'Electrofluiding',
      description: 'Know how to work with water pressure',
      instructor: 'Jane Smith',
      progress: 45
    },
    {
      id: '3',
      name: 'Gears technology',
      description: 'Know how to connect with water pipes ',
      instructor: 'Mike Johnson',
      progress: 30
    }
  ];

  // Use fallback data if courses are not available
  const displayCourses = courses.length > 0 ? courses : fallbackCourses;
  const initialSelectedCourse = selectedCourse || displayCourses[0]?.id;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Skeleton loader structure (commented out)
      <div className="flex justify-between items-center mb-4">
        <Skeleton width="w-32" height="h-6" />
        <Skeleton width="w-64" height="h-10" />
      </div>
      <div className="mt-4">
        <Skeleton width="w-48" height="h-6" className="mb-2" />
        <Skeleton width="w-full" height="h-4" className="mb-4" />
        <Skeleton width="w-full" height="h-2" />
      </div>
      */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Your Courses</h2>
        <select
          value={initialSelectedCourse}
          onChange={(e) => onCourseChange(e.target.value)}
          className="block w-64 rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
        >
          {displayCourses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>
      </div>
      
      {initialSelectedCourse && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">
            {displayCourses.find(c => c.id === initialSelectedCourse)?.name}
          </h3>
          <p className="text-gray-600 mt-2">
            {displayCourses.find(c => c.id === initialSelectedCourse)?.description}
          </p>
          {displayCourses.find(c => c.id === initialSelectedCourse)?.progress !== undefined && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${displayCourses.find(c => c.id === initialSelectedCourse)?.progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Progress: {displayCourses.find(c => c.id === initialSelectedCourse)?.progress}%
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HeaderCourseCard; 