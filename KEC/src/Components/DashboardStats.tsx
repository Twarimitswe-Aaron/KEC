import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import {
  FaMoneyBillWave,
  FaStar,
  FaGraduationCap,
  FaBook,
} from "react-icons/fa";
import {
  PiNotebookDuotone,
  PiCertificateDuotone,
  PiStudentDuotone,
} from "react-icons/pi";
import { UserRoleContext } from "../UserRoleContext";

type Stats = {
  revenue: number;
  rating: number;
  students: number;
  courses: number;
  ongoingCourses: number;
  completedCourses: number;
  certificates: number;
};

const DashboardStats = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const userRole = useContext(UserRoleContext);
  const student_data={
    ongoingCourses:12,
    onCompletedCourse:12,
    certificates:12


  }

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

  useEffect(() => {
    const interval = setInterval(() => {
      instanceRef.current?.next();
    }, 5000);
    return () => clearInterval(interval);
  }, [instanceRef]);

  if (!stats) {
    return <p className="text-center py-10">Loading stats...</p>;
  }

  // General Stats (all roles)
  let statCards = [
    {
      label: "Total Revenue",
      value: `${stats.revenue} frw`,
      icon: <FaMoneyBillWave className="text-2xl text-orange-600" />,
      bg: "bg-orange-50",
    },
    {
      label: "Average Rating",
      value: `${stats.rating}/5`,
      icon: <FaStar className="text-2xl text-yellow-600" />,
      bg: "bg-yellow-50",
    },
    {
      label: "Total Student",
      value: `${stats.students} no`,
      icon: <FaGraduationCap className="text-2xl text-green-600" />,
      bg: "bg-green-50",
    },
    {
      label: "Total Course",
      value: `${stats.courses} no`,
      icon: <FaBook className="text-2xl text-amber-600" />,
      bg: "bg-amber-50",
    },
  ];

  // Remove revenue for teachers and students
  if (userRole === "teacher" || userRole === "student") {
    statCards = statCards.filter((card) => card.label !== "Total Revenue");
    if (userRole === "student") {
      statCards = [];
    }
  }


  return (
    <div className="z-1 w-full  overflow-x-auto hide-scrollbar">
      <div
        className="keen-slider items-center justify-center flex mx-auto max-w-screen-xl px-4"
        ref={sliderRef}
      >
        {/* Ongoing Course */}
        <div className="keen-slider__slide flex flex-col items-center p-4 justify-center  rounded-xl  bg-slate-100 !w-[180px]  flex-shrink-0">
          <div className="bg-slate-700 p-3 rounded-full mb-2">
            <PiNotebookDuotone className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm font-medium text-gray-500">Ongoing course</p>
          <p className="text-xl font-bold text-gray-800">
            {student_data.ongoingCourses}
          </p>
        </div>
        {/* Completed Courses */}
        <div className="keen-slider__slide flex flex-col items-center p-4 rounded-xl  bg-rose-100 !w-[180px] flex-shrink-0">
          <div className="bg-rose-500 p-3 rounded-full mb-2">
            <PiStudentDuotone className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm font-medium text-gray-500">Completed courses</p>
          <p className="text-xl font-bold text-gray-800">
            {student_data.onCompletedCourse}
          </p>
        </div>
        {/* Certificates */}
        <div className="keen-slider__slide flex flex-col items-center p-4 rounded-xl  bg-yellow-100 !w-[180px] flex-shrink-0">
          <div className="bg-yellow-500 p-3 rounded-full mb-2">
            <PiCertificateDuotone className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm font-medium text-gray-500">Certificates</p>
          <p className="text-xl font-bold text-gray-800">
            {student_data.certificates}
          </p>
        </div>
        <div className="keen-slider__slide flex flex-col items-center p-4 rounded-xl  bg-yellow-100 !w-[180px] flex-shrink-0">
          <div className="bg-yellow-500 p-3 rounded-full mb-2">
            <PiCertificateDuotone className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm font-medium text-gray-500">Certificates</p>
          <p className="text-xl font-bold text-gray-800">
            {student_data.certificates}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
