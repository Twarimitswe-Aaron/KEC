import React, { useState } from "react";
import styles from "../../Styles/styles";
import { Link } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import { CiGlobe } from "react-icons/ci";
import { BsList } from "react-icons/bs";
import { IoPersonCircleOutline } from "react-icons/io5";
import "../../App.css";

const HeaderPage = () => {
  const link: string[] = ["Featured Courses", "How We Work", "Why Us?"];
  const [activeLink, setActiveLink] = useState("Home");
  return (
    <>
      <div className={`${styles.parent_section} align-center`}>
        <div className={`${styles.section}`}>
          <div className="w-full mb-5 rounded-b-md bg-white">
            {/* Tablet Header (iPad) */}
            <div className="hidden sm:flex lg:hidden justify-between items-center px-4 py-4">
              {/* Left Section */}
              <div className="flex items-center gap-4 sm:w-[190px]">
                <Link to="/">
                  <img
                    src="/images/Logo.svg"
                    alt="Logo"
                    className="w-[10rem] h-[2rem] object-contain" // Adjusted for tablets
                  />
                </Link>
                <button
                  className={`${
                    activeLink == "Home" ? styles.dark_btn : ""
                  } hidden sm:block`}
                >
                  Home
                </button>
              </div>

              {/* Center Section */}
              <div className="hidden sm:flex w-[60%] justify-center">
                <ul className="flex gap-4">
                  {link.map((item, index) => (
                    <li
                      key={index}
                      className="text-[0.875rem] font-Poppins font-normal text-[#022F40] relative group"
                    >
                      <Link to={`/${item.replace(/\s+/g, "-").toLowerCase()}`}>
                        {item.split(" ").map((word, i) => (
                          <React.Fragment key={i}>
                            {word}
                            {i < item.split(" ").length - 1 && <>&nbsp;</>}
                          </React.Fragment>
                        ))}
                        <span className="absolute bottom-0 left-0 w-0 h-[0.125rem] bg-[#022F40] origin-left transition-all duration-300 group-hover:w-full" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right Section */}
              <div className="grid grid-cols-3 gap-5 items-center">
                <div className="sm:pl-9 cursor-pointer">
                  <FaWhatsapp size={32} />
                </div>
                <button className={`${styles.light_btn} w-[70px]`}>
                  Signup
                </button>
                <button className={`${styles.dark_btn} w-[90px]`}>Login</button>
              </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:flex justify-between items-center px-6 py-4">
              {/* Left Section */}
              <div className="flex items-center gap-4 lg:w-[150px]">
                <Link to="/">
                  <img
                    src="/images/Logo.svg"
                    alt="Logo"
                    className="w-[9.375rem] h-[2.5rem] object-contain"
                  />
                </Link>
                <button
                  onClick={() => {
                    setActiveLink("Home");
                  }}
                  className={`${
                    activeLink == "Home" ? styles.dark_btn : ""
                  } hidden sm:block`}
                >
                  Home
                </button>
              </div>

              {/* Center Section */}
              <div className="hidden lg:flex w-[10px] justify-center">
                <ul className="flex gap-8">
                  {link.map((item, index) => (
                    <li
                      onClick={() => {
                        setActiveLink(item);
                      }}
                      key={index}
                      className={`text-[1rem] ${
                        activeLink == item ? styles.dark_btn : ""
                      } font-Poppins font-normal text-[#022F40] relative group`}
                    >
                      <Link to={`/${item.replace(/\s+/g, "-").toLowerCase()}`}>
                        {item.split(" ").map((word, i) => (
                          <React.Fragment key={i}>
                            {word}
                            {i < item.split(" ").length - 1 && <>&nbsp;</>}
                          </React.Fragment>
                        ))}
                        <span className="absolute bottom-0 left-0 w-0 h-[0.125rem] bg-[#022F40] origin-left transition-all duration-300 group-hover:w-full" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right Section */}
              <div className="grid grid-cols-4 gap-4 w-[305px] items-center">
                <div className="sm:pl-9 cursor-pointer">
                  <FaWhatsapp size={38} />
                </div>
                <button className={`${styles.light_btn} md:w-[70px]`}>
                  Signup
                </button>
                <button className={`${styles.dark_btn} w-[100px]`}>
                  Login
                </button>
                <button className={`${styles.light_btn} w-[42px]`}>
                  <CiGlobe size={25} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Header */}
      <div className="flex sm:hidden w-full mb-5 -mt-5 bg-white justify-between items-center px-4 py-3">
        <BsList size={29} />
        <Link to="/">
          <img
            src="/images/Logo.svg"
            alt="Logo"
            className="w-[8rem] h-[2rem] object-contain" // 150px -> 9.375rem, 40px -> 2.5rem
          />
        </Link>
        <IoPersonCircleOutline size={34} />
      </div>
    </>
  );
};

export default HeaderPage;
