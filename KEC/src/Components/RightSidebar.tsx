import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FiHome, FiUser, FiSettings, FiLogOut } from "react-icons/fi";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const RightSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`h-screen fixed top-0 right-0 z-50 flex flex-col bg-[#022F40] text-white shadow-lg transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-4">
        {!collapsed && <h1 className="text-xl font-bold">Dashboard</h1>}
        <button onClick={() => setCollapsed(!collapsed)} className="text-white">
          {collapsed ? <FaChevronLeft /> : <FaChevronRight />}
        </button>
      </div>

      <nav className="flex flex-col px-2">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-4 p-3 rounded-md hover:bg-[#034153] ${
              isActive ? "bg-[#034153]" : ""
            }`
          }
        >
          <FiHome className="text-xl" /> {!collapsed && "Home"}
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-4 p-3 rounded-md hover:bg-[#034153] ${
              isActive ? "bg-[#034153]" : ""
            }`
          }
        >
          <FiUser className="text-xl" /> {!collapsed && "Profile"}
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-4 p-3 rounded-md hover:bg-[#034153] ${
              isActive ? "bg-[#034153]" : ""
            }`
          }
        >
          <FiSettings className="text-xl" /> {!collapsed && "Settings"}
        </NavLink>

        <NavLink
          to="/logout"
          className={({ isActive }) =>
            `flex items-center gap-4 p-3 rounded-md hover:bg-[#034153] ${
              isActive ? "bg-[#034153]" : ""
            }`
          }
        >
          <FiLogOut className="text-xl" /> {!collapsed && "Logout"}
        </NavLink>
      </nav>
    </div>
  );
};

export default RightSidebar;
