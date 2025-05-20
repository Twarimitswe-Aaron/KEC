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
    <section className="w-full  py-7 px-5">
      <ul className="space-y-4 bg-white rounded-xl w-full p-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            {/* Only show bullet for items after the first one */}
            {index >= 0 && (
              <div className="w-2 h-2 mt-2 mr-4 bg-black rounded-[5px] flex-shrink-0" />
            )}
            <p className={` font-normal text-black font-Poppins text-[17px]`}>
              {feature}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default WhyUsPage;
