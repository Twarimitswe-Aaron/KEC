import React, { useEffect, useState } from "react";
import styles from "../../Styles/styles";
import { FaArrowRight } from "react-icons/fa6";

const MainPage = () => {
  const [index1, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex === 3 ? 0 : prevIndex + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const ArrowIcon = () => {
    return (
      <div className="flex items-center justify-center w-[40px] h-[40px] bg-white rounded-full shadow-lg cursor-pointer ml-3">
        <FaArrowRight className="text-[#022F40] w-6 h-6" />
      </div>
    );
  };

  const PhoneArrow = (idx: number) => {
    return (
      <div
        onClick={() => setIndex(idx)}
        className={`flex items-center justify-center w-[20px] h-[20px] bg-white rounded-full shadow-lg cursor-pointer ml-0 ${
          idx === index1 ? "text-[#022F40] font-bold" : "text-[#000]"
        }`}
      >
        <FaArrowRight size={12} />
      </div>
    );
  };

  const data: { title: string; content: string }[] = [
    {
      title: "Easy to use",
      content:
        "Our platform is simple and intuitive, helping all users quickly access tools and resources.",
    },
    {
      title: "Earn certificates",
      content:
        "Receive a certificate automatically when finishing a course to prove your skills and accomplishments.",
    },
    {
      title: "Enroll in courses",
      content:
        "Browse top Mechanical Engineering courses and enroll easily after previewing the course content offered.",
    },
    {
      title: "Learn online",
      content:
        "Watch engaging videos, complete quizzes and assignments, and monitor your learning progress throughout courses.",
    },
  ];

  return (
    <>
      {/* Desktop view */}
      <div className={`hidden sm:flex ${styles.parent_section}`}>
        <div className={`hidden sm:block ${styles.section}`}>
          <div className="block w-full">
            <div className="block my-4">
              <h1 className="text-[35px] font-poppins font-bold">How we work</h1>
              <p className="sm:text-[13px] md:text-[16px] text-sm lg:text-lg">
                Welcome to our platform, offering comprehensive online courses in
                Mechanical Engineering. Here's how our system works to provide an
                exceptional learning experience.
              </p>
            </div>

            <div className="flex w-full">
              <div className="w-[50%]">
                <img
                  src="/images/subHero.png"
                  className="object-cover rounded h-[440px]"
                  alt="Mechanical engineering learning platform"
                />
              </div>

              <div className="w-[50%]">
                {data.map((item) => (
                  <div key={item.title} className="flex gap-4 w-full pb-4">
                    <div className="flex justify-center">
                      <ArrowIcon />
                    </div>
                    <div className="text-justify">
                      <h1 className="font-semibold text-2xl text-[#022F40] font-bold">
                        {item.title}
                      </h1>
                      <p className="text-[13px] text-gray-700 lg:text-[16px]">{item.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile view */}
      <div className={`block sm:hidden ${styles.parent_section}`}>
        <div className={`block sm:hidden ${styles.section}`}>
          <div className="block w-full">
            <div className="flex my-3 justify-center">
              <h1 className="text-[20px] font-bold">How we work</h1>
            </div>

            <div className="text-justify text-[11px] font-poppins">
              <p>
                Welcome to our platform, offering comprehensive online courses in
                Mechanical Engineering. Here's how our system works to provide an
                exceptional learning experience.
              </p>

              <img
                src="/images/subHero.png"
                alt="Mechanical engineering learning platform"
                className="h-[200px] w-full pt-2 object-cover"
              />

              <div className="flex mt-5 w-full">
                <div className="w-[50%]">
                  {data.map((item, idx) => (
                    <div
                      key={item.title}
                      className={`flex items-center gap-4 w-full pb-4 cursor-pointer ${
                        idx === index1 ? "font-bold text-[#022f40]" : ""
                      }`}
                      onClick={() => setIndex(idx)}
                    >
                      <div>{PhoneArrow(idx)}</div>
                      <div>
                        <h1
                          className={`text-[14px] text-[#000] font-medium ${
                            idx === index1 ? "font-bold text-[#022f40]" : ""
                          }`}
                        >
                          {item.title}
                        </h1>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="w-[70%] bg-white shadow-lg rounded-[3px] p-4 h-auto">
                  {data.map((item, idx) =>
                    idx === index1 ? (
                      <div key={item.title} className="mx-auto w-[90%]">
                        <h3 className="text-sm font-bold text-[#022f40]">{item.title}</h3>
                        <p className="text-[13px] font-poppins my-1 text-gray-700">{item.content}</p>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainPage;
