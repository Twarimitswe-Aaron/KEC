import React, { useEffect, useState } from "react";
import styles from "../../../Styles/styles";
import { FaArrowRight } from "react-icons/fa6";
import Skeleton from '../../../Components/Dashboard/Skeleton';

type DataItem = {
  title: string;
  content: string;
};

const ArrowIcon: React.FC = () => (
  <div className="flex items-center justify-center w-[40px] h-[40px] bg-white rounded-full shadow-lg cursor-pointer ml-3">
    <FaArrowRight className="text-[#022F40] w-6 h-6" />
  </div>
);

const PhoneArrow: React.FC<{
  idx: number;
  currentIndex: number;
  onClick: (i: number) => void;
}> = ({ idx, currentIndex, onClick }) => (
  <div
    onClick={() => onClick(idx)}
    className={`flex items-center justify-center w-[20px] h-[20px] bg-white rounded-full shadow-lg cursor-pointer ml-0 ${
      idx === currentIndex ? "text-[#022F40] font-bold" : "text-[#000]"
    }`}
  >
    <FaArrowRight size={12} />
  </div>
);

const MainPage: React.FC = () => {
  const [index1, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex === 3 ? 0 : prevIndex + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Simulate loading for demonstration
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const data: DataItem[] = [
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
      <div className={`hidden sm:flex ${styles.parent_section}`} id="main">
        <div className={`hidden sm:block ${styles.section}`}>
          <div className="block w-full">
            <div className="block my-10">
              <h1 className="text-[35px] my-6 font-poppins font-bold">
                How we work
              </h1>
              <p className="sm:text-[13px] md:text-[16px] text-sm lg:text-lg">
                Welcome to our platform, offering comprehensive online courses
                in Mechanical Engineering. Here's how our system works to
                provide an exceptional learning experience.
              </p>
            </div>

            <div className="flex w-full">
              <div className="w-[50%]">
                {loading ? (
                  <Skeleton width="w-full" height="h-[370px]" rounded="rounded" />
                ) : (
                  <img
                    src="/images/subHero.png"
                    className="object-cover rounded h-[370px]"
                    alt="Mechanical engineering learning platform"
                  />
                )}
              </div>

              <div className="w-[50%]">
                {loading ? (
                  <>
                    {[...Array(4)].map((_, idx) => (
                      <div key={idx} className="flex gap-4 w-full pb-4">
                        <Skeleton width="w-8" height="h-8" rounded="rounded-full" />
                        <div className="flex-1">
                          <Skeleton width="w-32" />
                          <Skeleton width="w-48" />
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  data.map((item, idx) => (
                    <div
                      key={`${item.title}-${idx}`}
                      className="flex gap-4 w-full pb-4"
                    >
                      <div className="flex justify-center">
                        <ArrowIcon />
                      </div>
                      <div className="text-justify">
                        <h1 className="font-semibold text-2xl text-[#022F40] ">
                          {item.title}
                        </h1>
                        <p className="text-[13px] text-gray-700 lg:text-[16px]">
                          {item.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile view */}
      <div className={`block sm:hidden ${styles.parent_section}`} id="main">
        <div className={`block sm:hidden ${styles.section}`}>
          <div className="block w-full">
            <div className="flex my-3 justify-center">
              <h1 className="text-[20px] font-bold">How we work</h1>
            </div>

            <div className="text-justify text-[11px] font-poppins">
              <p>
                Welcome to our platform, offering comprehensive online courses
                in Mechanical Engineering. Here's how our system works to
                provide an exceptional learning experience.
              </p>

              <div className="flex flex-col md:flex-row mt-5 w-full">
                <div className="md:w-[50%] rounded-md w-full">
                  {loading ? (
                    <Skeleton width="w-full" height="h-[200px]" rounded="rounded" />
                  ) : (
                    <img
                      src="/images/subHero.png"
                      alt="Mechanical engineering learning platform"
                      className="h-[200px] w-full rounded-t-md md:rounded-full  object-cover"
                    />
                  )}
                </div>
                <div className="md:w-[70%] w-full bg-white shadow-[0_4px_4px_rgba(0,0,0,0.5)] rounded-[3px] p-4 h-auto">
                  {loading ? (
                    <>
                      {[...Array(4)].map((_, idx) => (
                        <div key={idx} className="flex gap-4 w-full pb-4">
                          <Skeleton width="w-8" height="h-8" rounded="rounded-full" />
                          <div className="flex-1">
                            <Skeleton width="w-32" />
                            <Skeleton width="w-48" />
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    data.map((item, idx) => (
                      <div
                        key={`${item.title}-${idx}`}
                        className="flex gap-4 w-full pb-4"
                      >
                        <div className="flex justify-center">
                          <ArrowIcon />
                        </div>
                        <div className="text-justify">
                          <h1 className="font-semibold text-2xl text-[#022F40] ">
                            {item.title}
                          </h1>
                          <p className="text-[13px] text-gray-700 lg:text-[16px]">
                            {item.content}
                          </p>
                        </div>
                      </div>
                    ))
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
