import React, { useContext, useEffect, useState } from "react";
import DashboardStats from "../Components/Dashboard/DashboardStats";
import GrapshSection from "../Components/Dashboard/GrapshSection";
import AdditionalData from "../Components/Dashboard/AdditionalData";
import { UserRoleContext } from "../UserRoleContext";
import { DashboardState } from "../types/dashboard";

import { dashboardService } from "../services/dashboardService";
import HeaderCourseCard from "../headerCourseCard";
import CourseComponent from "../Components/Dashboard/CourseComponent";

interface DataPoint {
  month: string;
  sales: number;
  revenue: number;
}

const Dashboard = () => {
  const userRole = useContext(UserRoleContext);
  const [state, setState] = useState<
    DashboardState & { graphData: DataPoint[]; selectedCategory: string }
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
    const fetchDashboardData = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const [courses, stats, graphData] = await Promise.all([
          dashboardService.getCourses(),
          dashboardService.getDashboardStats(),
          dashboardService.getGraphData(),
        ]);

        setState((prev) => ({
          ...prev,
          courses,
          stats,
          graphData,
          selectedCourse: "all",
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

    fetchDashboardData();
  }, []);

  const handleCourseChange = (courseId: string) => {
    setState((prev) => ({ ...prev, selectedCourse: courseId }));
  };
  const handleCategoryChange = (category: string) => {
    setState((prev) => ({ ...prev, selectedCategory: category }));
  };

  if (state.isLoading) {
    return (
      <div className="flex  justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (state.error) {
    return <div className="text-red-500 text-center p-4">{state.error}</div>;
  }

  return (
    <div className="p-6">
      <DashboardStats stats={state.stats} />

      {(userRole === "admin" || userRole === "teacher") && (
        <>
          <div className="mb-6 flex flex-wrap gap-4 justify-between items-center">
            <a
              href="/service-requests"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#034153] text-white font-semibold rounded-lg hover:bg-[#022F40] transition shadow-md"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
              View Service Requests
            </a>

            <a
              href="/workshop-management"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#034153] text-white font-semibold rounded-lg hover:bg-[#022F40] transition shadow-md"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Manage Workshops
            </a>
          </div>
          <GrapshSection data={state.graphData} />
          <AdditionalData />
        </>
      )}

      {userRole === "student" && (
        <>
          <HeaderCourseCard
            courses={state.courses}
            selectedCourse={state.selectedCourse}
            onCourseChange={handleCourseChange}
            selectedCategory={state.selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
          <CourseComponent
            selectedCourseId={state.selectedCourse}
            selectedCategory={state.selectedCategory}
          />
        </>
      )}
    </div>
  );
};

export default Dashboard;
