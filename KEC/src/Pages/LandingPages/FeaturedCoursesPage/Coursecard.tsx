import React, { useEffect, useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { ArrowLeft, ArrowRight, Check, Star, Video, Clock, User } from "lucide-react";

const CourseCarousel = () => {
  const [sliderRef, instanceRef] = useKeenSlider({
    loop: true,
    mode: "snap",
    renderMode: "performance",
    slides: {
      origin: "auto",
      spacing: 15,
      perView: "auto",
    },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      instanceRef.current?.next();
    }, 5000);
    return () => clearInterval(interval);
  }, [instanceRef]);

  const cardData = [
    {
      image_url: "/images/courseCard.png",
      title: "Advanced Thermodynamics",
      price: "100,000frw",
      no_lessons: "10",
      no_hours: "11hrs 22min",
      uploaded: "Mahoro Rachel",
      rate: 4,
    },
    {
      image_url: "/images/courseCard.png",
      title: "Quantum Physics",
      price: "150,000frw",
      no_lessons: "12",
      no_hours: "13hrs 00min",
      uploaded: "John Doe",
      rate: 5,
    },
    {
      image_url: "/images/courseCard.png",
      title: "Fluid Mechanics",
      price: "90,000frw",
      no_lessons: "8",
      no_hours: "9hrs 15min",
      uploaded: "Alice Smith",
      rate: 3,
    },
    {
      image_url: "/images/courseCard.png",
      title: "Engineering Math",
      price: "110,000frw",
      no_lessons: "9",
      no_hours: "10hrs 45min",
      uploaded: "Chris Martin",
      rate: 4,
    },
    {
      image_url: "/images/courseCard.png",
      title: "Robotics",
      price: "200,000frw",
      no_lessons: "15",
      no_hours: "17hrs 50min",
      uploaded: "Anna Lee",
      rate: 5,
    },
  ];

  return (
    <div className="relative w-full px-4 pb-8 pt-3 overflow-hidden font-roboto">
      {/* Left Arrow */}
      <button
        className="absolute top-1/2 -translate-y-1/2 left-4 z-10 bg-white overflow-hidden rounded-full shadow p-3 hover:scale-110 transition-transform"
        onClick={() => instanceRef.current?.prev()}
      >
        <ArrowLeft size={20} className="text-gray-800" />
      </button>

      {/* Right Arrow */}
      <button
        className="absolute top-1/2 -translate-y-1/2 right-4 z-10 bg-white rounded-full shadow p-3 hover:scale-110 transition-transform"
        onClick={() => instanceRef.current?.next()}
      >
        <ArrowRight size={20} className="text-gray-800" />
      </button>

      {/* Slider */}
      <div ref={sliderRef} className="keen-slider py-4">
        {cardData.map((item, index) => {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const [toggle, setToggle] = useState(false);

          return (
            <div
              className="keen-slider__slide !w-[350px] flex-shrink-0"
              key={index}
            >
              {/* Outer "Border" Container */}
              <div className="bg-[#e5e5e5] rounded-[24px] p-[5px] h-full transition-transform hover:scale-[1.01] duration-300">
                {/* Inner Card */}
                <div className="bg-[#f0f0f0] rounded-[20px] p-6 h-full flex flex-col justify-between shadow-[0px_0.6px_0.6px_-0.9px_rgba(0,0,0,0.08),0px_2.3px_2.3px_-1.8px_rgba(0,0,0,0.08),0px_10px_10px_-2.75px_rgba(0,0,0,0.07)]">
                  
                  {/* Header Section */}
                  <div className="flex flex-col gap-4 mb-6">
                    {/* Icon & Badge Row */}
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-12 rounded-[14px] bg-[#151619] flex items-center justify-center overflow-hidden">
                        {/* Using image as icon/thumbnail */}
                         <img src={item.image_url} alt="icon" className="w-full h-full object-cover opacity-80" />
                      </div>
                      <div className="bg-[#e5e5e5] px-3 py-1.5 rounded-full">
                        <span className="text-xs font-bold text-[#151619]">{item.price}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="text-xl font-bold text-[#151619] leading-tight mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-500 font-medium">Master the content</p>
                    </div>
                  </div>

                  {/* Toggle Section (Mock) */}
                  <div className="bg-[#e5e5e5]/50 rounded-xl p-3 flex items-center justify-between mb-6">
                    <span className="text-sm font-semibold text-[#151619]">Include Certificate</span>
                    <button 
                      onClick={() => setToggle(!toggle)}
                      className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 relative ${toggle ? 'bg-[#151619]' : 'bg-gray-300'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${toggle ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* List Section */}
                  <div className="flex flex-col gap-3 mb-8">
                    {/* Item 1 */}
                    <div className="flex items-center gap-3">
                      <Video size={18} className="text-[#4f4f4f]" />
                      <span className="text-sm font-medium text-[#4f4f4f]">{item.no_lessons} Comprehensive Lessons</span>
                    </div>
                    {/* Item 2 */}
                    <div className="flex items-center gap-3">
                      <Clock size={18} className="text-[#4f4f4f]" />
                      <span className="text-sm font-medium text-[#4f4f4f]">{item.no_hours} Content</span>
                    </div>
                    {/* Item 3 */}
                    <div className="flex items-center gap-3">
                      <Star size={18} className="text-[#4f4f4f]" />
                      <span className="text-sm font-medium text-[#4f4f4f]">Rated {item.rate}.0/5.0 Stars</span>
                    </div>
                    {/* Item 4 */}
                    <div className="flex items-center gap-3">
                      <User size={18} className="text-[#4f4f4f]" />
                      <span className="text-sm font-medium text-[#4f4f4f]">By {item.uploaded}</span>
                    </div>
                  </div>

                  {/* Footer Button */}
                  <div className="mt-auto">
                    <button className="w-full py-3 rounded-full bg-[#151619] text-white font-bold text-base shadow-[0px_4px_10px_rgba(0,0,0,0.15)] hover:bg-[#2a2b2e] hover:shadow-[0px_6px_15px_rgba(0,0,0,0.2)] transition-all duration-300 transform active:scale-[0.98]">
                      Start Course
                    </button>
                  </div>

                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CourseCarousel;
