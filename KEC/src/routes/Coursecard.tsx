import React, { useEffect } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { FaArrowLeft, FaArrowRight, FaStar } from "react-icons/fa6";
import styles from "../Styles/styles";
import { GoStopwatch } from "react-icons/go";
import { BsCameraVideoFill } from "react-icons/bs";

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
      no_hours: "11hrs22min",
      uploaded: "Mahoro Rachel",
      rate: 4,
    },
    {
      image_url: "/images/courseCard.png",
      title: "Quantum Physics",
      price: "150,000frw",
      no_lessons: "12",
      no_hours: "13hrs00min",
      uploaded: "John Doe",
      rate: 5,
    },
    {
      image_url: "/images/courseCard.png",
      title: "Fluid Mechanics",
      price: "90,000frw",
      no_lessons: "8",
      no_hours: "9hrs15min",
      uploaded: "Alice Smith",
      rate: 3,
    },
    {
      image_url: "/images/courseCard.png",
      title: "Engineering Math",
      price: "110,000frw",
      no_lessons: "9",
      no_hours: "10hrs45min",
      uploaded: "Chris Martin",
      rate: 4,
    },
    {
      image_url: "/images/courseCard.png",
      title: "Robotics",
      price: "200,000frw",
      no_lessons: "15",
      no_hours: "17hrs50min",
      uploaded: "Anna Lee",
      rate: 5,
    },
  ];

  return (
    <div className="relative w-full px-4 pb-8 pt-3 overflow-hidden font-roboto">
      {/* Left Arrow */}
      <button
        className="absolute top-1/2 -translate-y-1/2 left-4 z-10 bg-white overflow-hidden rounded-full shadow p-2"
        onClick={() => instanceRef.current?.prev()}
      >
        <FaArrowLeft size={14} />
      </button>

      {/* Right Arrow */}
      <button
        className="absolute top-1/2 -translate-y-1/2 right-4 z-10 bg-white rounded-full shadow p-2"
        onClick={() => instanceRef.current?.next()}
      >
        <FaArrowRight size={14} />
      </button>

      {/* Slider */}
      <div ref={sliderRef} className="keen-slider">
        {cardData.map((item, index) => (
          <div
            className="keen-slider__slide !w-[280px] flex-shrink-0"
            key={index}
          >
            <div
              className="bg-white overflow-hidden shadow-[0_4px_4px_rgba(0,0,0,0.5)] mb-4 mr-4 rounded-2xl p-2 h-[490px] w-full"
            >
              <div className="h-[50%]">
                <img
                  src={item.image_url}
                  alt="Course"
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
              <div className="h-[50%] text-[18px]">
                <h1 className="my-3 text-[16px] font-medium">{item.title}</h1>
                <div className="flex items-center text-sm">
                  <p className="text-gray-500">Rating {item.rate}</p>
                  <div className="flex ml-4">
                    {Array.from({ length: item.rate }).map((_, idx) => (
                      <FaStar color="gold" key={idx} />
                    ))}
                    {Array.from({ length: 5 - item.rate }).map((_, idx) => (
                      <FaStar key={idx} />
                    ))}
                  </div>
                </div>
                <p className="my-2 text-sm">
                  Price <span className="pl-6">{item.price}</span>
                </p>
                <hr className="my-3" />
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <BsCameraVideoFill color="gray" />
                    {item.no_lessons} lessons
                  </span>
                  <span className="flex items-center gap-2">
                    <GoStopwatch color="gray" />
                    {item.no_hours}
                  </span>
                </div>
                <div className="flex mt-2 items-center w-full">
                  <img
                    src={item.image_url}
                    alt=""
                    className="w-[30px] h-[30px] rounded-full"
                  />
                  <div className="ml-2">
                    <p className="text-sm normal-case">
                      <span className="text-xs block">Uploaded by</span>
                      <span className="text-base">{item.uploaded}</span>
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex justify-center">
                  <button className={styles.light_btn}>Start Course</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseCarousel;
