import React, { useState, useEffect } from "react";
import { FaArrowRight } from "react-icons/fa6"; // Imported icons for potential use, but design uses text
import { RollingTextLink } from "../../../Components/Common/RollingTextLink";

export const FooterPage = () => {
  const [time, setTime] = useState(new Date());
  const year = time.getFullYear();

  useEffect(() => {
    setTime(new Date());
  }, []);

  const socialLinks = [
    { label: "X/Twitter", href: "https://x.com/DesignByMarso" },
    { label: "Linkedin", href: "https://www.linkedin.com/in/designedbymarso/" },
    { label: "YouTube", href: "https://www.youtube.com/" },
  ];

  const navigationLinks = [
    { label: "Services", href: "#FeaturedCourses" },
    { label: "Why Us", href: "#WhyUs" },
    { label: "Benefits", href: "#" },
    { label: "Work", href: "#" },
    { label: "Pricing", href: "#" },
    { label: "Reviews", href: "#Testimonials" },
    { label: "FAQs", href: "#FAQ" },
  ];

  const resourceLinks = [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms-of-service" },
    { label: "404 Page", href: "/404" },
  ];

  return (
    <footer className="w-full  font-['Inter',sans-serif]">
      <div
        className="w-full p-8 md:p-12 lg:p-16 text-white"
        style={{
          backgroundColor: "#151619"
        
        }}
      >
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 justify-between">

          {/* Left Section - Newsletter */}
          <div className="flex flex-col gap-6 max-w-md w-full lg:w-[40%]">
            <h3 className="font-sans font-bold text-xl tracking-tight text-white">
              Join 5K+ Readers
            </h3>

            <div className="relative w-full">
              <input
                type="email"
                placeholder="Your Email"
                className="w-full text-white/80 placeholder:text-[#A1A1A1] py-4 pl-6 pr-16 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                  borderRadius: "50px"
                }}
              />
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center hover:bg-[#ff5526] transition-colors group cursor-pointer"
                style={{
                  backgroundColor: "#FF3700",
                  borderRadius: "50px"
                }}
              >
                <FaArrowRight className="text-white text-sm group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Restored Contact Info */}
            <div className="flex flex-col gap-2 mt-2 text-[#999999] text-sm font-bold">
              <p>kigaliengineerscollege@gmail.com</p>
              <p>+250 788 667 900</p>
            </div>
          </div>

          {/* Right Section - Formatting as Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-10 lg:gap-20 w-full lg:w-auto">

            {/* Navigation Column */}
            <div className="flex flex-col gap-4">
              <h4 className="font-sans font-bold text-base text-white">Navigation</h4>
              <nav className="flex flex-col gap-3">
                {navigationLinks.map((link, idx) => (
                  <RollingTextLink
                    key={idx}
                    href={link.href}
                    className="text-[#A1A1A1] hover:text-white text-[15px] font-bold transition-colors"
                  >
                    {link.label}
                  </RollingTextLink>
                ))}
              </nav>
            </div>

            {/* Resources Column */}
            <div className="flex flex-col gap-4">
              <h4 className="font-sans font-bold text-base text-white">Resources</h4>
              <nav className="flex flex-col gap-3">
                {resourceLinks.map((link, idx) => (
                  <RollingTextLink
                    key={idx}
                    href={link.href}
                    className="text-[#A1A1A1] hover:text-white text-[15px] font-bold transition-colors"
                  >
                    {link.label}
                  </RollingTextLink>
                ))}
              </nav>
            </div>

            {/* Socials Column */}
            <div className="flex flex-col gap-4">
              <h4 className="font-sans font-bold text-base text-white">Socials</h4>
              <nav className="flex flex-col gap-3">
                {socialLinks.map((link, idx) => (
                  <RollingTextLink
                    key={idx}
                    href={link.href}
                    className="text-[#A1A1A1] hover:text-white text-[15px] font-bold transition-colors"
                  >
                    {link.label}
                  </RollingTextLink>
                ))}
              </nav>
            </div>

          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center bg-transparent gap-4">
          <p className="text-[#A1A1A1] text-sm font-bold">
            © {year} KEC. All rights reserved.
          </p>
         
        </div>

      </div>
    </footer>
  );
};

export default FooterPage;