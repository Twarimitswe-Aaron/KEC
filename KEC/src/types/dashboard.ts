export interface Course {
  id: string;
  name: string;
  description?: string;
  instructor?: string;
  progress?: number;
}

export interface DashboardStats {
  revenue: number;
  rating: number;
  students: number;
  courses: number;
  ongoingCourses: number;
  completedCourses: number;
  certificates: number;
  averageScore: number;
}

export interface DataPoint {
  month: string;
  sales: number;
  revenue: number;
}

export interface UserRole {
  role: 'admin' | 'teacher' | 'student';
  permissions: string[];
}

export interface DashboardState {
  selectedCourse: string;
  courses: Course[];
  stats: DashboardStats;
  graphData: DataPoint[];
  isLoading: boolean;
  error: string | null;
} 