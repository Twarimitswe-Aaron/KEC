import React, { useEffect } from "react";
import { RiDoubleQuotesL, RiDoubleQuotesR } from "react-icons/ri";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

const WhatStudentsSayPage = () => {
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
  ];

  return (
    <div className="w-full mb-10 " id="tudentsSays">
      <div className="flex w-full justify-center items center">
        <h1 className="font-bold sm:text-3xl text-[22px] mb-6 sm:mb-14  sm:mt-5 ">
          What our students say
        </h1>
      </div>
      <div ref={sliderRef} className="keen-slider">
        {testimonial.map((i, item) => {
          return (
            <div
              key={item}
              className="p-4 keen-slide keen-slider__slide rounded-[40px] !w-[300px] gap-5 flex-shrink-0   bg-white shadow-[0_4px_4px_rgba(0,0,0,0.5)] mb-4"
            >
              <div className="block items-center mb-5">
                <div className=" flex justify-start mb-3 items-center text-xl">
                  <img src={i.image} alt="" className="w-12" />
                  <p className="text-[16px] ml-2">{i.name}</p>
                </div>
                <div className="justify-center items-center">
                  <div className="text-justify justify-center align-center w-[100%] ">
                    <p className="flex items-start gap-1 text-justify relative">
                      <span className=" text-xl text-gray-500">
                        <RiDoubleQuotesL />
                      </span>
                      <span className="flex-1 sm:text-[13px] md:text-[16px] text-sm  lg:text-lg">{i.testimony}</span>
                      <span className=" right-0 bottom-0 absolute text-xl text-gray-500">
                        <RiDoubleQuotesR />
                      </span>
                    </p>
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

export default WhatStudentsSayPage;
