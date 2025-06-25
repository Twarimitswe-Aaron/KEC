import React from "react";

type AnnouncementCardProps = {
  name: string;
  role: string;
  message: string;
};

// Sub-component for individual announcement cards
const AnnouncementCard = ({ name, role, message }: AnnouncementCardProps) => {
  return (
    <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 p-5 mb-6 hover:shadow-xl transition duration-300">
      <div className="flex items-center gap-4 mb-3">
        <img
          src={`https://ui-avatars.com/api/?name=${name}&background=004e64&color=ffffff&rounded=true&size=64`}
          alt={`${name} avatar`}
          className="w-12 h-12 rounded-full border-none  shadow-sm"
        />
        <div>
          <h3 className="font-semibold text-[#004e64] text-lg tracking-wide">
            {name}
          </h3>
          <p className="text-xs text-gray-600 uppercase">{role}</p>
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
  const announcements = [
    {
      name: "Cassie Morgan",
      role: "Teacher",
      message:
        "Attention Mechanical Engineering students! Upcoming events include guest lectures, hands-on workshops, industry visits, internship opportunities, and student projects. Participate to enhance your learning and professional skills. Stay tuned for details!",
    },
    {
      name: "Mucyo Austin",
      role: "Teacher",
      message:
        "Attention Mechanical Engineering students! We have exciting opportunities coming your way: guest lectures, hands-on workshops, industry visits, internships, and collaborative projects. Mark your calendars and participate to boost your skills and learning. More details to come!",
    },
    {
      name: "Cassie Morgan",
      role: "Teacher",
      message:
        "Attention Mechanical Engineering students! Upcoming events include guest lectures, hands-on workshops, industry visits, internship opportunities, and student projects. Participate to enhance your learning and professional skills. Stay tuned for details!",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h2 className="text-3xl font-bold text-[#004e64] mb-6 tracking-tight">
        Announcements
      </h2>
      {announcements.length > 0 ? (
        announcements.map((announcement, index) => (
          <AnnouncementCard
            key={index}
            name={announcement.name}
            role={announcement.role}
            message={announcement.message}
          />
        ))
      ) : (
        <p className="text-gray-400 text-center">No announcements available.</p>
      )}
    </div>
  );
};

export default Announcements;
