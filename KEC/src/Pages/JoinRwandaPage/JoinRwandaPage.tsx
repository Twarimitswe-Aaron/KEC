import React from "react";
import styles from "../../Styles/styles";

const JoinRwandaPage = () => {
  return (
    <div className="">
      {/* Desktop view */}
      <div className="w-full sm:flex hidden bg-white rounded shadow overflow-hidden">
        <div className="w-[50%]">
          <img
            src="/images/join.png"
            className="object-cover h-full w-full"
            alt="Join Rwanda platform image"
          />
        </div>
        <div className="w-[50%] flex flex-col justify-center items-center text-center shadow-md p-7">
          <h1 className="text-[50px] mt-4 text-[#022F40] font-bold font-roboto">
            JOIN RWANDA'S
            <br />
            LARGEST LEARNING 
            <br />
            PLATFORM
          </h1>
          <p className="text-[#022F40] text-[18px] mt-6 font-roboto">
            Start Registration here
          </p>
          <div className="flex mt-10 justify-center gap-10 w-full">
            <button
              className={`w-[10rem] cursor-pointer transition-all ease-in-out duration-500 hover:bg-white shadow-[0px_4px_4px_#00000040] hover:text-[#022F40] border-white bg-[#022F40] rounded-md text-white h-[2.5rem] font-roboto`}
            >
              Create Account
            </button>

            <button
              className={`font-bold w-[7rem] cursor-pointer transition-all ease-in-out duration-500 hover:bg-[#022F40] shadow-[0px_4px_4px_#00000040] hover:text-white border-white bg-white rounded-md text-[#022F40] h-[2.5rem] font-roboto`}
            >
              Login
            </button>
          </div>
        </div>
      </div>

      {/* Mobile view */}
      <div className="flex sm:hidden relative w-full justify-center text-center items-center bg-[url('/images/join.png')] bg-cover">
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-black opacity-50"></div>

        <div className="relative p-7 w-full">
          <h1 className="text-[30px] mt-4 text-white font-bold font-roboto">
            JOIN RWANDA'S
            <br />
            LARGEST LEARNING
            <br />
            PLATFORM
          </h1>
          <p className="mt-6 text-white font-roboto">Start Registration here</p>
          <div className="flex mt-10 justify-center gap-10 w-full">
            <button
              className={`w-[10rem] cursor-pointer transition-all ease-in-out duration-500 hover:bg-white shadow-[0px_4px_4px_#00000040] hover:text-[#022F40] border-white bg-[#022F40] rounded-md text-white h-[2.5rem] font-roboto`}
            >
              Create Account
            </button>

            <button
              className={`font-bold w-[7rem] cursor-pointer transition-all ease-in-out duration-500 hover:bg-[#022F40] shadow-[0px_4px_4px_#00000040] hover:text-white border-white bg-white rounded-md text-[#022F40] h-[2.5rem] font-roboto`}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinRwandaPage;
