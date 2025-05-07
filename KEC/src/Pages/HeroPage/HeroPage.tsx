import React from "react";
import styles from "../../Styles/styles";

const HeroPage = () => {
  return (
    <>
      <div className={`${styles.parent_section}`}>
        <div className={`${styles.section}`}>
          <div className="w-full  ">
            {/* pc based */}
            <div className="hidden lg:flex w-full h-[500px] rounded-xl bg-white shadow-2xl overflow-hidden ">
              <div className="w-[50%] bg-white pt-15  block index-20">
                <h1 className="font-poppins pl-10 text-[2rem] font-bold text-[#022F40]">
                  Explore <br /> Comprehensive course
                  <br /> in Mechanical
                  <br /> Engineering
                </h1>
                <p className="align-justify h-auto pl-10 font-poppins pt-7 w-[100%] text-[1rem] text-[black]">
                  Learn from top experts and gain skills in mechanical
                  Engineering systems. Our courses come with certificates to
                  showcase your new skills, ensuring you stay ahead in your
                  field. Whether you're a beginner or looking to advance your
                  career, our platform offers flexible, accessible learning to
                  meet your needs.
                </p>

                <div className={`flex w-[260px] 1027px:hidden 1067px:hidden`}>
                  <button className={`${styles.dark_btn}  mt-10 ml-10`}>
                    Create Account
                  </button>
                  <button className={`${styles.light_btn} mt-10 ml-5`}>
                    Login
                  </button>
                </div>
              </div>
              <div className="w-[50%] h-[100%] bg-white align-center flex relative">
                <img
                  src="/images/Hero.png"
                  alt=""
                  className="relative inline-block w-[500px] my-auto h-[200px] scale-[122%] ml-10"
                  style={{
                    clipPath:
                      "polygon(100% 0, 100% 50%, 100% 100%, 0% 100%, 25% 50%, 0% 0%)",
                  }}
                />
              </div>
            </div>
            {/* ipad based */}
            <div className="hidden lg:hidden sm:flex  rounded-xl w-full h-[350px] bg-white shadow-2xl overflow-hidden ">
              <div className="w-[50%] bg-white pt-15 h-[100%]  block index-20">
                <h1 className="font-poppins pl-10 text-[1.5rem] font-bold text-[#022F40]">
                  Explore <br /> Comprehensive course
                  <br /> in Mechanical
                  <br /> Engineering
                </h1>
                <p className="align-justify pl-10 font-poppins pt-7 w-[100%] text-[.7rem] text-[black]">
                  Learn from top experts and gain skills in mechanical
                  Engineering systems. Our courses come with certificates to
                  showcase your new skills, ensuring you stay ahead in your
                  field. Whether you're a beginner or looking to advance your
                  career, our platform offers flexible, accessible learning to
                  meet your needs.
                </p>
              </div>
              <div className="w-[50%] h-[auto] bg-white my-auto align-center block relative">
                <div className="block my-auto">
                  <img
                    src="/images/Hero.png"
                    alt="none"
                    className=" inline-block w-[full] "
                    style={{
                      clipPath:
                        "polygon(100% 0, 100% 50%, 100% 100%, 0% 100%, 25% 50%, 0% 0%)",
                    }}
                  />
                  <div className={`flex w-[260px] `}>
                    <button className={`${styles.dark_btn} mt-10 ml-10`}>
                      Create Account
                    </button>
                    <button className={`${styles.light_btn} mt-10 ml-5`}>
                      Login
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* mobile based */}
      <div className="block sm:hidden -mt-5   w-full h-[auto] bg-white shadow-xl rounded-b-xl  overflow-hidden ">
        <div className="w-[100%] h-[auto]  bg-white my-auto align-center block relative">
          <div className="block my-auto">
            <img
              src="/images/Hero.png"
              alt=""
              className="relative inline-block w-[100%]   "
              style={{
                clipPath:
                  "polygon(0 0, 100% 0, 100% 100%, 87% 94%, 71% 100%, 53% 94%, 37% 100%, 19% 94%, 0 100%)",
              }}
            />
            <h1 className="text-white top-1/9 w-[40%] ml-3 font-bold left-0 absolute">
              Explore comprehensive course in Mechanical <span className="text-[#022F40]">Engineering</span>
            </h1>
            <p className="align-justify pl-3 font-poppins pt-7 w-[100%] text-[.7rem] text-[black]">
              Learn from top experts and gain skills in mechanical Engineering
              systems. Our courses come with certificates to showcase your new
              skills, ensuring you stay ahead in your field. Whether you're a
              beginner or looking to advance your career, our platform offers
              flexible, accessible learning to meet your needs.
            </p>
            <div className="flex justify-between mb-4 w-[150px] align-center">
              <button
                className={`justify-center px-1 py-1 text-[11px]  border-none font-Poppins transition-all ease-in-out duration-500 cursor-pointer border-[#022F40] hover:border-[#022F40] font-normal hover:bg-white hover:text-[#022F40]  text-white rounded-[4px] bg-[#022F40] h-auto w-full shadow-md mt-6 ml-3`}
              >
                Create Account
              </button>
              <button
                className={`justify-center px-1 py-1 text-[11px] border-none border-[0.1px] font-Poppins transition-all ease-in-out duration-500 cursor-pointer border-[#022F40] hover:border-[#022F40] font-normal hover:bg-[#022F40] hover:text-[white]  text-[#022F40] rounded-[4px] bg-[white] mt-6 shadow-xl ml-1`}
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
