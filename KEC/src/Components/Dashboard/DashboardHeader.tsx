import { FiSearch } from "react-icons/fi";
import { IoMdNotificationsOutline } from "react-icons/io";
import { FaBars } from "react-icons/fa6";

interface DashboardHeaderProps {
  onHamburgerClick?: () => void; // This toggles sidebar open state
}

const DashboardHeader = ({ onHamburgerClick }: DashboardHeaderProps) => {
  return (
    <header className="flex flex-row  md:flex-row !w-full items-center justify-between  gap-2 p-4 bg-white shadow rounded-xl ">
      {/* Hamburger for mobile - only change is using onHamburgerClick */}
      <button
        className="md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={onHamburgerClick}
        aria-label="Open sidebar"
      >
        <FaBars className="w-6 h-6 text-gray-700" />
      </button>

      {/* Left: Greeting */}
      <div className="w-full md:flex-1 text-start md:text-left mb-2 md:mb-0">
        <h2 className="text-xl font-semibold text-gray-800">Hello, Aaron</h2>
        <p className="text-sm text-gray-500">Let's see something new today</p>
      </div>

      {/* Middle: Search */}
      <div className="relative w-full md:flex-1 items-center min-w-[180px] sm:block hidden max-w-md">
        <input
          type="text"
          placeholder="Search anything here..."
          className="w-full pl-4 pr-10 py-2 text-sm rounded-md border border-gray-200 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>

      {/* Right: Notification */}
      <div className="relative flex-shrink-0 ">
        <button className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center shadow-sm hover:bg-gray-50">
          <IoMdNotificationsOutline className="text-xl text-gray-600" />
          <span className="absolute top-1.5 right-1.5 block w-2 h-2 rounded-full bg-red-500 ring-1 ring-white"></span>
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
