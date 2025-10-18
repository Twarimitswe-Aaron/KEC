import React from "react";

const RightSidebarSkeleton = () => {
  return (
    <aside
      className="hidden md:block md:w-full top-0 sticky z-10 p-4 bg-white shadow-xl rounded-xl space-y-6
      max-h-screen overflow-y-auto scroll-hide"
    >
      {/* Profile skeleton */}
      <div className="flex justify-center items-center gap-4 animate-pulse">
        <div className="w-16 h-16 bg-gray-300 rounded-full" />
        <div className="space-y-2">
          <div className="w-20 h-4 bg-gray-300 rounded" />
          <div className="w-12 h-3 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Rating / locations placeholder */}
      <div className="space-y-3 animate-pulse">
        <div className="w-32 h-4 bg-gray-300 rounded" />
        <div className="w-full h-6 bg-gray-200 rounded" />
        <div className="w-5/6 h-6 bg-gray-200 rounded" />
        <div className="w-2/3 h-6 bg-gray-200 rounded" />
      </div>

      {/* Workshops skeleton */}
      <div className="space-y-2 animate-pulse">
        <div className="w-40 h-4 bg-gray-300 rounded mb-2" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-300 rounded-md" />
            <div className="w-24 h-3 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </aside>
  );
};

export default RightSidebarSkeleton;
