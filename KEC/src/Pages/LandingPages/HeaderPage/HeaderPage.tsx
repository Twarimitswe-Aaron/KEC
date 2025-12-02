import React, { useState } from "react";
import { HashLink } from "react-router-hash-link";
import { Link } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import { CiGlobe } from "react-icons/ci";
import { BsList } from "react-icons/bs";
import { IoPersonCircleOutline } from "react-icons/io5";

/* ---------- Config ---------- */
const PRIMARY = "text-[#022F40]";
const WHITE = "text-white";
const WHATSAPP = "bg-[#25D366]";

/* ---------- RollingText (per-character hover effect) ---------- */
type RollingTextProps = { text: string; id?: string };
const RollingText: React.FC<RollingTextProps> = ({ text, id = "default" }) => {
  const [parentHover, setParentHover] = useState(false);
  const [hoverChar, setHoverChar] = useState<number | null>(null);

  const PRIMARY = "#022F40";

  // Wrapper style matching Framer structure
  const wrapperStyle: React.CSSProperties = {
    display: "flex",
    overflow: "hidden",
    width: "max-content",
    verticalAlign: "top",
    userSelect: "none",
    // Diagonal shadow for diagonal rolling effect
    textShadow: `19.2px -19.2px 0 ${PRIMARY}`,
  };

  // Base styles for each character (matching Framer)
  const getCharStyle = (idx: number): React.CSSProperties => {
    const translateX = parentHover && hoverChar !== idx ? "100%" : "0%";
    const translateY = parentHover && hoverChar !== idx ? "-100%" : "0%";
    const scale = hoverChar === idx ? 1.1 : 1;
    const xShift = hoverChar === idx ? "2px" : "0px";
    const yShift = hoverChar === idx ? "-2px" : "0px";

    return {
      display: "block",
      fontFamily: 'Inter, "Inter Placeholder", sans-serif',
      fontSize: "calc(var(--framer-root-font-size, 1rem) * 0.9)",
      fontStyle: "normal",
      fontWeight: 600,
      letterSpacing: "-0.01em",
      lineHeight: "1.2em",
      whiteSpace: "pre",
      flexShrink: 0,
      willChange: "transform",
      WebkitBackfaceVisibility: "hidden",
      backfaceVisibility: "hidden",
      transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
      transitionDelay: parentHover ? `${idx * 0.02}s` : "0s",
      transform:
        parentHover || hoverChar === idx
          ? `translateX(${translateX}) translateY(${translateY}) scale(${scale}) translateX(${xShift}) translateY(${yShift})`
          : "none",
      position: "relative" as const,
      zIndex: hoverChar === idx ? 10 : undefined,
      color: PRIMARY,
      cursor: "pointer",
    };
  };

  return (
    <span
      className={`rolling-text-inner rolling-text-inner-${id}`}
      style={wrapperStyle}
      onMouseEnter={() => setParentHover(true)}
      onMouseLeave={() => {
        setParentHover(false);
        setHoverChar(null);
      }}
    >
      {text.split("").map((char, idx) => (
        <span
          key={idx}
          onMouseEnter={() => setHoverChar(idx)}
          onMouseLeave={() => setHoverChar(null)}
          style={getCharStyle(idx)}
          aria-hidden={char === " "}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
};

/* ---------- HeaderPage ---------- */
const HeaderPage: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const links = [
    { to: "#hero", name: "Home" },
    { to: "#main", name: "How We Work" },
    { to: "#featuredCourses", name: "Featured Courses" },
    { to: "#whyUs", name: "Why Us?" },
    { to: "#others", name: "Others" },
  ];
  const [activeLink, setActiveLink] = useState("Home");

  /* emulate pseudo-element background inside link */
  const pseudoBgStyle = (index: number) =>
    ({
      position: "absolute",
      inset: 0,
      borderRadius: 30,
      background: "rgba(2,47,64,0.05)",
      opacity: hoverIdx === index ? 1 : 0,
      transition: "opacity 240ms ease",
      zIndex: 0,
      pointerEvents: "none",
    } as React.CSSProperties);

  return (
    <header className="fixed top-0 left-0 w-full z-50 p-4 sm:p-6">
      {/* Desktop / Tablet */}
      <div className="hidden lg:flex justify-between items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#022F40] flex items-center justify-center">
            <img
              src="/images/Logo.svg"
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-[#022F40]">
            KEC
          </span>
        </Link>

        {/* Nav Pill */}
        <nav className="flex gap-2 bg-white/30 backdrop-blur-lg rounded-[50px] px-5 py-2 items-center shadow-lg">
          {links.map((link, idx) => {
            const isActive = activeLink === link.name;
            return (
              <HashLink
                key={idx}
                smooth
                to={link.to}
                onClick={() => setActiveLink(link.name)}
                onMouseEnter={() => setHoverIdx(idx)}
                onMouseLeave={() => setHoverIdx(null)}
                className={`relative px-5 py-2 rounded-[30px] font-semibold text-sm transition-all duration-300
                  ${
                    isActive
                      ? "bg-[#022F40] text-white shadow-md -translate-y-0.5"
                      : "text-[#022F40]"
                  }
                  `}
              >
                {/* Pseudo background div */}
                <div style={pseudoBgStyle(idx)} />
                <span className="relative z-10">
                  <RollingText text={link.name} id={`link-${idx}`} />
                </span>
              </HashLink>
            );
          })}
        </nav>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button className="w-11 h-11 flex items-center justify-center rounded-full border border-[#022F40]/20 text-[#022F40] hover:translate-y-[-0.5rem] hover:rotate-12 transition-all duration-300">
            <CiGlobe size={22} />
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="flex lg:hidden justify-between items-center w-full bg-white/40 backdrop-blur-md px-4 py-3 shadow-sm">
        <BsList
          size={28}
          className="text-[#022F40] cursor-pointer"
          onClick={() => setMenuOpen(true)}
        />
        <Link to="/" className="inline-flex items-center">
          <img
            src="/images/Logo.svg"
            alt="Logo"
            className="w-32 h-8 object-contain"
          />
        </Link>
        <button className="cursor-pointer">
          <CiGlobe size={34} className="text-[#022F40]" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-[#022F40] z-50 flex flex-col">
          <div className="flex justify-between items-center p-5 border-b border-white/10">
            <Link
              to="/"
              className="flex items-center gap-3"
              onClick={() => setMenuOpen(false)}
            >
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center overflow-hidden">
                <img
                  src="/images/Logo.svg"
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-white text-2xl font-extrabold">KEC</span>
            </Link>
            <button
              onClick={() => setMenuOpen(false)}
              className="w-11 h-11 flex items-center justify-center rounded-full border border-white/20 text-white"
            >
              <div className="relative w-5 h-5">
                <span className="absolute w-5 h-0.5 bg-orange-500 rotate-45 top-2.5 left-0.5 rounded"></span>
                <span className="absolute w-5 h-0.5 bg-orange-500 -rotate-45 top-2.5 left-0.5 rounded"></span>
              </div>
            </button>
          </div>

          <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
            {links.map((link, idx) => (
              <HashLink
                key={idx}
                smooth
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="text-white text-lg font-semibold py-3 block hover:translate-x-1 transition-transform duration-300"
              >
                {link.name}
              </HashLink>
            ))}
          </div>
        </div>
      )}

      {/* Floating WhatsApp */}
      <a
        href="https://wa.me/yourphonenumber"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full flex items-center justify-center bg-[#25D366] text-white shadow-lg transition-transform duration-300 hover:scale-110 hover:-translate-y-1"
      >
        <FaWhatsapp size={22} />
      </a>
    </header>
  );
};

export default HeaderPage;
