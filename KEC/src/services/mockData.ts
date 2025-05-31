import { Course, DashboardStats } from '../types/dashboard';

// Mock courses data
export const mockCourses: Course[] = [

  {
    id: '1',
    name: 'All',
    description: 'Explore All courses',
    instructor: 'John Doe',
    progress: 100
  },
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
  },
  {
    id: '4',
    name: 'Fluid Mechanics',
    description: 'Know how to deal with fluids materials in the conductor',
    instructor: 'Sarah Wilson',
    progress: 60
  },
  {
    id: '5',
    name: 'Machine design',
    description: 'Design your own machine using this course',
    instructor: 'David Brown',
    progress: 25
  }
];

// Mock dashboard stats
export const mockStats: DashboardStats = {
  revenue: 120000,
  rating: 4.7,
  students: 320,
  courses: 12,
  ongoingCourses: 4,
  completedCourses: 5,
  certificates: 8,
  averageScore: 88
};

// Mock graph data with sales and revenue
export const mockGraphData = [
  { month: "Jan", sales: 50, revenue: 400 },
  { month: "Feb", sales: 45, revenue: 350 },
  { month: "Mar", sales: 60, revenue: 500 },
  { month: "Apr", sales: 80, revenue: 650 },
  { month: "May", sales: 60, revenue: 600 },
  { month: "Jun", sales: 40, revenue: 300 },
  { month: "Jul", sales: 50, revenue: 400 },
  { month: "Aug", sales: 75, revenue: 700 },
  { month: "Sep", sales: 65, revenue: 620 },
  { month: "Oct", sales: 70, revenue: 690 },
  { month: "Nov", sales: 55, revenue: 450 },
]; 