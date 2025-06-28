import React, { useEffect } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

const CoreTeamPage = () => {
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

  const teamMembers = [
    {
      id: 1,
      name: "MAHORO Samson",
      role: "Machine Designer",
      image: "/images/teacher.png",
    },
    {
      id: 4,
      name: "MAHORO Samson",
      role: "Machine Designer",
      image: "/images/teacher.png",
    },
    {
      id: 10,
      name: "MAHORO Samson",
      role: "Machine Designer",
      image: "/images/teacher.png",
    },
    {
      id: 2,
      name: "MAHORO Samson",
      role: "Machine Designer",
      image: "/images/teacher.png",
    },
    {
      id: 3,
      name: "MAHORO Samson",
      role: "Machine Designer",
      image: "/images/teacher.png",
    },
    {
      id: 6,
      name: "MAHORO Samson",
      role: "Machine Designer",
      image: "/images/teacher.png",
    },
  ];
  return (
    <div className="w-full " id="coreTeam">
      <div className="flex w-full justify-center mt-10 items center">
        <h1 className="font-bold sm:text-3xl text-[22px]  sm:mb-14  sm:mt-5 ">
          Core Team
        </h1>
      </div>

      <div
        ref={sliderRef}
        className=" keen-slider justify-evenly text-center items-center"
      >
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className="keen-slider__slide !w-[280px] shadow-[0_4px_4px_rgba(0,0,0,0.5)] p-7 rounded-md my-5 flex-shrink-0 justify-center items-center"
          >
            <img
              className="w-[219px] h-[210px] object-cover shadow-8lg mx-auto shadow-[0_4px_4px_rgba(0,0,0,0.5)]  rounded-full circle"
              alt="now"
              src={member.image}
            />
            <div className="justify-center text-center items-center">
              <h3 className="mt-2 [font-family:'Inter',Helvetica] font-bold text-black text-2xl">
                {member.name}
              </h3>
              <p className="mt-2 [font-family:'Inter',Helvetica] font-normal text-black text-[13px]">
                {member.role}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoreTeamPage;
