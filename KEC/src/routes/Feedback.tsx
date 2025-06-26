import React, { useContext, useState } from "react";
import { UserRoleContext } from "../UserRoleContext";

const Feedback = () => {
    const UserRole = useContext(UserRoleContext);
    const [feedback, setFeedback] = useState('');
    const [userData, setUserData] = useState({
        profileImage: "./images/user.png",
        name: 'Aart',
        placeholderText: 'Type your announcements here...',
      });
        
    const handleSubmit = () => {
        console.log('Feedback submitted:', feedback);
        setFeedback('');
      };
  const [feedbacks] = useState([
    {
      id: 1,
      image: "/images/user.png",
      name: "Izere Cassie",
      role: "Student",
      quote: "The interactive tools and resources on this website have made learning so much more engaging. I find it easier to grasp difficult concepts thanks to the well-organized materials and helpful videos.",
    },
    {
      id: 2,
      image: "/images/user.png",
      name: "Cyusa Arnold",
      role: "Teacher",
      quote: "I love how user-friendly this website is! The clean layout and easy navigation ensure I can quickly find what I need. The live chat support is also a great feature whenever I have questions.",
    },
    {
      id: 3,
      image: "/images/user.png",
      name: "Muhire Prince",
      role: "Teacher",
      quote: "This platform has been a game-changer for my studies. The timely notifications about assignments and exams keep me on track, and the availability of previous lecture recordings helps me revisit topics I need more time with.",
    },
  ]);

  return (
   <div className="">
    {(UserRole === "student" || UserRole=== "teacher") && (
            <div className="flex items-top p-2.5">
            <img
              src={userData.profileImage}
              alt={userData.name}
              className="w-10 h-10 rounded-full mr-2.5"
            />
            <div className="flex-1 bg-gray-100 rounded-lg p-2.5">
              <div className="flex flex-col h-full">
                <textarea
                  placeholder={userData.placeholderText || 'Type your feedback or request here'}
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
     <div className="max-w-full mx-auto  p-4 space-y-6 bg-white ">
      {feedbacks.map((feedback) => (
        <div
          key={feedback.id}
          className="flex items-start p-4 bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <img
            src={feedback.image}
            alt={`${feedback.name}'s profile`}
            className="w-10 h-10 rounded-full mr-4"
          />
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{feedback.name}</h3>
                <p className="text-sm text-gray-600">{feedback.role}</p>
              </div>
              <span className="text-2xl text-gray-400">”</span>
            </div>
            <p className="text-gray-700 italic">{feedback.quote}</p>
          </div>
        </div>
      ))}
    </div>
   </div>
  );
};

export default Feedback;