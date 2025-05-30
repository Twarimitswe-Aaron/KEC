import React, { useState, useEffect, useContext } from "react";
import { NavLink } from "react-router-dom";

import {
  FiHome,
  FiSettings,
} from "react-icons/fi";
import { FaChevronLeft, FaChevronRight, FaRegUser } from "react-icons/fa6";
import { FaTimes } from "react-icons/fa";
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

interface SidebarProps {
  isMobileOpen?: boolean;
  onClose?: () => void;
}

const Dashboard: RoleBasedSidebar = {
  admin: [
    { label: "Dashboard", path: "/dashboard", icon: <FiHome /> },
    { label: "Inbox", path: "/inbox", icon: <RiMessage3Line /> },
    { label: "User ", path: "/user-management", icon: <MdContacts /> },
    { label: "Course ", path: "/course-management", icon: <BsGraphUp /> },
    { label: "Payment ", path: "/payment-management", icon: <MdPayment /> },
    { label: "My Account", path: "/my-account", icon: <FaRegUser /> },
    { label: "Feedback", path: "/feedback", icon: <LuMessageSquareMore /> },
    { label: "Anouncements", path: "/anouncements", icon: <MdOutlineAnnouncement /> },
    { label: "Certificates ", path: "/certificate-creation", icon: <FiSettings /> },
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

const Sidebar = ({ isMobileOpen, onClose }: SidebarProps) => {
  const role = useContext(UserRoleContext) as UserRole;
  const [collapsed, setCollapsed] = useState(false);
  const sidebarLinks = Dashboard[role];

  // Handle resize behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(false); // default collapsed for mobile = false (w-20)
      } else {
        setCollapsed(true); // default expanded for desktop = true (w-64)
      }
    };

    handleResize(); // call on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarWidth = collapsed ? "w-64" : "w-20";

  return (
    <div
      className={`h-screen lg:w-full flex  flex-col transition-all  duration-300 shadow-lg bg-[#F5FAFF] p-5
        ${sidebarWidth}  top-0 left-0 rounded-r-xl z-30
        ${isMobileOpen ? " top-0 left-0 z-50" : ""}
       
      `}
    >
      {/* Mobile Close Button */}
      {isMobileOpen && (
        <button
          className={`${sidebarWidth=== "w-20" ? "translate-x-0":"translate-x-42"} absolute top-3 right-0 p-2  rounded-full bg-white shadow-sm z-50`}
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <FaTimes className="w-3 h-3 text-gray-700" />
        </button>
      )}

      {/* Logo & Collapse Toggle */}
      <div className=" flex justify-between items-center">
        {collapsed && (
          <img src="/images/Logo.svg" alt="logo" className="w-20 h-20" />
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-[#034153] lg:hidden block"
        >
          {collapsed ? <FaChevronLeft /> : <FaChevronRight />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 mt-4">
        {sidebarLinks.map((item) => {
          const isLogout = item.label.toLowerCase() === "logout";
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center p-3 rounded-md cursor-pointer transition-all gap-3
                ${isLogout
                  ? "bg-[#FDF0EC] text-[#81290E] hover:bg-[#fce5e0]"
                  : isActive
                  ? "bg-[#034153] text-white"
                  : "bg-white text-[#034153] hover:bg-[#e6f2f5] hover:text-[#034153]"
                }`
              }
            >
              {item.icon}
              {collapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
