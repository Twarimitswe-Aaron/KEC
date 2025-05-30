import React from "react";
import DashboardCard from './DashboardCard'

const CourseComponent = () => {
  return (
    <div className="block mt-5">
      <div className="flex   justify-between">
        <h1 className="font-semiBold text-2xl">Different Courses</h1>
      <div className="flex gap-3 justify-center">
      <select className="block w-22 rounded-md border border-gray-300 bg-white py-1 px-1 shadow-sm  focus:outline-none focus:ring-1  sm:text-sm">
        <option value="">Sort By</option>
        <option value="">Name</option>
        <option value="">Time</option>
        <option value="">Duration</option>
        <option value="">Size</option>
      </select>
      <select className="block w-32 rounded-md border border-gray-300 bg-white py-1 px-1 shadow-sm  focus:outline-none focus:ring-1  sm:text-sm">
        <option value="">Last 12 Months</option>
        <option value="">Last 6 Months</option>
        <option value="">Last 3 Months</option>
        <option value="">Last 1 Months</option>
        <option value="">1 year +</option>
      </select>
      </div>
      </div>

      <div className="flex lg:flex-cols-4 md:flex-cols-3 sm:flex-cols-2 flex-cols-1">
       <DashboardCard />
      </div>
    </div>
  );
};

export default CourseComponent;
