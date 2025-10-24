import React, { useEffect, useState } from "react";
import { FaLinkedin } from "react-icons/fa6";
import { IoLogoInstagram } from "react-icons/io5";
import { AiFillYoutube, AiOutlineMail } from "react-icons/ai";
import { FaPhone } from "react-icons/fa";

export const FooterPage = () => {
  const [time, setTime] = useState(new Date());
  const year = time.getFullYear();

  useEffect(() => {
    setTime(new Date());
  }, []);

  const contactInfo = {
    email: "kigaliengineerscollege@gmail.com",
    phone: "+250 788 667 900",
  };

  const socialLinks = [
    { 
      icon: <AiFillYoutube size={26} />,
      label: "YouTube",
      hoverColor: "hover:text-red-500"
    },
    { 
      icon: <FaLinkedin size={26} />,
      label: "LinkedIn",
      hoverColor: "hover:text-blue-400"
    },
    { 
      icon: <IoLogoInstagram size={26} />,
      label: "Instagram",
      hoverColor: "hover:text-pink-400"
    },
  ];

  const legalLinks = [
    { name: "Privacy Policy" },
    { name: "Terms of Service" },
    { name: "Sitemap" },
  ];

  return (
    <footer className="w-full bg-[#022f40] py-10 mt-12 text-white font-['Inter',sans-serif]">
      <div className="container mx-auto px-6 max-w-6xl">
        
        {/* Social Media Links with Modern Styling */}
        <div className="flex justify-center gap-4 mb-8">
          {socialLinks.map((link, index) => (
            <button
              key={index}
              aria-label={link.label}
              className={`bg-white/10 backdrop-blur-sm p-4 rounded-xl ${link.hoverColor} transition-all duration-300 hover:bg-white/20 hover:scale-110 hover:-translate-y-1 shadow-lg`}
            >
              {link.icon}
            </button>
          ))}
        </div>

        {/* Contact Information with Modern Cards */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-8">
          <a 
            href={`tel:${contactInfo.phone}`}
            className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-105"
          >
            <div className="bg-cyan-500 p-2 rounded-lg">
              <FaPhone size={16} />
            </div>
            <span className="font-medium text-sm sm:text-base">{contactInfo.phone}</span>
          </a>

          <a 
            href={`mailto:${contactInfo.email}`}
            className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-105"
          >
            <div className="bg-cyan-500 p-2 rounded-lg">
              <AiOutlineMail size={16} />
            </div>
            <span className="font-medium text-sm sm:text-base break-all">{contactInfo.email}</span>
          </a>
        </div>

        {/* Divider Line */}
        <div className="border-t border-white/20 my-6"></div>

        {/* Legal Links */}
        <div className="flex flex-wrap justify-center items-center gap-3 mb-6 text-sm">
          {legalLinks.map((link, index) => (
            <React.Fragment key={index}>
              <button className="text-gray-300 hover:text-white transition-colors duration-200 font-medium">
                {link.name}
              </button>
              {index < legalLinks.length - 1 && (
                <span className="text-gray-500">•</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Copyright with Modern Typography */}
        <div className="text-center">
          <p className="text-gray-300 text-sm">
            © {year} <span className="font-bold text-white">KEC</span>. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Made with <span className="text-red-500 animate-pulse">❤</span> in Rwanda
          </p>
        </div>
      </div>

      {/* Bottom Gradient Accent */}
      <div className="h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mt-8"></div>
    </footer>
  );
};

export default FooterPage;