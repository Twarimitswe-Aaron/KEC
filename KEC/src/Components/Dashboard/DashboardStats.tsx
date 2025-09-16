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

import { UserRoleContext } from "../../UserRoleContext";
import { DashboardStats as StatsType } from "../../types/dashboard";

const DashboardStats = () => {
  const [stats, setStats] = useState<StatsType | null>(null);
  const userRole = useContext(UserRoleContext);

  // Sample mock data for students
  const student_data = {
    ongoingCourses: 12,
    onCompletedCourse: 12,
    certificates: 12,
    averageScore: 85,
  };

  interface student_data{
    ongoingCourse:Number,
    onCompletedCourse:Number,
    certificates:Number,
    averageScore:Number,
  }

  //Fetch stats from backend on mount
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

  // Initialize KeenSlider
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

  // Auto-slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      instanceRef.current?.next();
    }, 5000);
    return () => clearInterval(interval);
  }, [instanceRef]);

  // Show skeleton loader while stats are loading
  if (!stats && userRole !== "student") {
    return (
      <div className="flex space-x-3 px-6 py-8 overflow-x-hidden">
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

  // Define cards shown to admin/teacher
  let statCards = [
    {
      label: "Profit",
      value: `${stats?.rating}/5`,
      icon: <FaStar className="text-2xl text-white" />,
      bg: "bg-yellow-50",
      iconBg: "bg-yellow-500",
    },
    {
      label: "Expenses",
      value: `${stats?.students} no`,
      icon: <FaGraduationCap className="text-2xl text-white" />,
      bg: "bg-green-50",
      iconBg: "bg-green-500",
    },
    {
      label: "Students",
      value: `${stats?.courses} no`, 
      icon: <PiStudentDuotone className="text-2xl text-white" />,
      bg: "bg-slate-100",
      iconBg: "bg-gray-700",
    },
    {
      label: "Teachers",
      value: `${stats?.averageScore}%`,
      icon: <FaChartLine className="text-2xl text-white" />,
      bg: "bg-blue-50",
      iconBg: "bg-blue-500",
    },
    {
      label: "Total Revenue",
      value: `${stats?.revenue} frw`,
      icon: <FaMoneyBillWave className="text-2xl text-white" />,
      bg: "bg-blue-50",
      iconBg: "bg-blue-500",
    },
    {
      label: "Course sales",
      value: `${stats?.revenue} frw`,
      icon: <FaMoneyBillWave className="text-2xl text-white" />,
      bg: "bg-blue-50",
      iconBg: "bg-blue-500",
    },
  ];

  // Hide revenue from teacher/student/admin
  if (userRole === "teacher") {
    statCards = statCards.filter((card) => card.label !== "Total Revenue");
    statCards = statCards.filter((card) => card.label !== "Average Score");
  } else if (userRole === "student") {
    statCards = []; // Student only uses mock `student_data`, not these cards
  } else if (userRole === "admin") {
    statCards = statCards.filter((card) => card.label !== "Average Score");
    statCards=statCards.filter((card)=>card.label !== "Course sales")
  }

  return (
    <div className="z-1 w-[full] overflow-x-hidden hide-scrollbar">
      {userRole === "admin" && (
        <div className="keen-slider max-w-screen-md" ref={sliderRef}>
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
