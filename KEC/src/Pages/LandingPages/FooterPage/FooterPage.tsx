import React, { useEffect, useState } from "react";
import { FaLinkedin } from "react-icons/fa6";
import { IoLogoInstagram } from "react-icons/io5";
import { AiFillYoutube, AiOutlineMail } from "react-icons/ai";
import { FaPhone } from "react-icons/fa";

export const FooterPage = () => {
  const [time, setTime] = useState(new Date());
  let year = time.getFullYear();

  useEffect(() => {
    setTime(new Date());
  }, []);

  const contactInfo = {
    email: "kigaliengineerscollege@gmail.com",
    phone: "+250 788 667 900",
  };

  const socialLinks = [
    { name: <AiFillYoutube size={25} /> },
    { name: <FaLinkedin size={25} /> },
    { name: <IoLogoInstagram size={25} /> },
  ];

  const legalLinks = [
    { name: "Privacy Policy" },
    { name: "Terms of services" },
    { name: "Sitemap" },
  ];

  return (
    <footer className="w-full bg-[#022f40] py-4 mt-7 rounded text-center sm:text-[13px] md:text-[16px] text-sm lg:text-lg shadow bg-cover font-roboto">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Social media links */}
        <div className="flex justify-center gap-6 mb-3">
          {socialLinks.map((link, index) => (
            <div key={index}>
              <span className="text-white text-3xl cursor-pointer">
                {link.name}
              </span>
            </div>
          ))}
        </div>

        {/* Contact information */}
        <div className="text-center items-center mb-6 justify-center">
          <div className="sm:flex block text-center gap-6 text-white justify-center cursor-pointer">
            <div className="flex justify-center gap-2 items-center">
              <FaPhone />
              <p className="sm:text-[13px] md:text-[16px] text-sm lg:text-lg">
                : {contactInfo.phone}
              </p>
            </div>
            <div>|</div>
            <div className="flex justify-center gap-2 items-center">
              <AiOutlineMail />
              <p className="sm:text-[13px] md:text-[16px] text-sm lg:text-lg">
                : {contactInfo.email}
              </p>
            </div>
          </div>
        </div>

        {/* Legal links */}
        <div className="flex justify-center text-center">
          {legalLinks.map((link, index) => (
            <div key={index} className="flex items-center">
              <span className="text-white tracking-[0.01px] cursor-pointer">
                {link.name}
              </span>
              {index < legalLinks.length - 1 && (
                <span className="mx-2 font-['Public_Sans',Helvetica] font-semibold text-white">
                  |
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center mt-3">
          <div className="justify-center text-white">
            <p className="mx-auto">© {year} KEC. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterPage;
