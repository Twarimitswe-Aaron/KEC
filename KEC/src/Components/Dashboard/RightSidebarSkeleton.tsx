import React from "react";

const RightSidebarSkeleton = () => {
  return (
    <aside className="hidden md:block md:w-full top-0 sticky z-10 p-4 bg-white shadow-xl rounded-xl space-y-6 max-h-screen overflow-y-auto hover:overflow-y-scroll scroll-hide">
      {/* Profile Section Skeleton */}
      <div className="text-center flex justify-center items-center">
        <div className="h-5 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
        <div className="mx-auto items-center flex gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse mb-1"></div>
          <div className="block">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Rating Section Skeleton (for students) */}
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>

      {/* Top Student Location Skeleton (for non-students) */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
        <ul className="space-y-2">
          {[...Array(3)].map((_, index) => (
            <li key={index} className="rounded-md overflow-hidden">
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-2 rounded-md px-3 py-2 bg-gray-100 animate-pulse w-3/4">
                  <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-6 ml-auto animate-pulse"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-8 ml-2 animate-pulse"></div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Workshops Skeleton */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-36 mb-2 animate-pulse"></div>
        <ul className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <li
              key={i}
              className={`flex items-center gap-3 p-2 rounded-md ${
                i % 2 === 0 ? "bg-yellow-50" : "bg-white"
              } shadow-sm`}
            >
              <div className="w-10 h-10 rounded-md bg-gray-200 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default RightSidebarSkeleton;