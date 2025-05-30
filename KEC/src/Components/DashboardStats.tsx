import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

// Icons
import {
  FaMoneyBillWave,
  FaStar,
  FaGraduationCap,
  FaBook,
  FaChartLine,
} from "react-icons/fa";

import {
  PiNotebookDuotone,
  PiCertificateDuotone,
  PiStudentDuotone,
  PiBookOpenDuotone,
  PiChartLineDuotone,
} from "react-icons/pi";

import { UserRoleContext } from "../UserRoleContext";

// Define the shape of the API response
type Stats = {
  revenue: number;
  rating: number;
  students: number;
  courses: number;
  ongoingCourses: number;
  completedCourses: number;
  certificates: number;
  averageScore: number;
};

const DashboardStats = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const userRole = useContext(UserRoleContext);

  // Sample mock data for students
  const student_data = {
    ongoingCourses: 12,
    onCompletedCourse: 12,
    certificates: 12,
    averageScore: 85,
  };

  // ✅ Fetch stats from backend on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("/api/dashboard-stats");
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      }
    };

    fetchStats();
  }, []);

  // ✅ Initialize KeenSlider
  const [sliderRef, instanceRef] = useKeenSlider({
    loop: true,
    mode: "snap",
    renderMode: "performance",
    slides: {
      origin: "auto",
      spacing: 15,
      perView: "auto",
    },
  });

  // ✅ Auto-slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      instanceRef.current?.next();
    }, 5000);
    return () => clearInterval(interval);
  }, [instanceRef]);

  // ✅ Show skeleton loader while stats are loading
  if (!stats && userRole !== "student") {
    return (
      <div className="flex space-x-3 px-6 py-8 overflow-x-auto">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl bg-gray-100 p-4 w-[180px] flex-shrink-0 flex flex-col items-center"
          >
            <div className="h-10 w-10 bg-gray-300 rounded-full mb-2" />
            <div className="h-4 w-20 bg-gray-300 rounded mb-1" />
            <div className="h-5 w-24 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  // ✅ Define cards shown to admin/teacher
  let statCards = [
    {
      label: "Total Revenue",
      value: `${stats?.revenue} frw`,
      icon: <FaMoneyBillWave className="text-2xl text-orange-600" />,
      bg: "bg-orange-50",
      iconBg: "bg-white",
    },
    {
      label: "Average Rating",
      value: `${stats?.rating}/5`,
      icon: <FaStar className="text-2xl text-white" />,
      bg: "bg-yellow-50",
      iconBg: "bg-yellow-500",
    },
    {
      label: "Total Student",
      value: `${stats?.students} no`,
      icon: <FaGraduationCap className="text-2xl text-white" />,
      bg: "bg-green-50",
      iconBg: "bg-green-500",
    },
    {
      label: "Total Courses",
      value: `${stats?.courses} no`, // ✅ Fixed: previously used students instead of courses
      icon: <PiStudentDuotone className="text-2xl text-white" />,
      bg: "bg-red-50",
      iconBg: "bg-red-500",
    },
    {
      label: "Average Score",
      value: `${stats?.averageScore}%`,
      icon: <FaChartLine className="text-2xl text-white" />,
      bg: "bg-blue-50",
      iconBg: "bg-blue-500",
    },
  ];

  // ✅ Hide revenue from teacher/student
  if (userRole === "teacher") {
    statCards = statCards.filter((card) => card.label !== "Total Revenue");
  } else if (userRole === "student") {
    statCards = []; // Student only uses mock `student_data`, not these cards
  }

  return (
    <div className="z-1 w-full overflow-x-auto hide-scrollbar">
      
      {userRole === "student" ? (
       
        <div
          className="keen-slider items-center justify-center flex mx-auto max-w-screen-xl"
          ref={sliderRef}
        >
          {/* Ongoing Courses */}
          <div className="keen-slider__slide flex flex-col items-center p-4 justify-center rounded-xl bg-slate-100 !w-[180px] flex-shrink-0">
            <div className="bg-slate-700 p-3 rounded-full mb-2">
              <PiNotebookDuotone className="h-6 w-6 text-white" />
            </div>
            <p className="text-sm font-medium text-gray-500">Ongoing Courses</p>
            <p className="text-xl font-bold text-gray-800">
              {student_data.ongoingCourses}
            </p>
          </div>

          {/* Completed Courses */}
          <div className="keen-slider__slide flex flex-col items-center p-4 rounded-xl bg-blue-100 !w-[180px] flex-shrink-0">
            <div className="bg-blue-500 p-3 rounded-full mb-2">
              <PiBookOpenDuotone className="h-6 w-6 text-white" />
            </div>
            <p className="text-sm font-medium text-gray-500">Completed Courses</p>
            <p className="text-xl font-bold text-gray-800">
              {student_data.onCompletedCourse}
            </p>
          </div>

          {/* Certificates */}
          <div className="keen-slider__slide flex flex-col items-center p-4 rounded-xl bg-yellow-100 !w-[180px] flex-shrink-0">
            <div className="bg-yellow-500 p-3 rounded-full mb-2">
              <PiCertificateDuotone className="h-6 w-6 text-white" />
            </div>
            <p className="text-sm font-medium text-gray-500">Certificates</p>
            <p className="text-xl font-bold text-gray-800">
              {student_data.certificates}
            </p>
          </div>

          {/* Average Score */}
          <div className="keen-slider__slide flex flex-col items-center p-4 rounded-xl bg-green-100 !w-[180px] flex-shrink-0">
            <div className="bg-green-500 p-3 rounded-full mb-2">
              <PiChartLineDuotone className="h-6 w-6 text-white" />
            </div>
            <p className="text-sm font-medium text-gray-500">Average Score</p>
            <p className="text-xl font-bold text-gray-800">
              {student_data.averageScore}%
            </p>
          </div>
        </div>
      ) : (
       
        <div
          className="keen-slider max-w-screen-xl"
          ref={sliderRef}
        >
          {statCards.map((card, index) => (
            <div
              key={index}
              className={`keen-slider__slide flex flex-col items-center p-4 justify-center rounded-xl !w-[180px] flex-shrink-0 ${card.bg}`}
            >
              <div className={`p-3 rounded-full mb-2 shadow-inner ${card.iconBg}`}>
                {card.icon}
              </div>
              <p className="text-sm font-medium text-gray-500">{card.label}</p>
              <p className="text-xl font-bold text-gray-800">{card.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardStats;
