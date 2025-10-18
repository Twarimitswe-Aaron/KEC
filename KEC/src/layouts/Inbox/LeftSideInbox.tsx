import React, { useState, useEffect } from "react";
import { CgChevronLeft } from "react-icons/cg";
import { IoEllipsisVerticalCircleOutline } from "react-icons/io5";
import { TbSearch } from "react-icons/tb";
import { Link } from "react-router-dom";
import { IoChatbubbleEllipses } from "react-icons/io5";
import { MdMarkChatUnread } from "react-icons/md"; // For Unread
import { FaStar } from "react-icons/fa"; // For Favorites
import { BsPeopleFill } from "react-icons/bs"; // For Non-contacts
import { MdGroups } from "react-icons/md"; // For Groups
import { FaRegEdit } from "react-icons/fa"; // For Drafts

interface LeftSideInboxProps {
  onCloseSidebar: () => void;
}

const LeftSideInbox: React.FC<LeftSideInboxProps> = ({ onCloseSidebar }) => {
  const [selected, setSelected] = useState("All");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const baseClasses =
    "px-5 py-2 rounded-full transition-all duration-200 focus:outline-none";

  const isSelected = (btn: string): boolean => selected === btn;

  useEffect(() => {
    if (selected !== 'All') {
      setIsMenuOpen(false);
    }
  }, [selected]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="scroll-hide h-full flex flex-col">
      {/* Sticky Header */}
      <div className="sticky w-full top-0 left-0 bg-[#F5FAFF] z-10 pb-4">
        {/* Logo */}
        <div className="mb-2">
          <img src="/images/Logo.svg" className="w-16 h-16" alt="Logo" />
        </div>

        {/* Back and Heading */}
        <div className="flex justify-between items-center mb-4">
          {/* Mobile close button is handled by parent layout now */}
          <Link
            to="/dashboard"
            className="py-2 px-3 bg-[#EEEFF1] shadow-sm rounded flex items-center gap-2"
          >
            <CgChevronLeft />
            <p className="text-sm">Back</p>
          </Link>
          <h3 className="text-lg font-semibold text-gray-800">All Messages</h3>
          <div className="relative">
            <IoEllipsisVerticalCircleOutline
              size={28}
              color="#3F3F44"
              onClick={toggleMenu}
              style={{ cursor: "pointer" }}
            />
            {isMenuOpen && (
              <div className="absolute right-0 z-20 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg">
                <ul className="py-2 text-sm text-gray-200">
                  <li className="px-4 py-2 flex gap-2 items-center hover:bg-gray-700 cursor-pointer" onClick={() => { setSelected("Unread"); setIsMenuOpen(false); }}> <MdMarkChatUnread /> <p>Unread</p> </li>
                  <li className="px-4 py-2 flex gap-2 items-center hover:bg-gray-700 cursor-pointer" onClick={() => { setSelected("Favorites"); setIsMenuOpen(false); }}> <FaStar /> <p>Favorites</p> </li>
                  <li className="px-4 py-2 flex gap-2 items-center hover:bg-gray-700 cursor-pointer" onClick={() => { setSelected("Contacts"); setIsMenuOpen(false); }}> <IoChatbubbleEllipses /> <p>Contacts</p> </li>
                  <li className="px-4 py-2 flex gap-2 items-center hover:bg-gray-700 cursor-pointer" onClick={() => { setSelected("Non-contacts"); setIsMenuOpen(false); }}> <BsPeopleFill /> <p>Non-contacts</p> </li>
                  <li className="px-4 py-2 flex gap-2 items-center hover:bg-gray-700 cursor-pointer" onClick={() => { setSelected("Groups"); setIsMenuOpen(false); }}> <MdGroups /> <p>Groups</p> </li>
                  <li className="px-4 py-2 flex gap-2 items-center hover:bg-gray-700 cursor-pointer" onClick={() => { setSelected("Drafts"); setIsMenuOpen(false); }}> <FaRegEdit /> <p>Drafts</p> </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="flex justify-between items-center mt-4">
          <div className="relative w-full">
            <input
              placeholder="Search"
              className="w-full pl-10 pr-3 py-2 text-sm rounded-md border border-gray-200 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              type="text"
            />
            <TbSearch className="absolute text-gray-400 top-2.5 left-3" />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex mt-4 items-center gap-3">
          <button
            onClick={() => setSelected("All")}
            className={`${baseClasses} cursor-pointer ${
              isSelected("All")
                ? "bg-[#003f5c] text-white shadow-md"
                : "bg-[#EEEFF1] text-[#003f5c] shadow-sm hover:bg-[#d2d4d6]"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelected("Unread")}
            className={`${baseClasses} cursor-pointer ${
              isSelected("Unread")
                ? "bg-[#003f5c] text-white shadow-md"
                : "bg-[#EEEFF1] text-[#003f5c] shadow-sm hover:bg-[#d2d4d6]"
            }`}
          >
            Unread
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 space-y-0 mt-0 scroll-hide overflow-y-auto divide-y divide-gray-200">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex rounded-md items-center w-full justify-between bg-white hover:bg-gray-100 px-4 py-2 my-1 cursor-pointer transition-colors duration-150"
          >
            {/* Avatar + Text */}
            <div className="flex items-center gap-3">
              <img
                src="/images/teacher.png"
                alt="Avatar"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex flex-col text-black">
                <span className="font-semibold text-sm">React.JS 🇷🇼</span>
                <span className="text-xs text-gray-600 max-w-[180px] truncate">~rwema: why you that?</span>
              </div>
            </div>

            {/* Time + Count */}
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs text-gray-500">13:30</span>
              <div className="w-4 h-4 flex items-center justify-center text-white text-[10px] rounded-full bg-green-500">
                9
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeftSideInbox;