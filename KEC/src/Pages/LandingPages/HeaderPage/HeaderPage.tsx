import React, { useState } from "react";
import styles from "../../../Styles/styles";
import { Link } from "react-router-dom";
import { FaGlobe, FaWhatsapp } from "react-icons/fa";
import { CiGlobe } from "react-icons/ci";
import { BsList } from "react-icons/bs";
import { IoClose, IoPersonCircleOutline } from "react-icons/io5";


const HeaderPage = () => {
  const [isActive, setActive] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  const link: string[] = ["Home", "Featured Courses", "How We Work", "Why Us?"];
  const [activeLink, setActiveLink] = useState("Home");
  return (
    < div className="">
      <div
        className={`${styles.parent_section} items-center fixed  left-0 w-full  top-0 z-30`}
      >
        <div className={`${styles.section}`}>
          <div className="w-full mb-5 rounded-b-md backdrop-blur-3xl  bg-white/30">
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
              </div>

              {/* Center Section */}
              <div className="hidden sm:flex w-[60%] justify-center ">
                <ul className="flex gap-4">
                  {link.map((item, index) => (
                    <li
                      key={index}
                      className="text-[0.875rem] font-roboto font-normal text-[#022F40] relative group"
                    >
                      <Link to={`/${item.replace(/\s+/g, "-").toLowerCase()}`}>
                        {item.split(" ").map((word, i) => (
                          <React.Fragment key={i}>
                            {word}
                            {i < item.split(" ").length - 1 && <>&nbsp;</>}
                          </React.Fragment>
                        ))}
                        <span
                          className={!isActive ? `${styles.link_hover}` : ""}
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right Section */}
              <div className="flex  gap-4 items-center">
                <div className="sm:pl-9 cursor-pointer">
                  <FaWhatsapp size={32} />
                </div>
                <button className={`${styles.light_btn} w-[42px]`}>
                  <CiGlobe size={25} />
                </button>
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
              </div>

              {/* Center Section */}
              <div className="hidden lg:flex w-[10px] justify-center">
                <ul className="flex gap-6 items-center">
                  {link.map((item, index) => (
                    <li
                      onClick={() => {
                        setActiveLink(item);
                      }}
                      key={index}
                      className={`text-[1rem] ${
                        activeLink == item
                          ? "cursor-pointer justify-center px-2 py-1 text-[16px] border-solid border-[1px] font-roboto transition-all ease-in-out duration-500 border-[#022F40] font-normal text-white rounded-md bg-[#022F40] h-auto w-full"
                          : "text-[#022F40] border-transparent hover:text-[#011d29]"
                      } font-roboto font-normal text-[#022F40] px-2 py-1 relative group`}
                    >
                      <Link to={`/${item.replace(/\s+/g, "-").toLowerCase()}`}>
                        {item.split(" ").map((word, i) => (
                          <React.Fragment key={i}>
                            {word}
                            {i < item.split(" ").length - 1 && <>&nbsp;</>}
                          </React.Fragment>
                        ))}
                        <span
                          className={
                            activeLink != item ? `${styles.link_hover}` : ""
                          }
                        />
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
      <div className="flex sm:hidden w-full mb-5  backdrop-blur-3xl   bg-white/30 justify-between items-center px-4 py-3">
        <BsList className="cursor-pointer" size={29} onClick={toggleMenu} />
        <Link to="/">
          <img
            src="/images/Logo.svg"
            alt="Logo"
            className="w-[8rem] h-[2rem] object-contain" // 150px -> 9.375rem, 40px -> 2.5rem
          />
        </Link>
        <IoPersonCircleOutline className="cursor-pointer" size={34} />
      </div>

      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#00000040] bg-opacity-70"
          onClick={toggleMenu}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`${
              menuOpen ? "translate-x-0" : "-translate-x-full"
            } fixed top-0 left-0 z-50 h-[300px] w-[38%] rounded-br-2xl max-w-xs bg-white shadow-xl p-4 transform transition-transform duration-300 ease-in-out `}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-lg">Menu</h2>
              <IoClose
                className="text-2xl cursor-pointer "
                onClick={toggleMenu}
              />
            </div>
            <ul className="space-y-5 font-medium text-[15px]">
              <li>
                <Link to="/" onClick={toggleMenu}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/featured-course" onClick={toggleMenu}>
                  Featured Course
                </Link>
              </li>
              <li>
                <Link to="/how-we-work" onClick={toggleMenu}>
                  How we work
                </Link>
              </li>
              <li>
                <Link to="/why-us" onClick={toggleMenu}>
                  why us
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <FaGlobe />
                <p>Language</p>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderPage;
