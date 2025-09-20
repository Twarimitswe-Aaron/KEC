import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../Components/Dashboard/Sidebar";
import DashboardHeader from "../../Components/Dashboard/DashboardHeader";
import RightSidebar from "../../Components/Dashboard/RightSidebar";
import { UserRoleContext } from "../../UserRoleContext";
import {SearchContext} from "../../SearchContext";
import { useGetUserQuery, useLogoutMutation } from "../../state/api/authApi";

const DashboardLayout = () => {
  const [logout, setLogout]=useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen((open) => !open);
  const closeSidebar = () => setSidebarOpen(false);
  const [searchQuery, setSearchQuery]=useState("");
  const {data, isLoading} = useGetUserQuery ();
  const [logoutUser] = useLogoutMutation();
  
  if (isLoading) return <div>Loading...</div>;
  if (!data) {
    if (!logout) {
      logoutUser()
      window.location.href = '/login';
    }
    return <div>Redirecting to login...</div>;
  }
  const {firstName,lastName,role,email} = data || {};


  return (
    <UserRoleContext.Provider value={role}>
      <SearchContext.Provider value={{searchQuery,setSearchQuery}}>
      <div className="w-full  min-h-screen flex">
        {/* Left Sidebar for md+ */}
        <aside className="hidden md:block  z-100 w-[10%] lg:w-[20%] h-screen sticky left-0 top-0">
          <Sidebar />
        </aside>

        {/* Mobile Sidebar Drawer */}
        {isSidebarOpen && (
          <div className="fixed  inset-0 z-100 flex md:hidden">
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
        <div className="flex-1 w-full px-2  min-h-screen">
          <div className="sticky z-50 top-0 mx-3  bg-white">
            <DashboardHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} onHamburgerClick={toggleSidebar} />
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
      </SearchContext.Provider>
    </UserRoleContext.Provider>
  );
};

export default DashboardLayout;
