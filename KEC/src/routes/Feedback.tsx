import React, { useState, useContext } from "react";
import { UserRoleContext } from "../UserRoleContext";

type FeedbackCardProps = {
  name: string;
  role: string;
  message: string;
  date: string;
};

// Sub-component for individual feedback cards
const FeedbackCard = ({ name, role, message, date }: FeedbackCardProps) => {
  return (
    <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 p-5 mb-6 hover:shadow-xl transition duration-300">
      <div className="flex items-center gap-4 mb-3">
        <img
          src={`https://ui-avatars.com/api/?name=${name}&background=022F40&color=ffffff&rounded=true&size=64`}
          alt={`${name} avatar`}
          className="w-12 h-12 rounded-full border-none shadow-sm"
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

// Main Feedback component
const Feedback = () => {
  const UserRole = useContext(UserRoleContext);
  const [feedback, setFeedback] = useState("");
  const [userData, setUserData] = useState({
    profileImage: "./images/user.png",
    name: "Aart",
    placeholderText: "Type your Feedback here...",
  });

  const handleSubmit = () => {
    console.log("Feedback submitted:", feedback);
    setFeedback("");
  };

  const feedbacks = [
    {
      name: "Izere Cassie",
      role: "Student",
      date: "2025-06-25",
      message:
        "The interactive tools and resources on this website have made learning so much more engaging. I find it easier to grasp difficult concepts thanks to the well-organized materials and helpful videos.",
    },
    {
      name: "Cyusa Arnold",
      role: "Teacher",
      date: "2025-06-26",
      message:
        "I love how user-friendly this website is! The clean layout and easy navigation ensure I can quickly find what I need. The live chat support is also a great feature whenever I have questions.",
    },
    {
      name: "Muhire Prince",
      role: "Teacher",
      date: "2025-06-26",
      message:
        "This platform has been a game-changer for my studies. The timely notifications about assignments and exams keep me on track, and the availability of previous lecture recordings helps me revisit topics I need more time with.",
    },
  ];

  return (
    <div className="">
      {(UserRole === "student" || UserRole === "teacher") && (
        <div className="flex items-top p-2.5">
          <img
            src={userData.profileImage}
            alt={userData.name}
            className="w-10 h-10 rounded-full mr-2.5"
          />
          <div className="flex-1 bg-gray-100 rounded-lg p-2.5">
            <div className="flex flex-col h-full">
              <textarea
                placeholder={userData.placeholderText}
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
      {UserRole !== "student" && (
        <div className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-3xl font-bold text-[#022F40] mb-6 tracking-tight">
          Feedback
        </h2>
        {feedbacks.length > 0 ? (
          feedbacks.map((feedback, index) => (
            <FeedbackCard
              key={index}
              name={feedback.name}
              role={feedback.role}
              message={feedback.message}
              date={feedback.date}
            />
          ))
        ) : (
          <p className="text-gray-400 text-center">No feedback available.</p>
        )}
      </div>
      ) }
    </div>
  );
};

export default Feedback;