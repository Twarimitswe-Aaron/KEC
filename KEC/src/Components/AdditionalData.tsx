// components/WeeklySalesAndPopularCourses.tsx

import React, { useEffect, useState } from "react";
import axios from "axios";

interface CourseStat {
  id: string;
  name: string;
  image: string;
  sales: number;
  earnings: number;
}

const AdditionalData = () => {
  const [courses, setCourses] = useState<CourseStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/api/weekly-course-stats");
        if (Array.isArray(res.data) && res.data.length > 0) {
          setCourses(res.data);
        } else {
          setCourses([
            {
              id: "1",
              name: "Advanced Thermodynamics",
              image: "/images/course.png",
              sales: 10,
              earnings: 150.5,
            },
            {
              id: "2",
              name: "Fluid Mechanics",
              image: "/images/course.png",
              sales: 3,
              earnings: 285,
            },
            {
              id: "3",
              name: "Machine design",
              image: "/images/course.png",
              sales: 12,
              earnings: 190,
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching course stats", error);
        // fallback if backend not ready
        setCourses([
          {
            id: "1",
            name: "Advanced Thermodynamics",
            image: "/images/course.png",
            sales: 10,
            earnings: 150.5,
          },
          {
            id: "2",
            name: "Fluid Mechanics",
            image: "/images/course.png",
            sales: 3,
            earnings: 285,
          },
          {
            id: "3",
            name: "Machine design",
            image: "/images/course.png",
            sales: 12,
            earnings: 190,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      {/* Weekly Sales Statistics */}
      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Weekly Sales Statistics</h3>
        <div className="grid grid-cols-3 font-semibold text-sm text-gray-500 border-b pb-2 mb-2">
          <span>Course</span>
          <span>Sale</span>
          <span>Earnings</span>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          Array.isArray(courses) && courses.map((course) => (
            <div
              key={course.id}
              className="grid grid-cols-3 items-center mb-4"
            >
              <div className="flex items-center gap-2">
                <img
                  src={course.image}
                  alt={course.name}
                  className="w-8 h-8 rounded object-cover"
                />
                <span className="text-sm font-medium text-gray-800">
                  {course.name}
                </span>
              </div>
              <span className="text-center text-sm text-gray-700">
                {course.sales}
              </span>
              <span className="text-sm text-green-600 font-semibold">
                {course.earnings} frw
              </span>
            </div>
          ))
        )}
      </div>

      {/* Popular Courses */}
      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Popular courses</h3>
        {loading ? (
          <p>Loading...</p>
        ) : (
          Array.isArray(courses) && courses.map((course) => (
            <div
              key={course.id}
              className="flex items-center gap-3 mb-4"
            >
              <img
                src={course.image}
                alt={course.name}
                className="w-10 h-10 rounded object-cover"
              />
              <span className="text-sm font-medium text-gray-800">
                {course.name}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdditionalData;
