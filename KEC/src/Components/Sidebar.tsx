import { NavLink } from "react-router-dom";
import { FiHome, FiUser, FiSettings, FiLogOut, FiShield } from "react-icons/fi";
import { useState } from "react";
import { FaAnglesLeft,FaAnglesRight } from "react-icons/fa6";
import React from "react";

interface SidebarProps {
  role: "admin" | "user";
}

const Sidebar = ({ role }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);


  type SidebarItem = {
    label: string;
    path: string;
    icon: React.ReactNode;
  };
  
  type RoleBasedSidebar = {
    [role: string]: SidebarItem[];
  };
  
  const Dashboard: RoleBasedSidebar = {
    admin: [
      {
        label: "Dashboard",
        path: "/dashboard",
        icon: <FiHome />,
      },
      {
        label: "Inbox",
        path: "/inbox",
        icon: <FiUser />,
      },
      {
        label: "User Management",
        path: "/user-management",
        icon: <FiUser />,
      },
      {
        label: "Settings",
        path: "/settings",
        icon: <FiSettings />,
      },
      {
        label: "Logout",
        path: "/logout",
        icon: <FiLogOut />,
      },
    ],
    user: [
      {
        label: "My Account",
        path: "/account",
        icon: <FiUser />,
      },
      {
        label: "Settings",
        path: "/settings",
        icon: <FiSettings />,
      },
      {
        label: "Logout",
        path: "/logout",
        icon: <FiLogOut />,
      },
    ],
  };
  

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 p-3 rounded-md cursor-pointer   transition-all hover:bg-[#034150] hover:text-white ${
      isActive ? "bg-[#034153] text-white" : "bg-white text-[#034153]"
    }`;

  return (
    <div
      className={`h-screen ${
        collapsed ? "w-20" : "w-64"
      } bg-[#F5FAFF] p-5 shadow-lg fixed top-0 left-0 flex flex-col transition-all duration-300`}
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="text-white self-end"
      >
        {collapsed ? <FaAnglesRight size={25} className="text-[#034153] cursor-pointer" /> : <FaAnglesLeft size={25} className="text-[#034153] cursor-pointer" />}
      </button>

      {!collapsed && (
        <div className="text-white text-2xl justify-center items-center font-bold  text-center">
         <img src="/images/Logo.svg" alt="logo" className="w-20 mx-auto h-20" /> 
        </div>
      )}

      <nav className="flex flex-col gap-2">
        <NavLink to="/dashboard" className={linkClass}>
          <FiHome /> {!collapsed && "Dashboard"}
        </NavLink>
        <NavLink to="/profile" className={linkClass}>
          <FiUser /> {!collapsed && "Profile"}
        </NavLink>
        <NavLink to="/settings" className={linkClass}>
          <FiSettings /> {!collapsed && "Settings"}
        </NavLink>

        {role === "admin" && (
          <NavLink to="/admin" className={linkClass}>
            <FiShield /> {!collapsed && "Admin Panel"}
          </NavLink>
        )}

        <NavLink to="/logout" className={linkClass}>
          <FiLogOut /> {!collapsed && "Logout"}
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
