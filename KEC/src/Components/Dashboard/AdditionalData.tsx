import React from "react";
import Skeleton from "./Skeleton";
import { useGetWeeklyCourseStatsQuery } from "../../state/api/analyticsApi";

const AdditionalData = () => {
  const { data: courses = [], isLoading } = useGetWeeklyCourseStatsQuery();

  return (
    <div className="sm:flex block  sm:flex-cols-1 md:flex-cols-2 sm:w-full gap-2 mt-18">
      {/* Weekly Sales Statistics */}
      <div className="bg-white rounded-xl  sm:w-[60%] shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Weekly Sales Statistics</h3>
        <div className="flex flex-cols-3 justify-between font-semibold text-sm text-gray-500 border-b pb-2 mb-2">
          <span>Course</span>
          <div className="flex justify-between w-[26%]">
            <span>Sale</span>
            <span>Earnings</span>
          </div>
        </div>
        {isLoading ? (
          <>
            {/* Skeleton for Weekly Sales Statistics */}
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Skeleton width="w-8" height="h-8" rounded="rounded" />
                  <Skeleton width="w-24" />
                </div>
                <div className="flex justify-between w-[26%]">
                  <Skeleton width="w-8" />
                  <Skeleton width="w-16" />
                </div>
              </div>
            ))}
          </>
        ) : (
          Array.isArray(courses) &&
          courses.map((course) => (
            <div
              key={course.id}
              className="flex flex-cols-3 items-center justify-between mb-4"
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
              <div className="flex justify-between w-[26%]">
                <span className="text-center text-sm text-gray-700">
                  {course.sales}
                </span>
                <span className="text-sm text-green-600 font-semibold">
                  {course.earnings} frw
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Popular Courses */}
      <div className="bg-white rounded-xl mt-6 sm:mt-0 sm:w-[40%] shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Popular courses</h3>
        {isLoading ? (
          <>
            {/* Skeleton for Popular Courses */}
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 mb-4">
                <Skeleton width="w-10" height="h-10" rounded="rounded" />
                <Skeleton width="w-32" />
              </div>
            ))}
          </>
        ) : (
          Array.isArray(courses) &&
          courses.map((course) => (
            <div key={course.id} className="flex items-center gap-3 mb-4">
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
