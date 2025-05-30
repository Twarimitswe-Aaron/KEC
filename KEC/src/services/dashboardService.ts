import { Course, DashboardStats } from '../types/dashboard';
import { mockCourses, mockStats, mockGraphData } from './mockData';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface DataPoint {
  month: string;
  sales: number;
  revenue: number;
}

export const dashboardService = {
  async getCourses(): Promise<Course[]> {
    // Simulate API delay
    await delay(1000);
    return mockCourses;
  },

  async getDashboardStats(): Promise<DashboardStats> {
    // Simulate API delay
    await delay(800);
    return mockStats;
  },

  async getGraphData(): Promise<DataPoint[]> {
    // Simulate API delay
    await delay(1200);
    return mockGraphData;
  },

  async updateCourseProgress(courseId: string, progress: number): Promise<void> {
    // Simulate API delay
    await delay(500);
    // Find and update the course in mock data
    const courseIndex = mockCourses.findIndex(course => course.id === courseId);
    if (courseIndex !== -1) {
      mockCourses[courseIndex].progress = progress;
    }
  }
}; 