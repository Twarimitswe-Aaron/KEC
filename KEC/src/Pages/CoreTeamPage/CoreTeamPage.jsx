import React,{useEffect} from "react";
import {useKeenSlider} from 'keen-slider/react';
import "keen-slider/keen-slider.min.css";



const CoreTeamPage = () => {

  const [sliderRef, instanceRef]=useKeenSlider({
    loop:true,
    mode:"snap",
    renderMode:"perfomance",
    slides:{
      origin:"auto",
      spacing:15,
      perView:"auto"
    },
  });

  useEffect(()=>{
    const interval=setInterval(()=>{
      instanceRef.current?.next();
    },5000)
    return ()=>clearInterval(interval);
  },[instanceRef]);
  
  const teamMembers = [
    {
      id: 1,
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
      id: 4,
      name: "MAHORO Samson",
      role: "Machine Designer",
      image: "/images/teacher.png",
    },
  ];
  return (
    <div className="w-full ">
      <h2 className="text-5xl font-bold w-full sticky  text-black [font-family:'Inria_Serif',Helvetica] text-center mb-8">
        Core team
      </h2>

      <div className=" keen-slider flex justify-start w-full gap-20 overflow-hidden">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className="keen-slider_slide min-w-[223px] items-center block justify-start h-[277px]"
          >
            <img
              className="w-[219px] h-[210px] object-cover shadow-8lg rounded-full circle"
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
