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
            {/* Expanded description above card */}
            {expandedIndex === index && (
              <div className="absolute -top-[120px] left-0 right-0 z-10 bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-gray-700 leading-relaxed">{item.description}</p>
                  <button
                    className="text-blue-600 text-xs self-end hover:text-blue-800 transition-colors"
                    onClick={() => setExpandedIndex(null)}
                  >
                    Show less
                  </button>
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
                  <div className="flex justify-between items-center mt-1">
                    <button
                      className="text-blue-600 text-xs hover:text-blue-800 transition-colors"
                      onClick={() => setExpandedIndex(index)}
                    >
                      Read more
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
              <button className="mt-4 py-2 w-full text-sm h-9 border cursor-pointer border-[#022F40] text-[#022F40] hover:bg-[#022F40] hover:text-white rounded transition">
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
