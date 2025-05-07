import React from "react";
import styles from "../../Styles/styles";
import { FaArrowRight } from "react-icons/fa6";

const MainPage = () => {
  const ArrowIcon = () => {
    return (
      <div className="flex items-center justify-center w-[40px] h-[40px] bg-white rounded-full shadow-lg cursor-pointer ml-3">
        <FaArrowRight className="text-[#022F40] w-6 h-6" />
      </div>
    );
  };
  const data: { title: string; content: string }[] = [
    {
      title: "Easy to use",
      content:
        "Our platform is designed with simplicity in mind. Whether you're a student or a teacher, our intuitive interface makes it easy to navigate and access the resources you need.",
    },
    {
      title: "Enroll in courses",
      content:
        " Browse our extensive catalog of Mechanical Engineering courses, created by top experts in the field. Preview course content before enrolling to ensure it meets your learning goals",
    },
    {
      title: "Learn online",
      content:
        "Engage with interactive course materials, including videos, quizzes, and assignments. Track your progress and achievements with our built-in progress tracker.",
    },
    {
      title: "Earn certificates",
      content:
        " Automatically generate certificates upon course completion to showcase your new skills and knowledge.",
    },
  ];
  return (
    <>
      <div className={`hidden sm:flex ${styles.parent_section}`}>
        <div className={`hidden sm:block ${styles.section}`}>
          <div className="block w-full">
            <div className="block my-4 ">
              <h1 className="text-[35px] font-poppins font-bold ">
                How we work
              </h1>
              <p className="sm:text-[13px]  lg:text-[16px] ">
                Welcome to our platform, offering comprehensive online courses
                in Mechanical Engineering. Here's how our system works to
                provide an exceptional learning experience.
              </p>
            </div>
            <div className="flex w-full">
              <div className="w-[50%]">
                <img src="/images/subHero.png" className="object-fit h-[440px]" alt="" />
              </div>
              <div className="w-[50%]">
                {data.map((i) => {
                  return (
                    <div className="flex gap-4 w-full pb-4">
                      <div className="flex  justify-center  ">
                        {ArrowIcon()}
                      </div>
                      <div className="align-justify">
                        <h1 className="font-semiBold text-2xl text-[#022F40] font-bold">{i.title}</h1>
                        <p className="text-[13px]  lg:text-[16px]">{i.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainPage;
