import { Course, DashboardStats } from "../types/dashboard";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

interface DataPoint {
  month: string;
  sales: number;
  revenue: number;
}

export const dashboardService = {
  async getCourses(): Promise<Course[]> {
    const response = await fetch(`${BASE_URL}/dashboard/courses`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch courses");
    return response.json();
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const response = await fetch(`${BASE_URL}/dashboard/stats`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch stats");
    return response.json();
  },

  async getGraphData(): Promise<DataPoint[]> {
    const response = await fetch(`${BASE_URL}/dashboard/graph`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch graph data");
    return response.json();
  },

  async updateCourseProgress(
    courseId: string,
    progress: number
  ): Promise<void> {
    // Placeholder for future implementation
    console.warn("updateCourseProgress not implemented on backend yet");
  },
};
