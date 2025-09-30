import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../../Components/Dashboard/Sidebar";
import DashboardHeader from "../../Components/Dashboard/DashboardHeader";
import RightSidebar from "../../Components/Dashboard/RightSidebar";
import { UserRoleContext, UserRole } from "../../UserRoleContext";
import { SearchContext } from "../../SearchContext";
import { useGetUserQuery, useLogoutMutation } from "../../state/api/authApi";
import { DashboardSkeleton, LoadingRedirect } from "./Skeleton/DashboardSkeleton"; 
import { toast } from "react-toastify";

const DashboardLayout = () => {
  const [logout, setLogout] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen((open) => !open);
  const closeSidebar = () => setSidebarOpen(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading } = useGetUserQuery();
  const [logoutUser] = useLogoutMutation();
  const navigate=useNavigate()

  useEffect(() => {
    if (!isLoading && !data && !logout) {
      logoutUser();
      setLogout(true);
      window.location.href = '/login';
    }
  }, [isLoading, data, logout, logoutUser]);


  useEffect(() => {
    if (data && !data.isEmailVerified) {
      setTimeout(() => {
     
        toast.error('Your email is not verified. Please check your email!', { autoClose: 5000 });
       
      }, 1500);
    }
  }, [data, navigate]);


  
  
  // Show skeleton while loading
  if (isLoading) {
    return <DashboardSkeleton />;
  }
  
  if (!data ) {
    if (!logout) {
      logoutUser();
      setLogout(true);
      window.location.href = '/login';
    }
    return <LoadingRedirect />;
  }
 
 

  return (
    <UserRoleContext.Provider value={data?.role as UserRole}>
      <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
        <div className="w-full min-h-screen flex">
          {/* Left Sidebar for md+ */}
          <aside className="hidden md:block  w-[10%] cu h-screen sticky left-0 top-0">
            <Sidebar />
          </aside>

          {/* Mobile Sidebar Drawer */}
          {isSidebarOpen && (
            <div className="fixed inset-0 z-100 flex md:hidden">
              {/* Overlay */}
              <div
                className="fixed inset-0 bg-black/30"
                onClick={closeSidebar}
              ></div>
              {/* Sidebar Drawer */}
              <div className="relative w-20 h-full bg-[#black] shadow-lg z-50">
                <Sidebar onClose={closeSidebar} isMobileOpen />
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 w-full px-2 min-h-screen">
            <div className="sticky z-50 top-0 mx-3 bg-white">
              <DashboardHeader 
                searchQuery={searchQuery} 
                setSearchQuery={setSearchQuery} 
                onHamburgerClick={toggleSidebar} 
              />
            </div>
            <main className="p-4">
              <Outlet />
            </main>
          </div>

          {/* Right Sidebar */}
          <aside className="hidden  lg:block w-[20%] h-screen sticky right-0 top-0">
            <RightSidebar />
          </aside>
        </div>
      </SearchContext.Provider>
    </UserRoleContext.Provider>
  );
};

export default DashboardLayout;