import { Course, DashboardStats } from '../types/dashboard';
export interface Coursedata {
  id?: number;
  image_url: string;
  title: string;
  open:boolean;
  enrolled:boolean;
  description: string;
  price: string;
  no_lessons: string;
  no_hours: string;
  uploader: {
    name: string;
    avatar_url: string;
  };
}

// Mock courses data

export const Lessons =[
  {
    id: 1,
    title: "Introduction to Course",
    description: "Welcome and course overview",
    isUnlocked: true,
    order: 1,
    createdAt: "2025-01-10",
    resources: [
      { id: 1, name: "Course_Introduction.pdf", type: "pdf", size: "2.1 MB", uploadedAt: "2025-01-10" },
      { id: 2, name: "Welcome_Video.mp4", type: "video", duration: "12:45", uploadedAt: "2025-01-10" }
    ],
    uploader: {
      name: "Aart",
      avatar_url: "string"
    }
  },
  {
    id: 2,
    title: "Getting Started",
    description: "Basic setup and fundamentals",
    isUnlocked: true,
    order: 2,
    createdAt: "2025-01-12",
    resources: [
      { id: 3, name: "Setup_Guide.pdf", type: "pdf", size: "1.8 MB", uploadedAt: "2025-01-12" },
      { id: 4, name: "Setup_Tutorial.mp4", type: "video", duration: "18:30", uploadedAt: "2025-01-12" }
    ],
    uploader: {
      name: "Aart",
      avatar_url: "string"
    }
  },
  {
    id: 3,
    title: "Advanced Topics",
    description: "Deep dive into complex concepts",
    isUnlocked: false,
    order: 3,
    createdAt: "2025-01-15",
    resources: [
      { id: 5, name: "Advanced_Concepts.pdf", type: "pdf", size: "4.2 MB", uploadedAt: "2025-01-15" }
    ],
    uploader: {
      name: "Aart",
      avatar_url: "string"
    }
  }
]
export const mockCourses: Course[] = [

  {
    id: '0',
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

export const data: Coursedata[] = [
  {
    id:1,
    image_url: "/images/courseCard.png",
    title: "Thermodynamics",
    description: "Explore energy transfer, heat, and the laws of thermodynamics in detail through real-world applications.",
    price: "100,000frw",
    enrolled:false,
    open:true,
    no_lessons: "10",
    no_hours: "22hrs32min",
    uploader: {
      name: "Irakoze Rachel",
      avatar_url: "/images/avatars/rachel.png",
    },
  },
  {
    id:2,
    image_url: "/images/courseCard.png",
    title: "Thermodynamics",
    open:true,
    description: "Explore energy transfer, heat, and the laws of thermodynamics in detail through real-world applications.",
    price: "100,000frw",
    no_lessons: "10",
    enrolled:true,
    no_hours: "22hrs32min",
    uploader: {
      name: "Irakoze Rachel",
      avatar_url: "/images/avatars/rachel.png",
    },
  },
  {
    id:3,
    image_url: "/images/courseCard.png",
    title: "Thermodynamics",
    description: "Explore energy transfer, heat, and the laws of thermodynamics in detail through real-world applications.",
    price: "100,000frw",
    open:false,
    no_lessons: "10",
    enrolled:false,
    no_hours: "22hrs32min",
    uploader: {
      name: "Irakoze Rachel",
      avatar_url: "/images/avatars/rachel.png",
    },
  },
  {
    id:4,
    image_url: "/images/courseCard.png",
    title: "Thermodynamics",
    description: "Explore energy transfer, heat, and the laws of thermodynamics in detail through real-world applications.",
    price: "100,000frw",
    open:false,
    enrolled:false,
    no_lessons: "10",
    no_hours: "22hrs32min",
    uploader: {
      name: "Irakoze Rachel",
      avatar_url: "/images/avatars/rachel.png",
    },
  },
  {
    id:5,
    image_url: "/images/courseCard.png",
    title: "Thermodynamics",
    description: "Explore energy transfer, heat, and the laws of thermodynamics in detail through real-world applications.",
    price: "100,000frw",
    no_lessons: "10",
    no_hours: "22hrs32min",
    open:false,
    enrolled:false,
    uploader: {
      name: "Irakoze Rachel",
      avatar_url: "/images/avatars/rachel.png",
    },
  },
  {
    id:6,
    image_url: "/images/courseCard.png",
    title: "Fluid Mechanics",
    description: "Covers fluid statics and dynamics, pressure distributions, and practical system design with flow analysis.",
    price: "90,000frw",
    no_lessons: "12",
    no_hours: "18hrs40min",
    enrolled:true,
    open:false,
    uploader: {
      name: "Ndayambaje Yves",
      avatar_url: "/images/avatars/yves.png",
    },
  }
];