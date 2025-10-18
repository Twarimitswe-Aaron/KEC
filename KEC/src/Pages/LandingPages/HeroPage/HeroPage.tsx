import React, { useState, useEffect } from "react";
import styles from "../../../Styles/styles";
import { Link } from "react-router-dom";

const HeroPage = () => {
  const fullText =
    "Explore comprehensive <br/> course in Mechanical <br/> Engineering";
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setText(fullText.slice(0, index));
      setIndex(index + 1);
    }, 60);
    return () => clearInterval(interval);
  }, [index]);

  return (
    <>
      <div className={`${styles.parent_section}`} id="hero">
        <div className={`${styles.section}`}>
          <div className="w-full ">
            {/* pc based */}
            <div className="hidden mt-25 lg:flex w-full h-[500px] rounded-xl bg-white shadow-[0_4px_4px_rgba(0,0,0,0.5)] overflow-hidden ">
              <div className="w-[50%] bg-white pt-15  block index-20">
                <h1
                  className="font-roboto pl-10 text-[2rem] font-bold text-[#022F40]"
                  dangerouslySetInnerHTML={{
                    __html: text + '<span class="animate-pulse">|</span>',
                  }}
                />
                <p className="align-justify h-auto pl-10 font-roboto pt-7 w-[100%] text-[1rem] text-[black]">
                  Learn from top experts and gain skills in mechanical
                  Engineering systems. Our courses come with certificates to
                  showcase your new skills, ensuring you stay ahead in your
                  field. Whether you're a beginner or looking to advance your
                  career, our platform offers flexible, accessible learning to
                  meet your needs.
                </p>

                <div className={`flex w-[260px] 1027px:hidden 1067px:hidden`}>
                  <Link to="/SignUp">
                    <button
                      className={`cursor-pointer justify-center px-2 py-2 text-[16px] border-solid border-[1px] font-Poppins transition-all ease-in-out duration-500 font-normal hover:bg-white shadow-[0px_4px_4px_#00000040] hover:text-[#022F40] border-white  text-white rounded-md bg-[#022F40] h-auto  mt-10 ml-10`}
                    >
                      Create Account
                    </button>
                  </Link>
                  <Link to="/login">
                    <button
                      className={` justify-center px-2 py-2 border-1 text-[16px]  font-Poppins transition-all ease-in-out duration-500 cursor-pointer border-[#022F40] hover:border-[#022F40] font-normal hover:bg-[#022F40] hover:text-[white]  text-[#022F40] rounded-md bg-[white] mt-10 ml-5`}
                    >
                      Login
                    </button>
                  </Link>
                </div>
              </div>
              <div className="w-[50%] h-[100%] bg-white align-center flex relative">
                <img
                  src="/images/Hero.png"
                  alt=""
                  className=" inline-block w-[90%] my-[20%] h-[50%] scale-[112%] right-0 items-center  absolute"
                  style={{
                    clipPath:
                      "polygon(100% 0, 100% 50%, 100% 100%, 0% 100%, 25% 50%, 0% 0%)",
                    objectFit: "cover",
                  }}
                />
              </div>
            </div>
            {/* ipad based */}
            <div className="hidden lg:hidden sm:flex mt-25 rounded-xl w-full h-[350px] bg-white shadow-[0_4px_4px_rgba(0,0,0,0.5)] overflow-hidden ">
              <div className="w-[50%] bg-white pt-15 h-[100%]  block index-20">
                <h1 className="font-roboto pl-10 text-[1.5rem] font-bold text-[#022F40]">
                  Explore <br /> Comprehensive course
                  <br /> in Mechanical
                  <br /> Engineering
                </h1>
                <p className="align-justify pl-10 font-roboto pt-7 w-[100%] text-[.7rem] text-[black]">
                  Learn from top experts and gain skills in mechanical
                  Engineering systems. Our courses come with certificates to
                  showcase your new skills, ensuring you stay ahead in your
                  field. Whether you're a beginner or looking to advance your
                  career, our platform offers flexible, accessible learning to
                  meet your needs.
                </p>
              </div>
              <div className="w-[50%]  bg-white align-center  relative">
                <div className="block h-[45%] relative">
                  <img
                    src="/images/Hero.png"
                    alt=""
                    className=" inline-block w-[90%] my-[15%] h-[100%] scale-[112%] right-0 items-center  absolute"
                    style={{
                      clipPath:
                        "polygon(100% 0, 100% 50%, 100% 100%, 0% 100%, 25% 50%, 0% 0%)",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <div
                  className={`flex w-[505]   h-[30%] absolute -bottom-3 right-3`}
                >
                  <div className="flex gap-4 h-[35px] w-[full]">
                    <button className={`${styles.dark_btn} `}>
                      Create Account
                    </button>
                    <button className={`${styles.light_btn} `}>Login</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* mobile based */}
      <div className="block sm:hidden -mt-5   w-full h-[auto] bg-white shadow-[0_4px_4px_rgba(0,0,0,0.5)] rounded-b-xl  overflow-hidden ">
        <div className="w-[100%] h-[auto]  bg-white my-auto align-center block relative">
          <div className="block my-auto">
            <img
              src="/images/Hero.png"
              alt=""
              className="relative inline-block w-[100%] object-cover  "
              style={{
                clipPath:
                  "polygon(0 0, 100% 0, 100% 100%, 87% 94%, 71% 100%, 53% 94%, 37% 100%, 19% 94%, 0 100%)",
              }}
            />
            <h1 className="text-white top-1/9 w-[40%] ml-3 font-bold left-0 absolute">
              Explore comprehensive course in Mechanical{" "}
              <span className="text-[#022F40]">Engineering</span>
            </h1>
            <p className="align-justify pl-3 font-roboto pt-7 w-[100%] text-[.7rem] text-[black]">
              Learn from top experts and gain skills in mechanical Engineering
              systems. Our courses come with certificates to showcase your new
              skills, ensuring you stay ahead in your field. Whether you're a
              beginner or looking to advance your career, our platform offers
              flexible, accessible learning to meet your needs.
            </p>
            <div className="flex justify-between mb-4 w-[150px] align-center">
              <button
                className={`justify-center px-1 py-1 text-[11px]  border-none font-roboto transition-all ease-in-out duration-500 cursor-pointer border-[#022F40] hover:border-[#022F40] font-normal hover:bg-white hover:text-[#022F40]  text-white rounded-[4px] bg-[#022F40] h-auto w-full shadow-md mt-6 ml-3`}
              >
                Create Account
              </button>
              <button
                className={`justify-center px-1 py-1 text-[11px] border-none border-[0.1px] font-roboto transition-all ease-in-out duration-500 cursor-pointer border-[#022F40] hover:border-[#022F40] font-normal hover:bg-[#022F40] hover:text-[white]  text-[#022F40] rounded-[4px] bg-[white] mt-6 shadow-xl ml-1`}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroPage;
