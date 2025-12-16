import React, { useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { ArrowLeft, ArrowRight, Check, Star, Video, Clock, User, Eye, DollarSign } from "lucide-react";
import CourseDetailsModal from "./CourseDetailsModal";
import { AnimatedTextButton } from "../../../Components/Common/AnimatedTextButton";

const CourseCarousel = () => {
  const animation = { duration: 80000, easing: (t: number) => t };
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  const [sliderRef, instanceRef] = useKeenSlider({
    loop: true,
    renderMode: "performance",
    drag: true,
    mode: "free",
    slides: {
      origin: "auto",
      spacing: 20,
      perView: "auto",
    },
    created(s) {
      s.moveToIdx(5, true, animation);
    },
    updated(s) {
      s.moveToIdx(s.track.details.abs + 5, true, animation);
    },
    animationEnded(s) {
      s.moveToIdx(s.track.details.abs + 5, true, animation);
    },
  });

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
    <div className="relative w-full pb-8 pt-3 overflow-hidden font-roboto">
      <CourseDetailsModal
        isOpen={!!selectedCourse}
        onClose={() => setSelectedCourse(null)}
        course={selectedCourse}
      />

      {/* Slider */}
      <div ref={sliderRef} className="keen-slider py-4">
        {cardData.map((item, index) => {
          return (
            <div
              className="keen-slider__slide !w-[350px] flex-shrink-0"
              key={index}
            >
              {/* Outer "Border" Container */}
              <div className="bg-[#e5e5e5] rounded-[24px] p-[5px] h-full transition-transform hover:scale-[1.01] duration-300">
                {/* Inner Card */}
                <div className="bg-[#f0f0f0] rounded-[20px] h-full flex flex-col shadow-[0px_0.6px_0.6px_-0.9px_rgba(0,0,0,0.08),0px_2.3px_2.3px_-1.8px_rgba(0,0,0,0.08),0px_10px_10px_-2.75px_rgba(0,0,0,0.07)] overflow-hidden">

                  {/* Top Half: Image */}
                  <div className="h-[45%] w-full relative">
                    <img src={item.image_url} alt="course" className="w-full h-full object-cover" />
                    {/* Overlay: Eye Icon (View Details) */}
                    <button
                      onClick={() => setSelectedCourse(item)}
                      className="absolute top-4 right-4 bg-white/90 hover:bg-white backdrop-blur-sm p-3 rounded-full transition-colors cursor-pointer shadow-sm group"
                    >
                      <Eye size={20} className="text-[#151619] group-hover:scale-110 transition-transform" />
                    </button>
                  </div>

                  {/* Bottom Half: Content */}
                  <div className="p-6 flex flex-col justify-between flex-1">

                    {/* Title & Desc */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-[#151619] leading-tight mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-500 font-medium">Master the content with our expert instructors.</p>
                    </div>

                    {/* List Section (Minus Duration/Toggle) */}
                    <div className="flex flex-col gap-3 mb-6">
                      {/* Price (Swapped with Rated) */}
                      <div className="flex items-center gap-3">
                        <DollarSign size={18} className="text-[#4f4f4f]" />
                        <span className="text-sm font-medium text-[#4f4f4f]">Price: {item.price}</span>
                      </div>
                      {/* Lessons */}
                      <div className="flex items-center gap-3">
                        <Video size={18} className="text-[#4f4f4f]" />
                        <span className="text-sm font-medium text-[#4f4f4f]">{item.no_lessons} Comprehensive Lessons</span>
                      </div>
                      {/* Instructor */}
                      <div className="flex items-center gap-3">
                        <User size={18} className="text-[#4f4f4f]" />
                        <span className="text-sm font-medium text-[#4f4f4f]">By {item.uploaded}</span>
                      </div>
                    </div>

                    {/* Footer Button (Animated) */}
                    <div className="mt-auto">
                      <AnimatedTextButton
                        text="Start Course"
                        variant="secondary"
                        className="w-full !justify-center hover:bg-[#2a2b2e] transition-colors"
                      />
                    </div>

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
