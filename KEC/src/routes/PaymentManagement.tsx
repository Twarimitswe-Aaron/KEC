import React, { useContext, useEffect, useState } from 'react';
import DashboardStats from '../Components/Dashboard/DashboardStats';

import { UserRoleContext } from '../UserRoleContext';
import { DashboardState, Course } from '../types/dashboard';
import { dashboardService } from '../services/dashboardService';

import PaymentGraph from '../Components/Payment/PaymentGraph';
import AdditionalData from '../Components/Payment/Addition';

interface DataPoint {
  month: string;
  sales: number;
  revenue: number;
}

const PaymentManagement = () => {
  const userRole = useContext(UserRoleContext);
  const [state, setState] = useState<DashboardState & { graphData: DataPoint[] }>({
    selectedCourse: '',
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
    error: null
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
          selectedCourse: courses[0]?.id || '',
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

  if (state.isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (state.error) {
    return <div className="text-red-500 text-center p-4">{state.error}</div>;
  }

  return (
    <div className="p-6">
      
      {(userRole === "admin") && (
          <>
          <DashboardStats />
          <PaymentGraph />
          <AdditionalData />
        </>
      )}
      

    
    </div>
  );
};

export default PaymentManagement; 