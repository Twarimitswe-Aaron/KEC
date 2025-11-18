import React, { useEffect, useMemo, useState } from "react";
import DashboardCard from './DashboardCard'
import type { Course } from './CourseCard'
import { useGetStudentCoursesQuery } from "../../state/api/courseApi";

const CourseComponent = () => {
  const { data: studentCourses = [], isLoading } = useGetStudentCoursesQuery();
  const [sortBy, setSortBy] = useState<string>("");
  const courses: Course[] = useMemo(() => {
    const mapped: Course[] = (studentCourses || []).map((c: any) => ({
      id: c.id,
      image_url: c.image_url,
      title: c.title,
      description: c.description,
      price: c.price,
      no_lessons: c.no_lessons,
      open: c.open,
      // @ts-ignore add enrolled to match runtime shape
      enrolled: c.enrolled,
      completed: c.completed,
      uploader: {
        id: c.uploader?.id || 0,
        email: c.uploader?.email || "",
        name: c.uploader?.name || "",
        avatar_url: c.uploader?.avatar_url || "",
      },
      createdAt: c.createdAt,
    }));

    // Apply sorting
    if (sortBy === "name") {
      mapped.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "time") {
      mapped.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }
    return mapped;
  }, [studentCourses, sortBy]);

  const handleCourseAction = (courseId: number | String) => {
    console.log('Starting course:', courseId);
  };

  return (
    <div className="block mt-5">
      <div className="flex justify-between">
        <h1 className="font-semiBold text-lg font-bold md:text-xl lg:text-2xl">Different Courses</h1>
        <div className="flex gap-3 justify-center">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="block w-22 h-10 rounded-md border border-gray-300 bg-white py-1 px-1 shadow-sm focus:outline-none focus:ring-1 sm:text-sm"
          >
            <option value="">Sort By</option>
            <option value="name">Name</option>
            <option value="time">Newest</option>
          </select>
          <select className="block w-32 h-10 rounded-md border border-gray-300 bg-white py-1 px-1 shadow-sm focus:outline-none focus:ring-1 sm:text-sm">
            <option value="">Last 12 Months</option>
            <option value="">Last 6 Months</option>
            <option value="">Last 3 Months</option>
            <option value="">Last 1 Months</option>
            <option value="">1 year +</option>
          </select>
        </div>
      </div>

      <div className="">
        {isLoading ? (
          <div className="py-10 text-center text-gray-500">Loading courses...</div>
        ) : (
          <>
            {/* Enrolled Courses */}
            {courses.filter((c) => c.enrolled && !c.completed).length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-2">Enrolled Courses</h2>
                <DashboardCard
                  courses={courses.filter((c) => c.enrolled && !c.completed)}
                  onCourseAction={handleCourseAction}
                />
              </div>
            )}

            {/* Completed Courses */}
            {courses.filter((c) => c.completed).length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-2">Completed Courses</h2>
                <DashboardCard
                  courses={courses.filter((c) => c.completed)}
                  onCourseAction={handleCourseAction}
                />
              </div>
            )}

            {/* Available Courses */}
            {courses.filter((c) => !c.enrolled && !c.completed).length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-2">Available Courses</h2>
                <DashboardCard
                  courses={courses.filter((c) => !c.enrolled && !c.completed)}
                  onCourseAction={handleCourseAction}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CourseComponent;
