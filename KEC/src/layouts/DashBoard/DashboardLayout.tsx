import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../Components/Dashboard/Sidebar";
import DashboardHeader from "../../Components/Dashboard/DashboardHeader";
import RightSidebar from "../../Components/Dashboard/RightSidebar";
import { UserRoleContext } from "../../UserRoleContext";

const DashboardLayout = () => {
  const [logout, setLogout]=useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen((open) => !open);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <UserRoleContext.Provider value="admin">
      <div className="w-full  min-h-screen flex">
        {/* Left Sidebar for md+ */}
        <aside className="hidden md:block z-100 w-[10%] md:w-[20%] h-screen sticky left-0 top-0">
          <Sidebar />
        </aside>

        {/* Mobile Sidebar Drawer */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-100 flex md:hidden">
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black/30"
              onClick={closeSidebar}
            ></div>
            {/* Sidebar Drawer */}
            <div className="relative w-20 h-full bg-[#F5FAFF] shadow-lg z-50">
              <Sidebar onClose={closeSidebar} isMobileOpen />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 w-full md:w-[90%]  lg:w-[60%] min-h-screen">
          <div className="sticky z-50 top-0 mx-3 bg-white">
            <DashboardHeader onHamburgerClick={toggleSidebar} />
          </div>
          <main className="p-4">
            <Outlet />
          </main>
        </div>

        {/* Right Sidebar */}
        <aside className="hidden lg:block w-[20%] h-screen sticky right-0 top-0">
          <RightSidebar />
        </aside>
      </div>
    </UserRoleContext.Provider>
  );
};

export default DashboardLayout;
