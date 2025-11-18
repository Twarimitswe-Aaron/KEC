import React, { useMemo } from 'react';
import { Course } from '../../types/dashboard';
import { useGetStudentCoursesQuery } from '../../state/api/courseApi';

interface HeaderCourseCardProps {
  courses: Course[];
  selectedCourse: string;
  onCourseChange: (courseId: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const HeaderCourseCard: React.FC<HeaderCourseCardProps> = ({
  courses,
  selectedCourse,
  onCourseChange,
  selectedCategory,
  onCategoryChange,
}) => {
  const { data: studentCourses = [] } = useGetStudentCoursesQuery();
  const categories = useMemo(() => {
    const set = new Set<string>();
    (studentCourses || []).forEach((c: any) => {
      const cat = (c && c.category) ? String(c.category) : '';
      if (cat) set.add(cat);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [studentCourses]);

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

  const studentOptions: Course[] = useMemo(() => {
    const list: Course[] = (studentCourses || []).map((c: any) => ({
      id: String(c.id),
      name: c.title,
      description: c.description,
    }));
    const filtered = selectedCategory === 'all'
      ? list
      : list.filter(opt => {
          const found = (studentCourses as any[]).find((sc: any) => String(sc.id) === opt.id);
          return (found?.category || '') === selectedCategory;
        });
    const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [studentCourses, selectedCategory]);

  const displayCourses = studentOptions.length > 0
    ? studentOptions
    : (courses.length > 0 ? courses : fallbackCourses);

  const selectedId = selectedCourse && selectedCourse !== '' ? selectedCourse : 'all';
  const selectedCat = selectedCategory && selectedCategory !== '' ? selectedCategory : 'all';

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
        <h2 className="sm:text-xl text-12 font-bold">Your Courses</h2>
        <div className="flex gap-2">
          <select
            value={selectedCat}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="block w-48 rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-10 sm:text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={selectedId}
            onChange={(e) => onCourseChange(e.target.value)}
            className="block w-48 rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-10 sm:text-sm"
          >
            <option value="all">All</option>
            {displayCourses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedId !== 'all' && (
        <div className="mt-4">
          <h3 className="sm:text-lg text-sm font-semibold">
            {displayCourses.find(c => c.id === selectedId)?.name}
          </h3>
          <p className="text-gray-600 text-sm sm:text-lg mt-2">
            {displayCourses.find(c => c.id === selectedId)?.description}
          </p>
          {displayCourses.find(c => c.id === selectedId)?.progress !== undefined && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${displayCourses.find(c => c.id === selectedId)?.progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Content: {displayCourses.find(c => c.id === selectedId)?.progress}%
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HeaderCourseCard;