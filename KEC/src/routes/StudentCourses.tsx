import React, { useEffect, useState } from "react";
import HeaderCourseCard from "../headerCourseCard";
import CourseQuizAccordion from "../Components/Dashboard/CourseQuizAccordion";
import { dashboardService } from "../services/dashboardService";
import { DashboardState } from "../types/dashboard";
import StudentCourseDetail from "../Components/Dashboard/StudentCourseDetail";

const StudentCourses = () => {
  const [state, setState] = useState<
    DashboardState & { selectedCategory: string }
  >({
    selectedCourse: "all",
    courses: [],
    stats: {
      revenue: 0,
      rating: 0,
      students: 0,
      courses: 0,
      ongoingCourses: 0,
      completedCourses: 0,
      certificates: 0,
      averageScore: 0,
    },
    graphData: [],
    isLoading: true,
    error: null,
    selectedCategory: "all",
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        const courses = await dashboardService.getCourses();
        setState((prev) => ({
          ...prev,
          courses,
          isLoading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "An error occurred",
          isLoading: false,
        }));
      }
    };

    fetchCourses();
  }, []);

  const handleCourseChange = (courseId: string) => {
    setState((prev) => ({ ...prev, selectedCourse: courseId }));
  };

  const handleCategoryChange = (category: string) => {
    setState((prev) => ({ ...prev, selectedCategory: category }));
  };

  if (state.isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (state.error) {
    return <div className="text-red-500 text-center p-4">{state.error}</div>;
  }

  // ... imports

  return (
    <div className="p-6">
      <HeaderCourseCard
        courses={state.courses}
        selectedCourse={state.selectedCourse}
        onCourseChange={handleCourseChange}
        selectedCategory={state.selectedCategory}
        onCategoryChange={handleCategoryChange}
      />

      {state.selectedCourse !== "all" ? (
        <StudentCourseDetail courseId={state.selectedCourse} />
      ) : (
        <CourseQuizAccordion />
      )}
    </div>
  );
};

export default StudentCourses;
