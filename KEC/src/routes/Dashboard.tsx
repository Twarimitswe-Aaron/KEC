import React, { useContext, useEffect, useState } from 'react';
import DashboardStats from '../Components/Dashboard/DashboardStats';
import GrapshSection from '../Components/Dashboard/GrapshSection';
import AdditionalData from '../Components/Dashboard/AdditionalData';
import { UserRoleContext } from '../UserRoleContext';
import { DashboardState } from '../types/dashboard';

import { dashboardService } from '../services/dashboardService';
import HeaderCourseCard from '../headerCourseCard';
import CourseComponent from "../Components/Dashboard/CourseComponent"

interface DataPoint {
  month: string;
  sales: number;
  revenue: number;
}

const Dashboard = () => {
  const userRole = useContext(UserRoleContext);
  const [state, setState] = useState<DashboardState & { graphData: DataPoint[]; selectedCategory: string }>({
    selectedCourse: 'all',
    courses: [],
    stats: {
      revenue: 0,
      rating: 0,
      students: 0,
      courses: 0,
      ongoingCourses: 0,
      completedCourses: 0,
      certificates: 0,
      averageScore: 0
    },
    graphData: [],
    isLoading: true,
    error: null,
    selectedCategory: 'all',
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        const [courses, stats, graphData] = await Promise.all([
          dashboardService.getCourses(),
          dashboardService.getDashboardStats(),
          dashboardService.getGraphData()
        ]);

        setState(prev => ({
          ...prev,
          courses,
          stats,
          graphData,
          selectedCourse: 'all',
          isLoading: false
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'An error occurred',
          isLoading: false
        }));
      }
    };

    fetchDashboardData();
  }, []);

  const handleCourseChange = (courseId: string) => {
    setState(prev => ({ ...prev, selectedCourse: courseId }));
  };
  const handleCategoryChange = (category: string) => {
    setState(prev => ({ ...prev, selectedCategory: category }));
  };

  if (state.isLoading) {
    return <div className="flex  justify-center items-center h-screen">Loading...</div>;
  }

  if (state.error) {
    return <div className="text-red-500 text-center p-4">{state.error}</div>;
  }

  return (
    <div className="p-6">
      <DashboardStats />
      
      {(userRole === "admin" || userRole === "teacher") && (
        <>
          <GrapshSection />
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
        <CourseComponent selectedCourseId={state.selectedCourse} selectedCategory={state.selectedCategory} />
        </>
      )}
    </div>
  );
};

export default Dashboard; 