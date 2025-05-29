import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { FaMoneyBillWave, FaStar, FaGraduationCap, FaBook } from "react-icons/fa";
import { UserRoleContext } from "../UserRoleContext";

type Stats = {
  revenue: number;
  rating: number;
  students: number;
  courses: number;
};

const DashboardStats = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const userRole = useContext(UserRoleContext);

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

  if (!stats) {
    return <p className="text-center py-10">Loading stats...</p>;
  }

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

  if (userRole === "teacher" || userRole === "student") {
    statCards = statCards.filter(card => card.label !== "Total Revenue");
  }

  return (
    <div className="grid lg:ml-66  md:grid-cols-2  grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className={`flex flex-col items-center p-4 rounded-xl shadow ${stat.bg}`}
        >
          <div className="mb-2">{stat.icon}</div>
          <p className="text-sm font-medium text-gray-500">{stat.label}</p>
          <p className="text-xl font-bold text-gray-800">{stat.value}</p>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
