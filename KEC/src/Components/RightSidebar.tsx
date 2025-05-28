import React from "react";
import { FaPeopleRoof } from "react-icons/fa6";
import Rating from "./Rating";

type UserRole = "admin" | "teacher" | "student";

const RightSidebar = () => {
  // Mock role — replace this with actual role from auth context or props
  const userRole: UserRole = "student"; // Change to "admin" or "teacher" to test different roles

  const isStudent = (role: UserRole): role is "student" => role === "student";

  const topLocations = [
    {
      name: "Kigali",
      students: 120,
      percent: "80%",
      color: "bg-gradient-to-r from-white to-blue-400",
    },
    {
      name: "Musanze",
      students: 90,
      percent: "60%",
      color: "bg-gradient-to-r from-white to-green-400",
    },
    {
      name: "Kibungo",
      students: 45,
      percent: "30%",
      color: "bg-gradient-to-r from-white to-red-400",
    },
  ];

  const workshops = [
    { name: "Nyamirabo", image: "/images/subHero.png" },
    { name: "Gatenga", image: "/images/gatenga.png" },
    { name: "IPRC Kicukiro", image: "/images/kicukiro.png" },
    { name: "Gisozi TSS", image: "/images/gisozi.png" },
  ];

  return (
    <aside className="lg:w-full md:w-[250px] sm:w-[80%] max-w-[280px] p-4 bg-white shadow-xl hidden md:block rounded-xl space-y-6
    max-h-screen overflow-y-auto hover:overflow-y-scroll scroll-hide"
  
  >
      {/* Profile Section */}
      <div className="text-center flex justify-center items-center">
        <h2 className="text-lg font-semibold mb-2 capitalize">{userRole}</h2>
        <div className="mx-auto items-center flex gap-4">
          <img
            src="/images/user.png"
            alt="Profile"
            className="w-16 h-16 rounded-full object-cover mb-1"
          />
          <div className="block">
            <h3 className="font-medium">Aaron</h3>
            <p className="text-sm text-gray-500"></p>
          </div>
        </div>
      </div>

      {/* Rating Section - only for non-admin/non-teacher */}
      {isStudent(userRole) && <Rating />}

      {/* Top Student Locations */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          Top Student Location
        </h3>
        <ul className="space-y-2">
          {topLocations.map((loc, index) => (
            <li key={loc.name} className="rounded-md overflow-hidden">
              <div className="flex items-center justify-between p-2 relative">
                {index < 3 ? (
                  <div
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${loc.color}`}
                    style={{
                      width: loc.percent,
                      minWidth: "fit-content",
                      maxWidth: "100%",
                      overflow: "hidden",
                    }}
                  >
                    <div className="flex items-center justify-center w-5 h-5">
                      <FaPeopleRoof className="text-sm" />
                    </div>
                    <span className="truncate">{loc.name}</span>
                    <span className="text-xs ml-auto">{loc.students}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 text-sm">
                    <div className="flex items-center justify-center w-5 h-5">
                      <FaPeopleRoof className="text-sm" />
                    </div>
                    <span>{loc.name}</span>
                    <span className="text-xs ml-auto">{loc.students}</span>
                  </div>
                )}
                <span className="text-xs text-gray-500 ml-2">{loc.percent}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Workshops */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          Available workshops
        </h3>
        <ul className="space-y-2">
          {workshops.map((ws, i) => (
            <li
              key={i}
              className={`flex items-center gap-3 p-2 rounded-md ${
                i % 2 === 0 ? "bg-yellow-50" : "bg-white"
              } shadow-sm`}
            >
              <img
                src={ws.image}
                alt={ws.name}
                className="w-10 h-10 rounded-md object-cover"
              />
              <span className="text-sm font-medium text-gray-700">
                {ws.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default RightSidebar;
