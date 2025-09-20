import React from "react";

// Base skeleton pulse component
const SkeletonPulse = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

// Header skeleton that matches your DashboardHeader structure
const HeaderSkeleton = () => (
  <div className="sticky z-50 top-0 mx-3 bg-white border-b border-gray-100 py-4">
    <div className="flex items-center justify-between">
      {/* Left side - Hamburger and Title */}
      <div className="flex items-center gap-4">
        <SkeletonPulse className="w-6 h-6 md:hidden" />
        <SkeletonPulse className="w-32 h-6" />
      </div>
      
      {/* Center - Search bar */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <SkeletonPulse className="w-full h-10 rounded-lg" />
      </div>
      
      {/* Right side - Notifications and Profile */}
      <div className="flex items-center gap-3">
        <SkeletonPulse className="w-8 h-8 rounded-full" />
        <SkeletonPulse className="w-8 h-8 rounded-full" />
        <SkeletonPulse className="w-8 h-8 rounded-full" />
      </div>
    </div>
  </div>
);

// Sidebar skeleton that matches your layout
const SidebarSkeleton = () => (
  <div className="h-full bg-[#F5FAFF] p-4">
    {/* Logo area */}
    <div className="mb-8">
      <SkeletonPulse className="w-12 h-12 lg:w-32 lg:h-8 rounded" />
    </div>
    
    {/* Navigation items */}
    <div className="space-y-3">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <SkeletonPulse className="w-6 h-6 rounded" />
          <SkeletonPulse className="hidden lg:block w-24 h-4 rounded" />
        </div>
      ))}
    </div>
    
    {/* Bottom section */}
    <div className="absolute bottom-4 left-4 right-4">
      <div className="flex items-center gap-3">
        <SkeletonPulse className="w-8 h-8 rounded-full" />
        <div className="hidden lg:block space-y-1">
          <SkeletonPulse className="w-20 h-3 rounded" />
          <SkeletonPulse className="w-16 h-3 rounded" />
        </div>
      </div>
    </div>
  </div>
);

// Right sidebar skeleton
const RightSidebarSkeleton = () => (
  <div className="h-full bg-white p-4 border-l border-gray-100">
    {/* Profile section */}
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-4">
        <SkeletonPulse className="w-12 h-12 rounded-full" />
        <div className="space-y-1">
          <SkeletonPulse className="w-24 h-4 rounded" />
          <SkeletonPulse className="w-20 h-3 rounded" />
        </div>
      </div>
    </div>
    
    {/* Stats or widgets */}
    <div className="space-y-4">
      <div className="p-4 bg-gray-50 rounded-lg">
        <SkeletonPulse className="w-20 h-4 mb-2 rounded" />
        <SkeletonPulse className="w-16 h-6 rounded" />
      </div>
      
      <div className="p-4 bg-gray-50 rounded-lg">
        <SkeletonPulse className="w-24 h-4 mb-2 rounded" />
        <SkeletonPulse className="w-20 h-6 rounded" />
      </div>
      
      <div className="p-4 bg-gray-50 rounded-lg">
        <SkeletonPulse className="w-28 h-4 mb-2 rounded" />
        <SkeletonPulse className="w-24 h-6 rounded" />
      </div>
    </div>
    
    {/* Recent activity */}
    <div className="mt-6">
      <SkeletonPulse className="w-32 h-5 mb-4 rounded" />
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <SkeletonPulse className="w-8 h-8 rounded-full flex-shrink-0" />
            <div className="space-y-1 flex-1">
              <SkeletonPulse className="w-full h-3 rounded" />
              <SkeletonPulse className="w-3/4 h-3 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Main content area skeleton
const MainContentSkeleton = () => (
  <main className="p-4">
    <div className="space-y-6">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <SkeletonPulse className="w-48 h-8 rounded" />
        <SkeletonPulse className="w-32 h-10 rounded-lg" />
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <SkeletonPulse className="w-6 h-6 rounded" />
              <SkeletonPulse className="w-4 h-4 rounded" />
            </div>
            <SkeletonPulse className="w-20 h-8 mb-2 rounded" />
            <SkeletonPulse className="w-24 h-4 rounded" />
          </div>
        ))}
      </div>
      
      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart/Table area */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <SkeletonPulse className="w-40 h-6 mb-4 rounded" />
            <div className="space-y-4">
              <SkeletonPulse className="w-full h-64 rounded" />
              <div className="flex justify-between">
                <SkeletonPulse className="w-24 h-4 rounded" />
                <SkeletonPulse className="w-20 h-4 rounded" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Side content */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <SkeletonPulse className="w-32 h-6 mb-4 rounded" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <SkeletonPulse className="w-8 h-8 rounded-full" />
                    <SkeletonPulse className="w-24 h-4 rounded" />
                  </div>
                  <SkeletonPulse className="w-12 h-4 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
);

// Complete dashboard skeleton
const DashboardSkeleton = () => (
  <div className="w-full min-h-screen flex">
    {/* Left Sidebar for md+ */}
    <aside className="hidden md:block z-100 w-[10%] lg:w-[20%] h-screen sticky left-0 top-0">
      <SidebarSkeleton />
    </aside>

    {/* Main Content Area */}
    <div className="flex-1 w-full px-2 min-h-screen">
      <HeaderSkeleton />
      <MainContentSkeleton />
    </div>

    {/* Right Sidebar */}
    <aside className="hidden lg:block w-[20%] h-screen sticky right-0 top-0">
      <RightSidebarSkeleton />
    </aside>
  </div>
);

// Loading state for redirect
const LoadingRedirect = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-gray-600">Redirecting to login...</p>
    </div>
  </div>
);


export { 
  DashboardSkeleton, 
  LoadingRedirect, 
  SkeletonPulse, 
  HeaderSkeleton, 
  SidebarSkeleton, 
  RightSidebarSkeleton, 
  MainContentSkeleton 
};