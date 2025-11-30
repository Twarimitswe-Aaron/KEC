import React, { useContext } from "react";
import { FaPeopleRoof } from "react-icons/fa6";
import Rating from "./Rating";
import { UserRoleContext, UserRole } from "../../UserRoleContext";
import { Link } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import RightSidebarSkeleton from "./RightSidebarSkeleton";
import { useGetTopLocationsQuery } from "../../state/api/authApi";


const RightSidebar = () => {
  const { userData, isLoading, refetchUser } = useUser();
  const userRole = useContext(UserRoleContext) as UserRole;

  // Show skeleton while loading
  if (isLoading) {
    return <RightSidebarSkeleton />;
  }

  const isStudent = (role: UserRole): role is "student" => role === "student";

  const TopLocationsList = () => {
    const { data: topLocations, isLoading } = useGetTopLocationsQuery();

    if (isLoading) {
      return <div className="text-sm text-gray-500">Loading locations...</div>;
    }

    if (!topLocations || topLocations.length === 0) {
      return (
        <div className="text-sm text-gray-500">No location data available</div>
      );
    }

    const colors = [
      "bg-gradient-to-r from-white to-blue-400",
      "bg-gradient-to-r from-white to-green-400",
      "bg-gradient-to-r from-white to-red-400",
      "bg-gradient-to-r from-white to-yellow-400",
      "bg-gradient-to-r from-white to-purple-400",
    ];

    return (
      <ul className="">
        {topLocations.map((loc, index: number) => (
          <li key={loc.name} className="rounded-md overflow-hidden">
            <div className="flex items-center justify-between p-2 relative">
              {index < 3 ? (
                <div
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                    colors[index % colors.length]
                  }`}
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
    );
  };

  const workshops = [
    { name: "Nyamirabo", image: "/images/subHero.png" },
    { name: "Gatenga", image: "/images/gatenga.png" },
    { name: "IPRC Kicukiro", image: "/images/kicukiro.png" },
    { name: "Gisozi TSS", image: "/images/gisozi.png" },
  ];
  const truncateName = (name: string, maxLength: number) => {
    if (!name) return "";
    return name.length > maxLength ? name.slice(0, maxLength) + "..." : name;
  };

  return (
    <aside
      className=" hidden md:block md:w-full top-0 sticky z-10  p-4 bg-white shadow-xl  rounded-xl space-y-6
    max-h-screen overflow-y-auto hover:overflow-y-scroll scroll-hide"
    >
      {/* Profile Section */}
      <div className="text-center flex justify-center items-center">
        <h2 className="text-lg font-semibold  capitalize">{userRole}</h2>
        <div className="mx-auto items-center flex ">
          <Link to="/my-account">
            <img
              src={
                userData?.profile?.avatar
                  ? userData.profile.avatar
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      userData?.firstName ?? ""
                    )}&background=022F40&color=ffffff&rounded=true&size=64`
              }
              alt="Profile"
              className="xl:!w-16 xl:!h-16 w-11 h-11 rounded-full object-cover mb-1"
            />
          </Link>
        </div>
        <div className="block">
          <h3 className="font-medium" title={userData?.lastName}>
            {truncateName(userData?.lastName ?? "", 6)}
          </h3>
          <p className="text-sm text-gray-500"></p>
        </div>
      </div>

      {isStudent(userRole) && <Rating />}

      {!isStudent(userRole) && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Top Student Location
          </h3>
          <TopLocationsList />
        </div>
      )}

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
                className="w-10 h-10 rounded-md cursor-pointer object-cover"
              />
              <span className="text-sm  font-medium text-gray-700">
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
