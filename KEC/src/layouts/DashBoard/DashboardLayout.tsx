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
      <div className="w-[100%]  overflow-x-hidden min-h-screen flex flex-row relative">
        {/* Left Sidebar for md+ */}
        <div className="hidden  md:block w-[10%] lg:!w-[20%] h-full top-0 -left-1 z-30">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Drawer */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            {/* Overlay */}
            <div className="fixed inset-0 " onClick={closeSidebar}></div>
            {/* Sidebar Drawer */}
            <div className="relative w-20 h-full bg-[#F5FAFF] shadow-lg z-50">
              <Sidebar onClose={closeSidebar} isMobileOpen />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 min-h-screen lg:!w-[60%] sm:!w-[87%]  justify-center mx-auto  p-3  top-0 sm:right-0 right-3 z-10 relative">
          <div className="sticky mx-auto w-full top-0  z-30 ">
            <DashboardHeader onHamburgerClick={toggleSidebar} />
          </div>
          <main className="flex-1 mt-4 justify-center w-full">
            <Outlet />
          </main>
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:block lg:!w-[20%] h-full z-20">
          <RightSidebar />
        </div>
      </div>
    </UserRoleContext.Provider>
  );
};

export default DashboardLayout;
