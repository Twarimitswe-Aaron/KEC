import React from "react";
import { FaStar } from "react-icons/fa";

const WhatStudentsSayPage = () => {
  const testimonial = [
    {
      name: "Alice Smith",
      image: "/images/testimonial.png",
      testimony:
        "The hands-on skills I gained gave me an edge in job interviews and helped me secure a better role.",
    },
    {
      name: "Brian Lee",
      image: "/images/testimonial.png",
      testimony:
        "These practical courses improved my resume and confidence, leading to more job offers and growth.",
    },
    {
      name: "Clara Jones",
      image: "/images/testimonial.png",
      testimony:
        "I learned real-world skills that employers value. The certifications helped me stand out quickly.",
    },
    {
      name: "David Kim",
      image: "/images/testimonial.png",
      testimony:
        "Thanks to these courses, I gained key skills, earned certifications, and landed new career options.",
    },
    {
      name: "Clara Jones",
      image: "/images/testimonial.png",
      testimony:
        "I learned real-world skills that employers value. The certifications helped me stand out quickly.",
    },
    {
      name: "David Kim",
      image: "/images/testimonial.png",
      testimony:
        "Thanks to these courses, I gained key skills, earned certifications, and landed new career options.",
    },
  ];

  return (
    <div className="w-[94%] mx-auto max-w-[1440px] py-12" id="tudentsSays">
      {/* Header */}
      <div className="mb-16 flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <div className="bg-[#151619] rounded-[25px] px-5 py-2 flex items-center gap-1.5 shadow-sm">
            <span className="text-[#FF4726] font-medium font-mono">//</span>
            <span className="text-white font-medium tracking-wide text-sm">Testimonials</span>
            <span className="text-[#FF4726] font-medium font-mono">//</span>
          </div>
        </div>
        <h2 className="text-5xl md:text-6xl font-bold text-[#151619] tracking-tight leading-tight">
          What our students say.
        </h2>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {testimonial.map((item, idx) => (
          <div key={idx} className="bg-[#e5e5e5] rounded-[20px] p-[7px]">
            <div className="bg-[#f0f0f0]  rounded-[16px] p-6 h-full flex flex-col justify-between shadow-[0px_0.602187px_0.602187px_-0.916667px_rgba(0,0,0,0.08),0px_2.28853px_2.28853px_-1.83333px_rgba(0,0,0,0.08),0px_10px_10px_-2.75px_rgba(0,0,0,0.07)] hover:shadow-xl transition-all duration-300">
              {/* Top Section */}
              <div className="">
                {/* Rating */}
                <div className="flex items-center gap-1.5 mb-6">
                  <span className="font-bold text-[#151619] text-sm">5.0</span>
                  <FaStar className="text-[#FF3700] text-xs" />
                  <span className="text-[#151619] text-sm font-medium">Rating</span>
                </div>

                {/* Quote */}
                <h3 className="font-sans font-semibold text-[1.2rem] leading-[1.2em] tracking-[-0.05em] text-[#151619] text-left mb-8">
                  "{item.testimony}"
                </h3>
              </div>

              {/* Info Section */}
              <div className="flex items-center gap-[10px] mt-auto">
                <div className="relative w-12 h-12 rounded-[20px] overflow-hidden bg-gray-200 shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col items-start justify-center">
                  <h6 className="font-sans font-semibold text-[#151619] text-base leading-tight m-0">
                    {item.name}
                  </h6>
                  <p className="font-sans text-[#4F4F4F] text-sm font-normal m-0 mt-0.5">
                    Student
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhatStudentsSayPage;
