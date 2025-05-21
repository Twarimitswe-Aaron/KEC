import React from "react";

const WhyUsPage = () => {
  const features = [
    "Expert Instructors: Learn from industry professionals with real-world experience.",
    "Flexible Learning: Study at your own pace, on your schedule.",
    "Interactive Courses: Engage with hands-on projects and real-world case studies.",
    "Recognized Certifications: Earn valuable certificates to boost your career.",
    "Career Growth: Gain the skills needed to excel and advance in your career.",
  ];

  return (
  <>
    <div className="flex w-full justify-center items center">
        <h1 className="font-bold sm:text-3xl text-[22px] mb-6 sm:mb-14  sm:mt-5 ">
          Why us
        </h1>
      </div>
    <section className="w-full py-0 px-0 bg-white rounded-xl">
      
      <ul className="space-y-4 w-full p-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            
            <div className="sm:w-2 w-1 h-1 sm:h-2 mt-2 mr-4 bg-black rounded-[5px] flex-shrink-0" />
            <p className="font-normal text-black font-Poppins sm:text-[13px] md:text-[16px] text-sm lg:text-lg">
              {feature}
            </p>
          </li>
        ))}
      </ul>
    </section></>
  );
};

export default WhyUsPage;
