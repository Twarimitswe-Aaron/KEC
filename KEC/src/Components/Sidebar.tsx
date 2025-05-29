import React, { useState, useEffect, useContext } from "react";
import { NavLink } from "react-router-dom";

import {
  FiHome,
  FiSettings,
} from "react-icons/fi";
import { FaChevronLeft, FaChevronRight, FaRegUser } from "react-icons/fa6";
import { RiMessage3Line } from "react-icons/ri";
import { MdContacts, MdPayment, MdOutlineAnnouncement } from "react-icons/md";
import { BsGraphUp } from "react-icons/bs";
import { LuMessageSquareMore } from "react-icons/lu";
import { CgLogOut } from "react-icons/cg";
import { UserRoleContext, UserRole } from "../UserRoleContext";

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
    { label: "Dashboard", path: "/dashboard", icon: <FiHome /> },
    { label: "Inbox", path: "/inbox", icon: <RiMessage3Line /> },
    { label: "User Management", path: "/user-management", icon: <MdContacts /> },
    { label: "Course Management", path: "/course-management", icon: <BsGraphUp /> },
    { label: "Payment Management", path: "/payment-management", icon: <MdPayment /> },
    { label: "My Account", path: "/my-account", icon: <FaRegUser /> },
    { label: "Feedback", path: "/feedback", icon: <LuMessageSquareMore /> },
    { label: "Anouncements", path: "/anouncements", icon: <MdOutlineAnnouncement /> },
    { label: "Certificates Creation", path: "/certificate-creation", icon: <FiSettings /> },
    { label: "Logout", path: "/logout", icon: <CgLogOut /> },
  ],
  teacher: [
    { label: "Dashboard", path: "/dashboard", icon: <FiHome /> },
    { label: "Inbox", path: "/inbox", icon: <RiMessage3Line /> },
    { label: "Course Creation", path: "/course-creation", icon: <BsGraphUp /> },
    { label: "My Account", path: "/my-account", icon: <FaRegUser /> },
    { label: "Feedback", path: "/feedback", icon: <LuMessageSquareMore /> },
    { label: "Certificates Creation", path: "/certificate-creation", icon: <FiSettings /> },
    { label: "Anouncements", path: "/anouncements", icon: <MdOutlineAnnouncement /> },
    { label: "Logout", path: "/logout", icon: <CgLogOut /> },
  ],
  student: [
    { label: "Dashboard", path: "/dashboard", icon: <FiHome /> },
    { label: "Inbox", path: "/inbox", icon: <RiMessage3Line /> },
    { label: "Anouncements", path: "/anouncements", icon: <MdOutlineAnnouncement /> },
    { label: "Feedback", path: "/feedback", icon: <LuMessageSquareMore /> },
    { label: "Logout", path: "/logout", icon: <CgLogOut /> },
  ],
};

const Sidebar = () => {
  const role = useContext(UserRoleContext) as UserRole;
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarLinks = Dashboard[role];

  return (
    <div
      className={`h-screen md:fixed top-0 left-0 rounded-r-xl  flex flex-col transition-all duration-300 shadow-lg bg-[#F5FAFF] p-5
        ${collapsed ? "w-20" : "w-64"}
        lg:w-64 md:rounded-none md:shadow-none`}
    >
      {/* Logo and Collapse Button */}
      <div className="flex justify-between items-center">
        {!collapsed && (
          <div className="text-left w-full">
            <img src="/images/Logo.svg" alt="logo" className="w-20 h-20" />
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="text-white cursor-pointer">
          {collapsed ? (
            <FaChevronRight size={20} className="text-[#034153] lg:hidden" />
          ) : (
            <FaChevronLeft size={20} className="text-[#034153] lg:hidden" />
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-2 mt-4">
        {sidebarLinks.map((item) => {
          const isLogout = item.label.toLowerCase() === "logout";

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-md cursor-pointer transition-all ${
                  isLogout
                    ? "bg-[#FDF0EC] text-[#81290E] hover:bg-[#fce5e0]"
                    : isActive
                    ? "bg-[#034153] text-white"
                    : "bg-white text-[#034153] hover:bg-[#e6f2f5] hover:text-[#034153]"
                }`
              }
            >
              {item.icon}
              {!collapsed && item.label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
