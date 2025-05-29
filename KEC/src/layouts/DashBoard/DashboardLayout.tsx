import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../Components/Sidebar.tsx"; // Optional
import DashboardHeader from "../../Components/DashboardHeader.tsx"; // Optional
import RightSidebar from "../../Components/RightSidebar"; // Optional
import { UserRoleContext } from "../../UserRoleContext";

const DashboardLayout = () => {
  return (
    <UserRoleContext.Provider value="admin">
      <div className="min-h-screen justify-center  flex">
        {/* Optional Sidebar */}
        <Sidebar />
        <div className="flex-1">
          <DashboardHeader />
          <main className="p-4">
            <Outlet /> {/* Render dashboard child route */}
          </main>
        </div>
        <RightSidebar />
      </div>
    </UserRoleContext.Provider>
  );
};

export default DashboardLayout;
