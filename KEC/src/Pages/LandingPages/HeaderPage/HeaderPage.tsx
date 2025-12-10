import React, { useState } from "react";
import { HashLink } from "react-router-hash-link";
import { Link } from "react-router-dom";

const HeaderPage: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [
    { to: "#hero", name: "Home" },
    { to: "#main", name: "How We Work" },
    { to: "#featuredCourses", name: "Featured Courses" },
    { to: "#whyUs", name: "Why Us?" },
    { to: "#others", name: "Others" },
  ];

  return (
    <header className="fixed top-0 left-1/2 -translate-x-1/2 w-[95%] max-w-[1440px] z-50 p-4 sm:p-6 border-x border-gray-200">
      <div className="hidden lg:flex justify-between items-center gap-4 max-w-[1400px] mx-auto">
        <Link className="flex items-center gap-2" to="/">
          <div className="w-8 h-8 flex items-center justify-center text-[#111]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 3h6v6H3V3zm12 0h6v6h-6V3zm0 12h6v6h-6v-6zM3 15h6v6H3v-6z"></path>
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-[#111]">Formix</span>
        </Link>
        <nav className="flex gap-1 bg-[#EBEBEB] rounded-full px-2 py-1 items-center">
          <HashLink className="relative px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 text-[#555] hover:text-[#111] hover:bg-white/50" to="/#services">
            <span className="relative z-10">Services</span>
          </HashLink>
          <HashLink className="relative px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 text-[#555] hover:text-[#111] hover:bg-white/50" to="/#whyus">
            <span className="relative z-10">Why Us</span>
          </HashLink>
          <HashLink className="relative px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 text-[#555] hover:text-[#111] hover:bg-white/50" to="/#benefits">
            <span className="relative z-10">Benefits</span>
          </HashLink>
          <HashLink className="relative px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 text-[#555] hover:text-[#111] hover:bg-white/50" to="/#projects">
            <span className="relative z-10">Projects</span>
          </HashLink>
          <HashLink className="relative px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 text-[#555] hover:text-[#111] hover:bg-white/50" to="/#pricing">
            <span className="relative z-10">Pricing</span>
          </HashLink>
          <HashLink className="relative px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 text-[#555] hover:text-[#111] hover:bg-white/50" to="/#clients">
            <span className="relative z-10">Clients</span>
          </HashLink>
          <HashLink className="relative px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 text-[#555] hover:text-[#111] hover:bg-white/50" to="/#faqs">
            <span className="relative z-10">FAQs</span>
          </HashLink>
        </nav>
        <div className="w-20"></div>
      </div>
      <div className="flex lg:hidden justify-between items-center w-full bg-white/40 backdrop-blur-md px-4 py-3 shadow-sm">
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" className="text-[#022F40] cursor-pointer" height="28" width="28" xmlns="http://www.w3.org/2000/svg" onClick={() => setMenuOpen(true)}>
          <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"></path>
        </svg>
        <Link className="inline-flex items-center" to="/">
          <img alt="Logo" className="w-32 h-8 object-contain" src="/images/Logo.svg" />
        </Link>
        <button className="cursor-pointer">
          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="text-[#022F40]" height="34" width="34" xmlns="http://www.w3.org/2000/svg">
            <g id="Globe">
              <path d="M14.645,2.428a8.1,8.1,0,0,0-1.61-.3,9.332,9.332,0,0,0-3.6.28l-.07.02a9.928,9.928,0,0,0,.01,19.15,9.091,9.091,0,0,0,2.36.34,1.274,1.274,0,0,0,.27.02,9.65,9.65,0,0,0,2.63-.36,9.931,9.931,0,0,0,.01-19.15Zm-.27.96a8.943,8.943,0,0,1,5.84,5.11h-4.26a13.778,13.778,0,0,0-2.74-5.35A8.254,8.254,0,0,1,14.375,3.388Zm-2.37-.09a12.78,12.78,0,0,1,2.91,5.2H9.075A12.545,12.545,0,0,1,12.005,3.3Zm3.16,6.2a13.193,13.193,0,0,1,0,5.01H8.845a12.185,12.185,0,0,1-.25-2.5,12.353,12.353,0,0,1,.25-2.51Zm-5.6-6.09.07-.02a9.152,9.152,0,0,1,1.16-.23A13.618,13.618,0,0,0,8.045,8.5H3.8A9,9,0,0,1,9.565,3.408Zm-6.5,8.6a8.71,8.71,0,0,1,.37-2.51h4.39a13.95,13.95,0,0,0-.23,2.51,13.757,13.757,0,0,0,.23,2.5H3.435A8.591,8.591,0,0,1,3.065,12.008Zm6.57,8.61a8.9,8.9,0,0,1-5.84-5.11h4.24a13.632,13.632,0,0,0,2.77,5.35A8.1,8.1,0,0,1,9.635,20.618Zm-.56-5.11h5.84a12.638,12.638,0,0,1-2.91,5.21A12.872,12.872,0,0,1,9.075,15.508Zm5.3,5.11a11.551,11.551,0,0,1-1.17.24,13.8,13.8,0,0,0,2.75-5.35h4.26A8.924,8.924,0,0,1,14.375,20.618Zm1.8-6.11a13.611,13.611,0,0,0,0-5.01h4.39a8.379,8.379,0,0,1,.37,2.51,8.687,8.687,0,0,1-.36,2.5Z"></path>
            </g>
          </svg>
        </button>
      </div>

     {/* Mobile Menu Overlay - Preserved */}
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

      <a href="https://wa.me/yourphonenumber" target="_blank" rel="noopener noreferrer" className="fixed bottom-8 right-8 w-14 h-14 rounded-full flex items-center justify-center bg-[#25D366] text-white shadow-lg transition-transform duration-300 hover:scale-110 hover:-translate-y-1">
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="22" width="22" xmlns="http://www.w3.org/2000/svg">
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path>
        </svg>
      </a>
    </header>
  );
};

export default HeaderPage;
