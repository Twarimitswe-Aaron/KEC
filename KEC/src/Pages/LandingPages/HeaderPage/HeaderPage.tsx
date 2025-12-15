import React, { useState } from "react";
import { BsGlobe } from "react-icons/bs";
import { HashLink } from "react-router-hash-link";
import { Link } from "react-router-dom";
import { AnimatedTextButton } from "../../../Components/Common/AnimatedTextButton";
import { AnimatedNavLink } from "../../../Components/Common/AnimatedNavLink";

const HeaderPage: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const [currentLang, setCurrentLang] = useState("EN");
  const [activeSection, setActiveSection] = useState("#hero");

  React.useEffect(() => {
    const options = {
      root: null,
      rootMargin: "-40% 0px -40% 0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(`#${entry.target.id}`);
        }
      });
    }, options);

    const sections = document.querySelectorAll(
      "#hero, #main, #featuredCourses, #assistance, #whyUs, #faqs"
    );
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  const languages = [
    { code: "EN", label: "English" },
    { code: "KINY", label: "Kinyarwanda" },
    { code: "KISW", label: "Kiswahili" }
  ];

  const links = [
    { to: "/#hero", name: "Home" },
    { to: "/#main", name: "Process" },
    { to: "/#featuredCourses", name: "Courses" },
    { to: "/#assistance", name: "Services" },
    { to: "/#whyUs", name: "Why Us?" },
    { to: "/#faqs", name: "FAQs" },
  ];

  // Reusable link component
  const renderLink = (link: { to: string; name: string }, idx: number, isMobile = false) => {
    if (isMobile) {
      return (
        <HashLink
          key={idx}
          smooth
          to={link.to}
          onClick={() => setMenuOpen(false)}
          className="relative px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 text-white text-lg font-semibold py-3 block hover:translate-x-1"
        >
          <span className="relative z-10">{link.name}</span>
        </HashLink>
      );
    }

    return (
      <AnimatedNavLink
        key={idx}
        to={link.to}
        text={link.name}
        isActive={activeSection === link.to}
        className="px-3 py-3 rounded-full font-bold text-sm text-[#555] hover:text-[#111] transition-colors duration-300"
      />
    );
  };

  return (
    <header className="fixed top-0 left-1/2 -translate-x-1/2 w-[95%] max-w-[1440px] z-50 sm:pl-9 sm:pr-10 p-4 sm:py-4">
      {/* Desktop Header */}
      <div className="hidden lg:flex justify-between items-center gap-4 max-w-[1400px] mx-auto">
        <Link className="flex items-center gap-2" to="/">
          <div className="w-8 h-8 flex items-center justify-center text-[#111]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 3h6v6H3V3zm12 0h6v6h-6V3zm0 12h6v6h-6v-6zM3 15h6v6H3v-6z"></path>
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-[#111]">KEC</span>
        </Link>
        <nav className="flex gap-1 bg-[#EBEBEB] rounded-full px-2 py-1 items-center">
          {links.map((link, idx) => renderLink(link, idx))}
        </nav>
        <div className="w-auto flex justify-end relative">
          <AnimatedTextButton
            text={currentLang}
            icon={<BsGlobe size={20} />}
            variant="secondary"
            className="ml-5 shadow-[0_7px_20px_0.5px_rgba(0,0,0,0.5)] z-20 relative text-lg !py-2 !pl-4 !pr-3"
            onClick={() => setShowLangMenu(!showLangMenu)}
          />

          {showLangMenu && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-[#151619] rounded-2xl shadow-xl overflow-hidden py-2 z-10 border border-white/10">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setCurrentLang(lang.code);
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors hover:bg-white/10 flex items-center justify-between ${currentLang === lang.code ? "text-[#FF3700]" : "text-white"
                    }`}
                >
                  {lang.label}
                  {currentLang === lang.code && <div className="w-2 h-2 rounded-full bg-[#FF3700]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Header */}
      <div className="flex lg:hidden justify-between items-center w-full bg-white/40 backdrop-blur-md px-4 py-3 shadow-sm">
        <svg
          stroke="currentColor"
          fill="currentColor"
          strokeWidth="0"
          viewBox="0 0 16 16"
          className="text-[#022F40] cursor-pointer"
          height="28"
          width="28"
          xmlns="http://www.w3.org/2000/svg"
          onClick={() => setMenuOpen(true)}
        >
          <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"></path>
        </svg>
        <Link className="inline-flex items-center" to="/">
          <img alt="Logo" className="w-32 h-8 object-contain" src="/images/Logo.svg" />
        </Link>
        <AnimatedTextButton
          text={currentLang}
          icon={<BsGlobe size={18} />}
          variant="secondary"
          className="ml-5 shadow-md text-lg !py-2 !pl-4 !pr-3"
          onClick={() => setShowLangMenu(!showLangMenu)}
        />
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
                <img src="/images/Logo.svg" alt="Logo" className="w-full h-full object-cover" />
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
            {links.map((link, idx) => renderLink(link, idx, true))}

            <div className="mt-8 border-t border-white/10 pt-8">
              <p className="text-white/50 text-sm font-medium mb-4 uppercase tracking-wider">Select Language</p>
              <div className="grid grid-cols-1 gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setCurrentLang(lang.code);
                      setMenuOpen(false);
                    }}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all ${currentLang === lang.code
                      ? "bg-[#FF3700] text-white"
                      : "bg-white/5 text-white hover:bg-white/10"
                      }`}
                  >
                    <span className="font-bold">{lang.label}</span>
                    {currentLang === lang.code && <BsGlobe />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default HeaderPage;
