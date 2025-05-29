import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../Components/Sidebar.tsx";
import DashboardHeader from "../../Components/DashboardHeader.tsx";
import RightSidebar from "../../Components/RightSidebar";
import { UserRoleContext } from "../../UserRoleContext";

const DashboardLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen((open) => !open);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <UserRoleContext.Provider value="admin">
      {/* Fixed Left Sidebar for md+ */}
      <div className="hidden md:block md:fixed md:top-0 md:left-0 md:h-full w-64 z-20">
        <Sidebar />
      </div>
      {/* Mobile Sidebar Drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* Overlay */}
          <div className="fixed inset-0 filter-blur bg-opacity-40" onClick={closeSidebar}></div>
          {/* Sidebar Drawer */}
          <div className="relative w-20 h-full bg-[#F5FAFF] shadow-lg z-50">
            <Sidebar onClose={closeSidebar} isMobileOpen />
          </div>
        </div>
      )}
      {/* Fixed Right Sidebar */}
      <div className="hidden lg:block fixed top-0 right-0 h-full w-[280px] z-20">
        <RightSidebar />
      </div>
      {/* Main Content */}
      <div className="min-h-screen flex flex-col w-full md:ml-64 md:mr-[120px] lg:mr-[280px] transition-all duration-300">
        <div className="sticky top-0 z-30  ">
          <DashboardHeader onHamburgerClick={toggleSidebar} />
        </div>
        <main className="p-4 flex-1 lg:-ml-40 min-w-0">
          <Outlet />
        </main>
      </div>
    </UserRoleContext.Provider>
  );
};

export default DashboardLayout;
