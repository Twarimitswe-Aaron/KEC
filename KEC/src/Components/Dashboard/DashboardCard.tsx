import React, { useEffect, useState } from "react";
import { BsCameraVideoFill } from "react-icons/bs";
import { GoStopwatch } from "react-icons/go";

interface Course {
  image_url: string;
  title: string;
  description: string;
  price: string;
  no_lessons: string;
  no_hours: string;
  uploader: {
    name: string;
    avatar_url: string;
  };
}

const DashboardCard = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    // Mock backend fetch
    const fetchData = async () => {
      const data: Course[] = [
        {
          image_url: "/images/courseCard.png",
          title: "Thermodynamics",
          description:
            "Explore energy transfer, heat, and the laws of thermodynamics in detail through real-world applications.",
          price: "100,000frw",
          no_lessons: "10",
          no_hours: "22hrs32min",
          uploader: {
            name: "Irakoze Rachel",
            avatar_url: "/images/avatars/rachel.png",
          },
        },
        {
          image_url: "/images/courseCard.png",
          title: "Fluid Mechanics",
          description:
            "Covers fluid statics and dynamics, pressure distributions, and practical system design with flow analysis.",
          price: "90,000frw",
          no_lessons: "12",
          no_hours: "18hrs40min",
          uploader: {
            name: "Ndayambaje Yves",
            avatar_url: "/images/avatars/yves.png",
          },
        },
        {
          image_url: "/images/courseCard.png",
          title: "Fluid Mechanics",
          description:
            "Covers fluid statics and dynamics, pressure distributions, and practical system design with flow analysis.",
          price: "90,000frw",
          no_lessons: "12",
          no_hours: "18hrs40min",
          uploader: {
            name: "Ndayambaje Yves",
            avatar_url: "/images/avatars/yves.png",
          },
        },
        {
          image_url: "/images/courseCard.png",
          title: "Fluid Mechanics",
          description:
            "Covers fluid statics and dynamics, pressure distributions, and practical system design with flow analysis.",
          price: "90,000frw",
          no_lessons: "12",
          no_hours: "18hrs40min",
          uploader: {
            name: "Ndayambaje Yves",
            avatar_url: "/images/avatars/yves.png",
          },
        },
        {
          image_url: "/images/courseCard.png",
          title: "Fluid Mechanics",
          description:
            "Covers fluid statics and dynamics, pressure distributions, and practical system design with flow analysis.",
          price: "90,000frw",
          no_lessons: "12",
          no_hours: "18hrs40min",
          uploader: {
            name: "Ndayambaje Yves",
            avatar_url: "/images/avatars/yves.png",
          },
        },
        {
          image_url: "/images/courseCard.png",
          title: "Fluid Mechanics",
          description:
            "Covers fluid statics and dynamics, pressure distributions, and practical system design with flow analysis.",
          price: "90,000frw",
          no_lessons: "12",
          no_hours: "18hrs40min",
          uploader: {
            name: "Ndayambaje Yves",
            avatar_url: "/images/avatars/yves.png",
          },
        },
        {
          image_url: "/images/courseCard.png",
          title: "Fluid Mechanics",
          description:
            "Covers fluid statics and dynamics, pressure distributions, and practical system design with flow analysis.",
          price: "90,000frw",
          no_lessons: "12",
          no_hours: "18hrs40min",
          uploader: {
            name: "Ndayambaje Yves",
            avatar_url: "/images/avatars/yves.png",
          },
        },
        {
          image_url: "/images/courseCard.png",
          title: "Fluid Mechanics",
          description:
            "Covers fluid statics and dynamics, pressure distributions, and practical system design with flow analysis.",
          price: "90,000frw",
          no_lessons: "12",
          no_hours: "18hrs40min",
          uploader: {
            name: "Ndayambaje Yves",
            avatar_url: "/images/avatars/yves.png",
          },
        },
        {
          image_url: "/images/courseCard.png",
          title: "Fluid Mechanics",
          description:
            "Covers fluid statics and dynamics, pressure distributions, and practical system design with flow analysis.",
          price: "90,000frw",
          no_lessons: "12",
          no_hours: "18hrs40min",
          uploader: {
            name: "Ndayambaje Yves",
            avatar_url: "/images/avatars/yves.png",
          },
        },
        {
          image_url: "/images/courseCard.png",
          title: "Fluid Mechanics",
          description:
            "Covers fluid statics and dynamics, pressure distributions, and practical system design with flow analysis.",
          price: "90,000frw",
          no_lessons: "12",
          no_hours: "18hrs40min",
          uploader: {
            name: "Ndayambaje Yves",
            avatar_url: "/images/avatars/yves.png",
          },
        },
        {
          image_url: "/images/courseCard.png",
          title: "Fluid Mechanics",
          description:
            "Covers fluid statics and dynamics, pressure distributions, and practical system design with flow analysis.",
          price: "90,000frw",
          no_lessons: "12",
          no_hours: "18hrs40min",
          uploader: {
            name: "Ndayambaje Yves",
            avatar_url: "/images/avatars/yves.png",
          },
        },
        {
          image_url: "/images/courseCard.png",
          title: "Fluid Mechanics",
          description:
            "Covers fluid statics and dynamics, pressure distributions, and practical system design with flow analysis.",
          price: "90,000frw",
          no_lessons: "12",
          no_hours: "18hrs40min",
          uploader: {
            name: "Ndayambaje Yves",
            avatar_url: "/images/avatars/yves.png",
          },
        },
        {
          image_url: "/images/courseCard.png",
          title: "Fluid Mechanics",
          description:
            "Covers fluid statics and dynamics, pressure distributions, and practical system design with flow analysis.",
          price: "90,000frw",
          no_lessons: "12",
          no_hours: "18hrs40min",
          uploader: {
            name: "Ndayambaje Yves",
            avatar_url: "/images/avatars/yves.png",
          },
        },
        {
          image_url: "/images/courseCard.png",
          title: "Fluid Mechanics",
          description:
            "Covers fluid statics and dynamics, pressure distributions, and practical system design with flow analysis.",
          price: "90,000frw",
          no_lessons: "12",
          no_hours: "18hrs40min",
          uploader: {
            name: "Ndayambaje Yves",
            avatar_url: "/images/avatars/yves.png",
          },
        },
        {
          image_url: "/images/courseCard.png",
          title: "Fluid Mechanics",
          description:
            "Covers fluid statics and dynamics, pressure distributions, and practical system design with flow analysis.",
          price: "90,000frw",
          no_lessons: "12",
          no_hours: "18hrs40min",
          uploader: {
            name: "Ndayambaje Yves",
            avatar_url: "/images/avatars/yves.png",
          },
        },
        {
          image_url: "/images/courseCard.png",
          title: "Fluid Mechanics",
          description:
            "Covers fluid statics and dynamics, pressure distributions, and practical system design with flow analysis.",
          price: "90,000frw",
          no_lessons: "12",
          no_hours: "18hrs40min",
          uploader: {
            name: "Ndayambaje Yves",
            avatar_url: "/images/avatars/yves.png",
          },
        },
        {
          image_url: "/images/courseCard.png",
          title: "Fluid Mechanics",
          description:
            "Covers fluid statics and dynamics, pressure distributions, and practical system design with flow analysis.",
          price: "90,000frw",
          no_lessons: "12",
          no_hours: "18hrs40min",
          uploader: {
            name: "Ndayambaje Yves",
            avatar_url: "/images/avatars/yves.png",
          },
        },
        // Add more courses here...
      ];
      setCourses(data);
    };

    fetchData();
  }, []);

  return (
    <div className="w-full px-4 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
        {courses.map((item, index) => (
          <div
            key={index}
            className="bg-white w-full rounded-xl shadow-md overflow-hidden relative"
          >
            {/* Expanded description modal */}
            {expandedIndex === index && (
              <div className="fixed inset-0 bg-[#f1f1f1] bg-opacity-10 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative">
                  <button
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                    onClick={() => setExpandedIndex(null)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  
                  <div className="flex flex-col gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{item.uploader.name}</p>
                    </div>
                    
                    <p className="text-gray-600 leading-relaxed">{item.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-2">
                        <BsCameraVideoFill className="text-blue-500" /> {item.no_lessons} lessons
                      </span>
                      <span className="flex items-center gap-2">
                        <GoStopwatch className="text-blue-500" /> {item.no_hours}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <p className="text-lg font-bold text-[#022F40]">{item.price}</p>
                      <button className="px-6 py-2 bg-[#022F40] text-white rounded hover:bg-opacity-90 transition-colors">
                        Start Course
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Card Image */}
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-[150px] object-cover"
            />

            {/* Card Body */}
            <div className="p-4 text-left h-[200px] flex flex-col justify-between">
              <div>
                <h2 className="text-md font-semibold truncate">
                  {item.title}
                </h2>

                {/* Line clamp description */}
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {item.description}
                </p>

                {expandedIndex !== index && (
                  <div className="flex justify-between items-center mt-2">
                    <button
                      className="text-blue-600 text-xs hover:text-blue-800 transition-colors flex items-center gap-1"
                      onClick={() => setExpandedIndex(index)}
                    >
                      <span>Read more</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>   
                    <p className="text-sm font-semibold">{item.uploader.name}</p>
                  </div>
                )}
               



                <div className="mt-3 flex justify-between text-xs text-gray-500">
                <p className=" font-bold text-[#022F40] text-[15px]">
                  {item.price}
                </p>
                  <span className="flex items-center gap-1">
                    <BsCameraVideoFill /> {item.no_lessons} lessons
                  </span>
                  <span className="flex items-center gap-1">
                    <GoStopwatch /> {item.no_hours}
                  </span>
                </div>

               
              </div>

             

              {/* CTA Button */}
              <button className="mt-2 py-2 w-full text-sm h-9 border cursor-pointer border-[#022F40] text-[#022F40] hover:bg-[#fff] shadow shadow-2xl hover:text-[#022F40] rounded transition">
                Start Course
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardCard;
