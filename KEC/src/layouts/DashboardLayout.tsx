import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Components/Sidebar.tsx"; // Optional
import DashboardHeader from "../Components/DashboardHeader.tsx"; // Optional

const DashboardLayout = () => {
  return (
    <div className="min-h-screen flex">
      {/* Optional Sidebar */}
      <Sidebar />
      <div className="flex-1">
        <DashboardHeader />
        <main className="p-4">
          <Outlet /> {/* Render dashboard child route */}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
