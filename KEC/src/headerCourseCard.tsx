import React, { useMemo } from 'react';
import { Course } from './types/dashboard';
import { useGetStudentCoursesQuery } from './state/api/courseApi';

interface HeaderCourseCardProps {
  courses: Course[];
  selectedCourse: string;
  onCourseChange: (courseId: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const HeaderCourseCard: React.FC<HeaderCourseCardProps> = ({
  courses, // Keeping this prop but preferring API data for categories if available
  selectedCourse,
  onCourseChange,
  selectedCategory,
  onCategoryChange,
}) => {
  const { data: studentCourses = [] } = useGetStudentCoursesQuery();
  
  console.log('HeaderCourseCard: Fetched studentCourses:', studentCourses);
  if (studentCourses.length > 0) {
    console.log('HeaderCourseCard: First course sample:', JSON.stringify(studentCourses[0], null, 2));
  }

  // Extract unique categories from courses (preferring studentCourses from API)
  const categories = useMemo(() => {
    const cats = new Set<string>();
    const sourceCourses = studentCourses.length > 0 ? studentCourses : courses;
    
    sourceCourses.forEach((course: any) => {
      // Default to 'Uncategorized' if category is null/undefined/empty
      const cat = course.category || 'Uncategorized';
      cats.add(cat);
    });
    const uniqueCats = Array.from(cats).sort();
    console.log('HeaderCourseCard: Extracted categories:', uniqueCats);
    return uniqueCats;
  }, [courses, studentCourses]);

  // Filter courses based on selected category
  const filteredCourses = useMemo(() => {
    const sourceCourses = studentCourses.length > 0 ? studentCourses : courses;
    if (selectedCategory === 'all' || !selectedCategory) {
      return sourceCourses;
    }
    return sourceCourses.filter((course: any) => {
      const cat = course.category || 'Uncategorized';
      return cat === selectedCategory;
    });
  }, [courses, studentCourses, selectedCategory]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="font-bold text-lg text-gray-800">Different Courses</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="block w-full sm:w-48 rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Course Dropdown */}
          {/* <select
            value={selectedCourse}
            onChange={(e) => onCourseChange(e.target.value)}
            className="block w-full sm:w-64 rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
          >
            <option value="all">All Courses</option>
            {filteredCourses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select> */}
        </div>
      </div>
    </div>
  );
};

export default HeaderCourseCard;
