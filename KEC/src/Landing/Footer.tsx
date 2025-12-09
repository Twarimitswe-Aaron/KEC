import React, { useEffect, useState } from "react";
import { FaLinkedin, FaMapMarkerAlt, FaPhone } from "react-icons/fa";
import { IoLogoInstagram } from "react-icons/io5";
import { AiFillYoutube, AiOutlineMail } from "react-icons/ai";
import { BiTime } from "react-icons/bi";
import { HiLocationMarker } from "react-icons/hi";

export const Footer = () => {
  const [time, setTime] = useState(new Date());
  const year = time.getFullYear();

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const contactInfo = {
    email: "kigaliengineerscollege@gmail.com",
    phone: "+250 788 667 900",
    address: "KG 7 Ave, Kigali, Rwanda",
    workingHours: "Mon - Fri: 07:00 - 17:00"
  };

  const socialLinks = [
    { 
      name: "YouTube", 
      icon: <AiFillYoutube size={24} />,
      url: "#",
      color: "hover:text-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.6)]"
    },
    { 
      name: "LinkedIn", 
      icon: <FaLinkedin size={24} />,
      url: "#",
      color: "hover:text-blue-400 hover:shadow-[0_0_15px_rgba(96,165,250,0.6)]"
    },
    { 
      name: "Instagram", 
      icon: <IoLogoInstagram size={24} />,
      url: "#",
      color: "hover:text-pink-400 hover:shadow-[0_0_15px_rgba(244,114,182,0.6)]"
    },
  ];

  const quickLinks = [
    { name: "About Us", url: "#" },
    { name: "Services", url: "#" },
    { name: "Programs", url: "#" },
    { name: "Contact", url: "#" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", url: "#" },
    { name: "Terms of Service", url: "#" },
    { name: "Sitemap", url: "#" },
  ];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).toUpperCase();
  };

  return (
    <footer className="w-full bg-[#011a24] text-cyan-50 mt-12 font-['Inter',sans-serif] relative overflow-hidden border-t border-cyan-500/30">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(2,47,64,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(2,47,64,0.1)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-20"></div>
      
      {/* Top Accent Line with Glow */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>

      <div className="container mx-auto px-6 py-12 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Brand & Identity */}
          <div className="space-y-6">
            <div className="relative inline-block">
              <h3 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]">
                KEC
              </h3>
              <div className="absolute -bottom-1 left-0 w-full h-[2px] bg-cyan-500/50 rounded-full"></div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed border-l-2 border-cyan-500/30 pl-3">
              Kigali Engineers College. <br />
              <span className="text-cyan-400/80">System Status: Online</span>
            </p>
            
            {/* Digital Clock Module */}
            <div className="bg-[#022f40]/50 backdrop-blur-md border border-cyan-500/30 rounded-md p-4 relative group overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/50"></div>
               <div className="absolute top-0 right-0 w-[5px] h-[5px] border-t border-r border-cyan-400"></div>
               <div className="absolute bottom-0 right-0 w-[5px] h-[5px] border-b border-r border-cyan-400"></div>
               
              <div className="flex items-center gap-2 mb-2 border-b border-cyan-500/20 pb-2">
                <BiTime className="text-cyan-400 animate-pulse" size={16} />
                <span className="font-mono text-xs text-cyan-300 tracking-widest uppercase">System Time</span>
              </div>
              <div className="font-mono text-2xl font-bold text-cyan-50 tracking-wider shadow-cyan-500/20 drop-shadow-md">
                {formatTime(time)}
              </div>
              <div className="font-mono text-xs text-cyan-400/70 mt-1 uppercase tracking-wider">
                {formatDate(time)}
              </div>
            </div>
          </div>

          {/* Quick Nav */}
          <div>
            <h4 className="font-mono text-sm font-bold mb-6 text-cyan-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_5px_cyan]"></span>
              Navigation
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.url}
                    className="group flex items-center gap-2 text-gray-400 hover:text-cyan-300 transition-all duration-300 text-sm"
                  >
                    <span className="w-1 h-1 bg-gray-600 group-hover:bg-cyan-400 group-hover:shadow-[0_0_5px_cyan] transition-all duration-300 rounded-full"></span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Data */}
          <div>
            <h4 className="font-mono text-sm font-bold mb-6 text-cyan-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_5px_cyan]"></span>
              Comm_Link
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm group">
                <div className="p-2 bg-cyan-500/10 rounded border border-cyan-500/20 group-hover:border-cyan-400/50 group-hover:bg-cyan-500/20 transition-all duration-300 text-cyan-400">
                   <FaPhone size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 font-mono text-[10px] uppercase">Phone</span>
                  <a href={`tel:${contactInfo.phone}`} className="text-gray-300 hover:text-white transition-colors font-mono">
                    {contactInfo.phone}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm group">
                <div className="p-2 bg-cyan-500/10 rounded border border-cyan-500/20 group-hover:border-cyan-400/50 group-hover:bg-cyan-500/20 transition-all duration-300 text-cyan-400">
                   <AiOutlineMail size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 font-mono text-[10px] uppercase">Email</span>
                  <a href={`mailto:${contactInfo.email}`} className="text-gray-300 hover:text-white transition-colors break-all">
                    {contactInfo.email}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm group">
                <div className="p-2 bg-cyan-500/10 rounded border border-cyan-500/20 group-hover:border-cyan-400/50 group-hover:bg-cyan-500/20 transition-all duration-300 text-cyan-400">
                   <HiLocationMarker size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 font-mono text-[10px] uppercase">HQ Coordinates</span>
                  <span className="text-gray-300">{contactInfo.address}</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Network & Input */}
          <div>
            <h4 className="font-mono text-sm font-bold mb-6 text-cyan-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_5px_cyan]"></span>
              Network
            </h4>
            
            <div className="flex gap-3 mb-6">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  aria-label={link.name}
                  className={`bg-[#022f40] p-3 rounded border border-cyan-500/20 text-gray-400 hover:text-white hover:border-cyan-500/50 hover:-translate-y-1 transition-all duration-300 ${link.color}`}
                >
                  {link.icon}
                </a>
              ))}
            </div>

            <div className="relative">
               <div className="absolute inset-0 bg-cyan-500/5 blur-md rounded-lg"></div>
               <div className="bg-[#022f40]/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-1 relative">
                <div className="flex">
                  <input
                    type="email"
                    placeholder="ENTER_EMAIL_ADDRESS"
                    className="flex-1 bg-transparent border-none text-cyan-50 placeholder-cyan-500/30 text-xs px-3 py-2 font-mono focus:ring-0 focus:outline-none"
                  />
                  <button className="bg-cyan-500/20 hover:bg-cyan-500 hover:text-[#022f40] text-cyan-400 px-4 py-1.5 rounded border border-cyan-500/50 text-xs font-bold font-mono tracking-wider transition-all duration-300 uppercase">
                    Connect
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Data Line */}
        <div className="border-t border-cyan-500/20 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <div className="font-mono text-gray-500">
            <span className="text-cyan-500/50">ID:</span> KEC-WEB-V1.0 // © {year}
          </div>

          <div className="flex gap-6">
            {legalLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                className="text-gray-500 hover:text-cyan-400 transition-colors uppercase tracking-wider font-mono text-[10px]"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="font-mono text-gray-500 flex items-center gap-2">
             <span>INITIATED IN RWANDA</span>
             <span className="w-2 h-2 bg-red-500/50 rounded-full animate-pulse shadow-[0_0_8px_red]"></span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;