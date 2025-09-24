import React, { useState, useEffect, useContext } from "react";
import { UserRoleContext as UserRoleContextImport } from "../UserRoleContext";
import { useUser } from "../hooks/useUser";

type AnnouncementCardProps = {
  name: string;
  role: string;
  message: string;
  date: string;
};

type AnnouncementSubmitProps = {
  content: string;
  poster: {
    firstName: string;
    lastName: string;
    avatar: string;
    email: string;
  };
};

// Sub-component for individual announcement cards
const AnnouncementCard = ({
  name,
  role,
  message,
  date,
}: AnnouncementCardProps) => {
  return (
    <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 p-5 mb-6 hover:shadow-xl transition duration-300">
      <div className="flex items-center gap-4 mb-3">
        <img
          src={`https://ui-avatars.com/api/?name=${name}&background=022F40&color=ffffff&rounded=true&size=64`}
          alt={`${name} avatar`}
          className="w-12 h-12 rounded-full border-none  shadow-sm"
        />
        <div className="flex justify-between w-full items-center gap-2">
          <div className="inline-block">
            <h3 className="font-semibold text-[#022F40] text-lg tracking-wide">
              {name}
            </h3>
            <p className="text-xs text-gray-600 uppercase">{role}</p>
          </div>
          <div className="text-sm">
            <p>{date}</p>
          </div>
        </div>
      </div>
      <p className="text-gray-800 text-sm leading-relaxed tracking-wide">
        {message}
      </p>
    </div>
  );
};

// Main Announcements component
const Announcements = () => {
  const UserRole = useContext(UserRoleContextImport);
  const [feedback, setFeedback] = useState("");
  const { userData, isLoading, refetchUser } = useUser();

  const handleSubmit = () => {
    console.log("Feedback submitted:", feedback);
    setFeedback("");
  };

  const announcements = [
    {
      name: "Cassie Morgan",
      role: "Teacher",
      date: "2023-10-01",
      message:
        "Attention Mechanical Engineering students! Upcoming events include guest lectures, hands-on workshops, industry visits, internship opportunities, and student projects. Participate to enhance your learning and professional skills. Stay tuned for details!",
    },
    {
      name: "Mucyo Austin",
      role: "Teacher",
      date: "2023-10-02",
      message:
        "Attention Mechanical Engineering students! We have exciting opportunities coming your way: guest lectures, hands-on workshops, industry visits, internships, and collaborative projects. Mark your calendars and participate to boost your skills and learning. More details to come!",
    },
    {
      name: "Cassie Morgan",
      role: "Teacher",
      date: "2023-10-03",
      message:
        "Attention Mechanical Engineering students! Upcoming events include guest lectures, hands-on workshops, industry visits, internship opportunities, and student projects. Participate to enhance your learning and professional skills. Stay tuned for details!",
    },
  ];

  return (
    <div className="">
      {(UserRole === "admin" || UserRole === "teacher") && (
        <div className="flex items-top p-2.5">
          <img
            src={userData?.profile?.avatar}
            alt={userData?.firstName}
            className="w-10 h-10 rounded-full mr-2.5"
          />
          <div className="flex-1 bg-gray-100 rounded-lg p-2.5">
            <div className="flex flex-col h-full">
              <textarea
                placeholder={"Type your announcement here"}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full min-h-[140px] p-2.5 scroll-hide rounded-lg border-none resize-none bg-gray-100 focus:outline-none"
              />
              <div className="flex justify-end mt-1">
                <button
                  onClick={handleSubmit}
                  className="px-4 py-1 bg-[#022F40] text-white rounded-lg cursor-pointer hover:bg-[#033549]"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-3xl font-bold text-[#022F40] mb-6 tracking-tight">
          Announcements
        </h2>
        {announcements.length > 0 ? (
          announcements.map((announcement, index) => (
            <AnnouncementCard
              key={index}
              name={announcement.name}
              role={announcement.role}
              message={announcement.message}
              date={announcement.date}
            />
          ))
        ) : (
          <p className="text-gray-400 text-center">
            No announcements available.
          </p>
        )}
      </div>
    </div>
  );
};

export default Announcements;
