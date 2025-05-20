import React from "react";

const WhatStudentsSayPage = () => {
  const testimonial = [
    {
      name: "John Doe",
      image: "/images/testimonial.png",
      testimony:
        "Boosted my career with industry-relevant skills! The knowledge and expertise I've gained from these courses have been invaluable in my professional journey. The certifications have also made my resume stand out to potential employers, opening up new opportunities for growth.",
    },
    {
      name: "John Doe",
      image: "/images/testimonial.png",
      testimony:
        "Boosted my career with industry-relevant skills! The knowledge and expertise I've gained from these courses have been invaluable in my professional journey. The certifications have also made my resume stand out to potential employers, opening up new opportunities for growth.",
    },
    {
      name: "John Doe",
      image: "/images/testimonial.png",
      testimony:
        "Boosted my career with industry-relevant skills! The knowledge and expertise I've gained from these courses have been invaluable in my professional journey. The certifications have also made my resume stand out to potential employers, opening up new opportunities for growth.",
    },
    {
      name: "John Doe",
      image: "/images/testimonial.png",
      testimony:
        "Boosted my career with industry-relevant skills! The knowledge and expertise I've gained from these courses have been invaluable in my professional journey. The certifications have also made my resume stand out to potential employers, opening up new opportunities for growth.",
    },
  ];
  return (
    <div className="w-full ">
      <div className="flex w-full justify-center items center">
        <h1 className="font-bold text-[40px] mb-14 mt-5 ">
          What our students say
        </h1>
      </div>
      <div className="flex justify-center items-center gap-4">
        {testimonial.map((i, item) => {
          return (
            <div
              key={item}
              className="p-4 rounded-[40px] w-[300px] gap-5   bg-white shadow-gray-950"
            >
              <div className="block items-center mb-5">
                <div className=" flex justify-start mb-3 items-center text-xl">
                  <img src={i.image} alt="" className="w-12" />
                  <p className="text-[16px] ml-2">{i.name}</p>
                </div>
                <div className="justify-center items-center">
                  <div className="text-justify justify-center align-center w-[100%] ">
                    <p>
                      <span className="text-4xl">"</span>
                      {i.testimony}
                      <span className="text-4xl">"</span>
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
