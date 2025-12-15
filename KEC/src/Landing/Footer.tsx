import { useState } from "react";

export const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email submitted:", email);
    setEmail("");
  };

  const navigationLinks = [
    { name: "Services", url: "#services" },
    { name: "Why Us", url: "#why-us" },
    { name: "Benefits", url: "#benefits" },
    { name: "Work", url: "#work" },
    { name: "Pricing", url: "#pricing" },
    { name: "Reviews", url: "#reviews" },
    { name: "FAQs", url: "#faqs" },
  ];

  const resourceLinks = [
    { name: "Privacy Policy", url: "/privacy-policy" },
    { name: "Terms of Service", url: "/terms-of-service" },
    { name: "404 Page", url: "/404" },
  ];

  const socialLinks = [
    { name: "X/Twitter", url: "#" },
    { name: "LinkedIn", url: "#" },
    { name: "YouTube", url: "#" },
  ];

  return (
    <footer className="w-full relative py-16 px-4 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0" style={{ transform: "scale(1.1)" }}>
        <img
          src="/images/bg_orange_img.jpg"
          alt="footer background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-[#212121]/80"></div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto relative z-10">
        {/* Main Content Grid - 4 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Column 1: Email Signup */}
          <div>
            <h6
              className="text-white mb-4"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                letterSpacing: "-0.01em",
                lineHeight: "1.2em",
              }}
            >
              Join 5K+ Readers
            </h6>
            <form onSubmit={handleSubmit} className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your Email"
                required
                className="w-full bg-[rgba(255,255,255,0.03)] backdrop-blur-[5px] border border-[rgba(0,0,0,0.08)] rounded-full pl-4 pr-12 py-2.5 text-white placeholder-[#6B6B6B] text-sm focus:outline-none focus:border-[rgba(255,255,255,0.1)]"
                style={{
                  fontFamily: "Inter, sans-serif",
                }}
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#FF4726] hover:bg-[#FF5736] rounded-full p-2 transition-colors flex items-center justify-center"
                aria-label="Submit"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </form>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h6
              className="text-white mb-4"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                letterSpacing: "-0.01em",
                lineHeight: "1.2em",
              }}
            >
              Navigation
            </h6>
            <ul className="space-y-2">
              {navigationLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.url}
                    className="text-[#8B8B8B] hover:text-white transition-colors inline-block"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                      lineHeight: "1.2em",
                    }}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h6
              className="text-white mb-4"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                letterSpacing: "-0.01em",
                lineHeight: "1.2em",
              }}
            >
              Resources
            </h6>
            <ul className="space-y-2">
              {resourceLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.url}
                    className="text-[#8B8B8B] hover:text-white transition-colors inline-block"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                      lineHeight: "1.2em",
                    }}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Socials */}
          <div>
            <h6
              className="text-white mb-4"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                letterSpacing: "-0.01em",
                lineHeight: "1.2em",
              }}
            >
              Socials
            </h6>
            <ul className="space-y-2">
              {socialLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#8B8B8B] hover:text-white transition-colors inline-block"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                      lineHeight: "1.2em",
                    }}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
