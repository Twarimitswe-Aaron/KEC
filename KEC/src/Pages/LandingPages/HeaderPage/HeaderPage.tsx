import React, { useState } from "react";
import { HashLink } from "react-router-hash-link";
import { Link } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import { CiGlobe } from "react-icons/ci";
import { BsList } from "react-icons/bs";
import { IoPersonCircleOutline } from "react-icons/io5";
import clsx from "clsx";
import "./HeaderPage.css";

// Rolling Text Component - splits text into individual characters
const RollingText: React.FC<{ text: string; id: string }> = ({ text, id }) => {
  return (
    <span className={`rolling-text-inner rolling-text-inner-${id}`}>
      {text.split("").map((char, idx) => (
        <span
          key={idx}
          style={{
            display: "block",
            fontFamily: 'Inter, "Inter Placeholder", sans-serif',
            fontSize: "calc(var(--framer-root-font-size, 1rem) * 0.9)",
            fontStyle: "normal",
            fontWeight: 600,
            letterSpacing: "-0.01em",
            lineHeight: "1.2em",
            transform: "none",
            willChange: "transform",
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
};

const HeaderPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  const links = [
    { to: "#hero", name: "Home" },
    { to: "#main", name: "How We Work" },
    { to: "#featuredCourses", name: "Featured Courses" },
    { to: "#whyUs", name: "Why Us?" },
    { to: "#others", name: "Others" },
  ];

  const [activeLink, setActiveLink] = useState("Home");

  return (
    <div className={`${menuOpen ? "z-50" : ""}`}>
      <div className="fixed left-0 w-full top-0 z-30 px-6 py-4">
        {/* Desktop & Tablet Header - Separate Glass Sections */}
        <div className="hidden lg:flex justify-between items-center gap-4 animate-fadeInUp">
          {/* Logo Section - Separate Glass Piece */}
          <div
            className="flex items-center px-6 py-3 bg-[#e5e5e5] backdrop-blur-[20px] border border-[rgba(2,47,64,0.1)] rounded-[50px] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-[rgba(255,255,255,0.8)] hover:border-[rgba(2,47,64,0.15)]"
            style={{
           
              boxShadow:
                "0px 0.6px 0.4px -0.8px rgba(2, 47, 64, 0.08), 0px 2.3px 1.6px -1.7px rgba(2, 47, 64, 0.08), 0px 10px 7px -2.5px rgba(2, 47, 64, 0.08), inset 0px 0.3px 0.9px -1.2px rgba(2, 47, 64, 0.17), inset 0px 1.1px 3.4px -2.3px rgba(2, 47, 64, 0.15), inset 0px 5px 15px -3.5px rgba(2, 47, 64, 0.08)",
            }}
          >
            <Link
              to="/"
              className="flex items-center gap-3 no-underline transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-0.5"
            >
              <div
                className="w-10 h-10 rounded-xl overflow-hidden transition-transform duration-300 ease-out hover:scale-105"
                style={{ backgroundColor: "#022F40" }}
              >
                <img
                  src="/images/Logo.svg"
                  alt="Logo"
                  className="block w-full h-full object-cover"
                />
              </div>
              <div
                className="font-['Inter'] text-2xl font-extrabold -tracking-[0.03em] leading-[1.35em] transition-colors duration-300"
                style={{ color: "#022F40" }}
              >
                KEC
              </div>
            </Link>
          </div>

          {/* Navigation Menu - Separate Glass Piece */}
          <div
            className="relative flex items-center gap-2 bg-[#e5e5e5] backdrop-blur-[20px] border border-[rgba(2,47,64,0.1)] rounded-[50px] px-6 py-2 transition-all duration-300 ease-out hover:bg-[rgba(255,255,255,0.8)] hover:border-[rgba(2,47,64,0.15)]"
            style={{
            
              boxShadow:
                "0px 0.6px 0.4px -0.8px rgba(2, 47, 64, 0.08), 0px 2.3px 1.6px -1.7px rgba(2, 47, 64, 0.08), 0px 10px 7px -2.5px rgba(2, 47, 64, 0.08), inset 0px 0.3px 0.9px -1.2px rgba(2, 47, 64, 0.17), inset 0px 1.1px 3.4px -2.3px rgba(2, 47, 64, 0.15), inset 0px 5px 15px -3.5px rgba(2, 47, 64, 0.08)",
            }}
          >
            <ul className="flex gap-2 items-center list-none m-0 p-0 relative z-[1]">
              {links.map((item, index) => (
                <li key={index}>
                  <HashLink
                    smooth
                    to={item.to}
                    className={clsx(
                      "menu-link relative flex items-center justify-center px-5 py-2.5 no-underline font-['Inter'] text-[0.9rem] font-semibold -tracking-[0.01em] rounded-[30px] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden hover:-translate-y-0.5",
                      activeLink === item.name
                        ? "menu-link-active text-white shadow-[0_4px_15px_rgba(2,47,64,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(2,47,64,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]"
                        : ""
                    )}
                    style={{
                      color: activeLink === item.name ? "white" : "#022F40",
                      background:
                        activeLink === item.name ? "#022F40" : "transparent",
                    }}
                    onClick={() => setActiveLink(item.name)}
                  >
                    <div className="flex items-center justify-center w-full h-full overflow-hidden p-0 box-border">
                      <RollingText
                        text={index === 0 ? item.name.slice(0, 4) : item.name}
                        id={`link-${index}`}
                      />
                    </div>
                  </HashLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons - Separate Glass Piece */}
          <div
            className="flex items-center bg-[#e5e5e5] gap-4 px-4 py-2 backdrop-blur-[20px] border border-[rgba(2,47,64,0.1)] rounded-[50px] transition-all duration-300 ease-out hover:bg-[rgba(255,255,255,0.8)] hover:border-[rgba(2,47,64,0.15)]"
            style={{
            
              boxShadow:
                "0px 0.6px 0.4px -0.8px rgba(2, 47, 64, 0.08), 0px 2.3px 1.6px -1.7px rgba(2, 47, 64, 0.08), 0px 10px 7px -2.5px rgba(2, 47, 64, 0.08), inset 0px 0.3px 0.9px -1.2px rgba(2, 47, 64, 0.17), inset 0px 1.1px 3.4px -2.3px rgba(2, 47, 64, 0.15), inset 0px 5px 15px -3.5px rgba(2, 47, 64, 0.08)",
            }}
          >
            <button
              className="flex items-center justify-center w-11 h-11 p-0 bg-transparent border border-[rgba(2,47,64,0.2)] rounded-full cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-[rgba(2,47,64,0.05)] hover:border-[rgba(2,47,64,0.3)] hover:-translate-y-0.5 hover:rotate-[15deg]"
              style={{ color: "#022F40" }}
            >
              <CiGlobe size={20} />
            </button>
          </div>
        </div>

        {/* Tablet Header */}
        <div className="hidden sm:flex lg:hidden justify-between items-center animate-fadeInUp">
          <div
            className="flex items-center px-6 py-3 backdrop-blur-[20px] border border-[rgba(2,47,64,0.1)] rounded-[50px] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-[rgba(255,255,255,0.8)] hover:border-[rgba(2,47,64,0.15)]"
            style={{
              background: "rgba(255, 255, 255, 0.7)",
              boxShadow:
                "0px 0.6px 0.4px -0.8px rgba(2, 47, 64, 0.08), 0px 2.3px 1.6px -1.7px rgba(2, 47, 64, 0.08), 0px 10px 7px -2.5px rgba(2, 47, 64, 0.08), inset 0px 0.3px 0.9px -1.2px rgba(2, 47, 64, 0.17), inset 0px 1.1px 3.4px -2.3px rgba(2, 47, 64, 0.15), inset 0px 5px 15px -3.5px rgba(2, 47, 64, 0.08)",
            }}
          >
            <Link
              to="/"
              className="flex items-center gap-3 no-underline transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-0.5"
            >
              <div
                className="w-10 h-10 rounded-xl overflow-hidden transition-transform duration-300 ease-out hover:scale-105"
                style={{ backgroundColor: "#022F40" }}
              >
                <img
                  src="/images/Logo.svg"
                  alt="Logo"
                  className="block w-full h-full object-cover"
                />
              </div>
              <div
                className="font-['Inter'] text-2xl font-extrabold -tracking-[0.03em] leading-[1.35em]"
                style={{ color: "#022F40" }}
              >
                KEC
              </div>
            </Link>
          </div>

          <div
            className="flex items-center gap-4 px-4 py-2 backdrop-blur-[20px] border border-[rgba(2,47,64,0.1)] rounded-[50px] transition-all duration-300 ease-out hover:bg-[rgba(255,255,255,0.8)] hover:border-[rgba(2,47,64,0.15)]"
            style={{
              background: "rgba(255, 255, 255, 0.7)",
              boxShadow:
                "0px 0.6px 0.4px -0.8px rgba(2, 47, 64, 0.08), 0px 2.3px 1.6px -1.7px rgba(2, 47, 64, 0.08), 0px 10px 7px -2.5px rgba(2, 47, 64, 0.08), inset 0px 0.3px 0.9px -1.2px rgba(2, 47, 64, 0.17), inset 0px 1.1px 3.4px -2.3px rgba(2, 47, 64, 0.15), inset 0px 5px 15px -3.5px rgba(2, 47, 64, 0.08)",
            }}
          >
            <button
              className="flex items-center justify-center w-11 h-11 p-0 bg-transparent border border-[rgba(2,47,64,0.2)] rounded-full cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-[rgba(2,47,64,0.05)] hover:border-[rgba(2,47,64,0.3)] hover:-translate-y-0.5 hover:rotate-[15deg]"
              style={{ color: "#022F40" }}
            >
              <CiGlobe size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="flex sm:hidden w-full backdrop-blur-xl bg-white/40 justify-between items-center px-4 py-3 shadow-sm">
        <BsList
          className="cursor-pointer"
          style={{ color: "#022F40" }}
          size={29}
          onClick={toggleMenu}
        />
        <Link to="/">
          <img
            src="/images/Logo.svg"
            alt="Logo"
            className="w-[8rem] h-[2rem] object-contain"
          />
        </Link>
        <Link to="/login">
          <IoPersonCircleOutline
            className="cursor-pointer"
            style={{ color: "#022F40" }}
            size={34}
          />
        </Link>
      </div>

      {/* Mobile Menu - Full Screen Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[1000] flex flex-col animate-menuFadeIn"
          style={{ backgroundColor: "#022F40" }}
        >
          <div className="flex items-center justify-between px-6 py-6 border-b border-white/5">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-3 no-underline"
              onClick={() => setMenuOpen(false)}
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-white flex items-center justify-center">
                <img
                  src="/images/Logo.svg"
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="font-['Inter'] text-2xl font-extrabold -tracking-[0.03em] text-white">
                KEC
              </div>
            </Link>

            {/* Close Button (X) */}
            <button
              className="mobile-close-btn relative w-11 h-11 border border-white/20 rounded-[30px] flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-[#033d52] hover:border-white/30"
              onClick={toggleMenu}
              aria-label="Close menu"
              style={{ backgroundColor: "#022F40" }}
            >
              <div className="close-line close-line-1 absolute w-5 h-0.5 bg-[#FF5100] rounded-sm rotate-45"></div>
              <div className="close-line close-line-2 absolute w-5 h-0.5 bg-[#FF5100] rounded-sm -rotate-45"></div>
            </button>
          </div>

          {/* Menu Links */}
          <div className="flex-1 flex flex-col px-6 py-8 overflow-y-auto">
            {links.map((item, index) => (
              <React.Fragment key={index}>
                <HashLink
                  smooth
                  to={item.to}
                  className="mobile-menu-link py-5 font-['Inter'] text-lg font-medium text-white no-underline transition-all duration-300 opacity-0 animate-menuLinkFadeIn hover:text-white/70 hover:translate-x-2"
                  style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.name}
                </HashLink>
                {index < links.length - 1 && (
                  <div className="h-px bg-white/5 m-0"></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Floating WhatsApp Button - Bottom Right */}
      <a
        href="https://wa.me/yourphonenumber"
        target="_blank"
        rel="noopener noreferrer"
        className="floating-whatsapp fixed bottom-8 right-8 w-14 h-14 flex items-center justify-center bg-[#25D366] rounded-full text-white cursor-pointer no-underline z-[1000] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-110 hover:-translate-y-1 hover:bg-[#20BA5A] active:scale-105 active:-translate-y-0.5 md:w-12 md:h-12 md:bottom-6 md:right-6"
        style={{
          boxShadow:
            "0 4px 12px rgba(37, 211, 102, 0.3), 0 8px 24px rgba(37, 211, 102, 0.2)",
          animation: "whatsapp-pulse 2s infinite",
        }}
        aria-label="Chat on WhatsApp"
      >
        <FaWhatsapp size={28} className="md:w-6 md:h-6" />
      </a>
    </div>
  );
};

export default HeaderPage;
