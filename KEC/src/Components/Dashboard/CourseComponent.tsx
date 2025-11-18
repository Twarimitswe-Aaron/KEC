import React, { useEffect, useMemo, useState } from "react";
import DashboardCard from './DashboardCard'
import type { Course } from './CourseCard'
import { useGetStudentCoursesQuery } from "../../state/api/courseApi";

const CourseComponent = () => {
  const { data: studentCourses = [], isLoading } = useGetStudentCoursesQuery();
  const [sortBy, setSortBy] = useState<string>("");
  const [timeRange, setTimeRange] = useState<string>('all');

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

    // Time range filter
    const withinMonths = (ds?: string, months?: number) => {
      if (!ds || !months) return false;
      const d = new Date(ds);
      if (isNaN(d.getTime())) return false;
      const now = new Date();
      const past = new Date(now);
      past.setMonth(now.getMonth() - months);
      return d >= past;
    };

    let filtered = mapped;
    if (timeRange === '12') filtered = mapped.filter(c => withinMonths(c.createdAt, 12));
    else if (timeRange === '6') filtered = mapped.filter(c => withinMonths(c.createdAt, 6));
    else if (timeRange === '3') filtered = mapped.filter(c => withinMonths(c.createdAt, 3));
    else if (timeRange === '1') filtered = mapped.filter(c => withinMonths(c.createdAt, 1));
    else if (timeRange === 'older') {
      const now = new Date();
      const cutoff = new Date(now);
      cutoff.setMonth(now.getMonth() - 12);
      filtered = mapped.filter(c => {
        const d = new Date(c.createdAt);
        return !isNaN(d.getTime()) && d < cutoff;
      });
    }

    // Sorting
    const getNum = (v: any) => {
      const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[^0-9.]/g, ''));
      return isNaN(n) ? 0 : n;
    };
    const getLessons = (v: any) => {
      const n = typeof v === 'number' ? v : parseInt(String(v), 10);
      return isNaN(n) ? 0 : n;
    };
    const getInstructorName = (c: Course) => (c.uploader?.name || c.uploader?.email || '').toString();

    const comparators: Record<string, (a: Course, b: Course) => number> = {
      'name-asc': (a, b) => a.title.localeCompare(b.title),
      'name-desc': (a, b) => b.title.localeCompare(a.title),
      'newest': (a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
      'oldest': (a: any, b: any) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime(),
      'price-asc': (a, b) => getNum(a.price) - getNum(b.price),
      'price-desc': (a, b) => getNum(b.price) - getNum(a.price),
      'lessons-desc': (a, b) => getLessons(b.no_lessons) - getLessons(a.no_lessons),
      'lessons-asc': (a, b) => getLessons(a.no_lessons) - getLessons(b.no_lessons),
      'instructor-asc': (a, b) => getInstructorName(a).localeCompare(getInstructorName(b)),
      'open-first': (a, b) => (a.open === b.open ? 0 : a.open ? -1 : 1),
      'enrolled-first': (a: any, b: any) => {
        const av = a.enrolled ? 1 : 0;
        const bv = b.enrolled ? 1 : 0;
        return av === bv ? 0 : bv - av; // enrolled first
      },
    };

    const cmp = comparators[sortBy] || comparators['newest'];
    const sorted = [...filtered].sort(cmp);
    return sorted;
  }, [studentCourses, sortBy, timeRange]);

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
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="name-asc">Name (A→Z)</option>
            <option value="name-desc">Name (Z→A)</option>
            <option value="price-asc">Price (Low→High)</option>
            <option value="price-desc">Price (High→Low)</option>
            <option value="lessons-desc">Lessons (Most→Least)</option>
            <option value="lessons-asc">Lessons (Least→Most)</option>
            <option value="instructor-asc">Instructor (A→Z)</option>
            <option value="open-first">Open First</option>
            <option value="enrolled-first">Enrolled First</option>
          </select>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="block w-32 h-10 rounded-md border border-gray-300 bg-white py-1 px-1 shadow-sm focus:outline-none focus:ring-1 sm:text-sm"
          >
            <option value="all">All time</option>
            <option value="12">Last 12 Months</option>
            <option value="6">Last 6 Months</option>
            <option value="3">Last 3 Months</option>
            <option value="1">Last 1 Month</option>
            <option value="older">Older than 1 year</option>
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
