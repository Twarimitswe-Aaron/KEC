import React, { useState } from "react";
import LeftSideInbox from "./LeftSideInbox";
import ChatComponent from "./Chat";
import RightSidebar from "./RightSidebar";
import { IoMenu } from "react-icons/io5";
import { CgChevronLeft } from "react-icons/cg";
import CreateGroupModal from "./CreateGroupModal";

const InboxLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleRightSidebar = () => setRightSidebarOpen(!rightSidebarOpen);

  return (
    <div className="flex h-screen w-full bg-[#F5FAFF]">
      {/* Mobile Sidebar Toggle Button */}
      <button
        className="block sm:hidden fixed top-4 left-4 z-40 bg-white p-2 rounded-full shadow"
        onClick={toggleSidebar}
        aria-label="Open sidebar"
      >
        <IoMenu size={24} />
      </button>

      {/* Left Sidebar (Chats List) */}
      <div
        className={`
          fixed top-0 left-0 h-full w-4/5 max-w-xs bg-[#F5FAFF] z-30 shadow-lg transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          sm:static sm:translate-x-0 sm:w-[300px] sm:min-w-[300px] sm:max-w-[400px] sm:border-r border-gray-200
          overflow-y-auto
        `}
      >
        {/* Close button for mobile */}
        <button
          className="block sm:hidden absolute top-4 right-4 z-40 bg-white p-2 rounded-full shadow"
          onClick={toggleSidebar}
          aria-label="Close sidebar"
        >
          <CgChevronLeft size={24} />
        </button>
        <LeftSideInbox
          onCloseSidebar={() => setSidebarOpen(false)}
          onOpenCreateGroup={() => setIsCreateGroupModalOpen(true)}
        />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <ChatComponent onToggleRightSidebar={toggleRightSidebar} />
      </div>

      {/* Right Sidebar (Shared Files/Photos) */}
      <div
        className={`
           fixed top-0 right-0 h-full  bg-gray-50 z-30 shadow-lg transition-transform duration-300
           ${rightSidebarOpen ? "translate-x-0" : "translate-x-full"}
           sm:static sm:translate-x-0 sm:w-[320px] sm:min-w-[250px] sm:max-w-[320px]
           ${!rightSidebarOpen && "hidden lg:flex"}
           overflow-y-auto
         `}
      >
        {rightSidebarOpen && (
          <button
            className="block sm:hidden absolute top-4 left-4 z-40 bg-gray-100 p-2 rounded-full shadow"
            onClick={toggleRightSidebar}
            aria-label="Close right sidebar"
          >
            <CgChevronLeft size={24} className="rotate-180" />
          </button>
        )}
        {/* Render RightSidebar content here or pass open state */}
        <RightSidebar />
      </div>

      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
      />
    </div>
  );
};

export default InboxLayout;
