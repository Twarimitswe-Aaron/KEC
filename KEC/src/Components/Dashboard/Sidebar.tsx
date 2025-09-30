import React, { useState, useEffect, useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { FiHome, FiSettings } from "react-icons/fi";
import { FaChevronLeft, FaChevronRight, FaRegUser } from "react-icons/fa6";
import { FaTimes } from "react-icons/fa";
import { RiMessage3Line } from "react-icons/ri";
import { MdContacts, MdPayment, MdOutlineAnnouncement } from "react-icons/md";
import { BsGraphUp } from "react-icons/bs";
import { LuMessageSquareMore } from "react-icons/lu";
import { CgLogOut } from "react-icons/cg";
import { GrTasks } from "react-icons/gr";

import { UserRoleContext, UserRole } from "../../UserRoleContext";
import { useLogoutMutation } from "../../state/api/authApi";

type SidebarItem = {
  label: string;
  path: string;
  icon: React.ReactNode;
  onClick?: () => void; 
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
    { label: "User", path: "/user-management", icon: <MdContacts /> },
    { label: "Course", path: "/course-management", icon: <BsGraphUp /> },
    { label: "Payment", path: "/payment-management", icon: <MdPayment /> },
    { label: "Feedback", path: "/feedback", icon: <LuMessageSquareMore /> },
    { label: "Announcements", path: "/announcements", icon: <MdOutlineAnnouncement /> },
    { label: "Certificates", path: "/certificate-creation", icon: <FiSettings /> },
    { label: "Tasks", path: "/tasks", icon: <GrTasks /> },
    { label: "Logout", path: "/logout", icon: <CgLogOut /> },
  ],
  teacher: [
    { label: "Dashboard", path: "/dashboard", icon: <FiHome /> },
    { label: "Inbox", path: "/inbox", icon: <RiMessage3Line /> },
    { label: "Course Creation", path: "/course-creation", icon: <BsGraphUp /> },
    { label: "My Account", path: "/my-account", icon: <FaRegUser /> },
    { label: "Feedback", path: "/feedback", icon: <LuMessageSquareMore /> },
    { label: "Certificates", path: "/certificate-creation", icon: <FiSettings /> },
    { label: "Announcements", path: "/announcements", icon: <MdOutlineAnnouncement /> },
    { label: "Tasks", path: "/tasks", icon: <GrTasks /> },
    { label: "Logout", path: "/logout", icon: <CgLogOut /> },
  ],
  student: [
    { label: "Dashboard", path: "/dashboard", icon: <FiHome /> },
    { label: "Inbox", path: "/inbox", icon: <RiMessage3Line /> },
    { label: "Announcements", path: "/announcements", icon: <MdOutlineAnnouncement /> },
    { label: "My Account", path: "/my-account", icon: <FaRegUser /> },
    { label: "Feedback", path: "/feedback", icon: <LuMessageSquareMore /> },
    { label: "Logout", path: "/logout", icon: <CgLogOut /> },
  ],
};

const Sidebar = ({ isMobileOpen, onClose }: SidebarProps) => {
  const role = useContext(UserRoleContext) as UserRole;
  const [collapsed, setCollapsed] = useState(false);
  const sidebarLinks = Dashboard[role];
  const navigate = useNavigate();

  // Hook inside the component
  const [logoutUser] = useLogoutMutation();

  // Handle resize for collapsed sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1194) {
        setCollapsed(false);
      } else {
        setCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarWidth = collapsed ?  "w-20":"w-64";


  // Handle logout click
  const handleLogout = async () => {
    try {
      await logoutUser().unwrap();
      navigate("/login");
      if (onClose) onClose();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div
      className={`h-screen sticky  top-0 flex flex-col transition-all duration-300 shadow-lg bg-[#F5FAFF] p-5
      ${sidebarWidth} rounded-r-xl z-30 ${isMobileOpen ? "top-0 left-0 z-50" : ""}`}
    >
      {/* Mobile Close Button */}
      {isMobileOpen && (
        <button
          className={`${
            sidebarWidth === "w-20" ? "translate-x-0" : "translate-x-42"
          } absolute top-3 right-0 p-2 rounded-full bg-white shadow-sm z-50`}
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <FaTimes className="w-3 h-3 text-gray-700" />
        </button>
      )}

      {/* Logo & Collapse Toggle */}
      <div className="flex justify-between items-center">
        {!collapsed && <Link to="/"><img src="/images/Logo.svg" alt="logo" className="w-20 h-20" /></Link>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-[#034153]  left-side block"
        >
          {!collapsed ? <FaChevronLeft /> : <FaChevronRight />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 mt-4">
        {sidebarLinks.map((item) => {
          const isLogout = item.label.toLowerCase() === "logout";

          return (
            <NavLink
              key={item.path}
              to={isLogout ? "/logout" : item.path} 
              className={({ isActive }) =>
                `flex items-center p-3 rounded-md cursor-pointer transition-all gap-3
                ${
                  isLogout
                    ? "bg-[#FDF0EC] text-[#81290E] hover:bg-[#fce5e0]"
                    : isActive
                    ? "bg-[#034153] text-white"
                    : "bg-white text-[#034153] hover:bg-[#e6f2f5] hover:text-[#034153]"
                }`
              }
              onClick={(e) => {
                if (isLogout) {
                  e.preventDefault();
                  handleLogout();
                } else if (onClose) {
                  onClose(); // close mobile sidebar on any link click
                }
              }}
            >
              {item.icon}
              {!collapsed && <span className="whitespace-nowrap hidden lg:block">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
