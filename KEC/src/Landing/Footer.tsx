import React, { useEffect, useState } from "react";
import { FaLinkedin, FaMapMarkerAlt } from "react-icons/fa";
import { IoLogoInstagram } from "react-icons/io5";
import { AiFillYoutube, AiOutlineMail } from "react-icons/ai";
import { FaPhone } from "react-icons/fa";
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
      icon: <AiFillYoutube size={28} />,
      url: "#",
      color: "hover:text-red-500"
    },
    { 
      name: "LinkedIn", 
      icon: <FaLinkedin size={28} />,
      url: "#",
      color: "hover:text-blue-400"
    },
    { 
      name: "Instagram", 
      icon: <IoLogoInstagram size={28} />,
      url: "#",
      color: "hover:text-pink-400"
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <footer className="w-full bg-[#022f40] text-white mt-12 font-['Inter',sans-serif]">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold tracking-tight">KEC</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Kigali Engineers College - Building the future through excellence in engineering education and innovation.
            </p>
            
            {/* Live Clock */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <BiTime className="text-cyan-400" size={20} />
                <span className="font-semibold text-sm">Current Time</span>
              </div>
              <div className="font-mono text-2xl font-bold text-cyan-400">
                {formatTime(time)}
              </div>
              <div className="text-xs text-gray-300 mt-1">
                {formatDate(time)}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4 tracking-tight">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.url}
                    className="text-gray-300 hover:text-white hover:translate-x-1 inline-block transition-all duration-200 text-sm"
                  >
                    → {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-lg font-bold mb-4 tracking-tight">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm">
                <FaPhone className="mt-1 text-cyan-400 flex-shrink-0" size={16} />
                <div>
                  <a href={`tel:${contactInfo.phone}`} className="text-gray-300 hover:text-white transition-colors">
                    {contactInfo.phone}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <AiOutlineMail className="mt-1 text-cyan-400 flex-shrink-0" size={16} />
                <div>
                  <a href={`mailto:${contactInfo.email}`} className="text-gray-300 hover:text-white transition-colors break-all">
                    {contactInfo.email}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <HiLocationMarker className="mt-1 text-cyan-400 flex-shrink-0" size={16} />
                <span className="text-gray-300">{contactInfo.address}</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <BiTime className="mt-1 text-cyan-400 flex-shrink-0" size={16} />
                <span className="text-gray-300">{contactInfo.workingHours}</span>
              </li>
            </ul>
          </div>

          {/* Social Media & Newsletter */}
          <div>
            <h4 className="text-lg font-bold mb-4 tracking-tight">Connect With Us</h4>
            
            {/* Social Links */}
            <div className="flex gap-4 mb-6">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  aria-label={link.name}
                  className={`bg-white/10 p-3 rounded-lg ${link.color} transition-all duration-300 hover:bg-white/20 hover:scale-110`}
                >
                  {link.icon}
                </a>
              ))}
            </div>

            {/* Newsletter Signup */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h5 className="font-semibold text-sm mb-2">Subscribe to Newsletter</h5>
              <p className="text-xs text-gray-300 mb-3">Get updates and news</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 rounded bg-white/20 border border-white/30 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
                <button className="bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded font-semibold text-sm transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/20 my-8"></div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Copyright */}
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-300">
              © {year} <span className="font-semibold">Kigali Engineers College</span>. All rights reserved.
            </p>
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap justify-center gap-2 text-sm">
            {legalLinks.map((link, index) => (
              <React.Fragment key={index}>
                <a
                  href={link.url}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {link.name}
                </a>
                {index < legalLinks.length - 1 && (
                  <span className="text-gray-500">|</span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Made with love */}
          <div className="text-sm text-gray-300">
            Made with <span className="text-red-500">❤</span> in Rwanda
          </div>
        </div>
      </div>

      {/* Bottom Accent Line */}
      <div className="h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500"></div>
    </footer>
  );
};

export default Footer;