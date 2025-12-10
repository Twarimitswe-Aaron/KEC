import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Phone } from "lucide-react";
import { motion } from "framer-motion";

// Using existing images as placeholders for the design grid
import heroImg from "/images/Hero.png";
import ipadImg from "/images/ipad landing page.png";
import subHeroImg from "/images/subHero.png";
import phoneImg from "/images/phone landing page.png";

// Helper Components for Animation
const Column = ({ children, direction, duration = 20 }: { children: React.ReactNode, direction: "up" | "down", duration?: number }) => {
  return (
    <div className="relative flex flex-col w-full min-w-[250px] md:min-w-[280px]">
      <motion.div
        animate={{ y: direction === "up" ? ["0%", "-50%"] : ["-50%", "0%"] }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: duration,
        }}
        className="flex flex-col"
      >
        <div className="flex flex-col gap-3 pb-3">
          {children}
        </div>
        <div className="flex flex-col gap-3 pb-3">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

const Card = ({ src, alt, badge, icon, className = "" }: { src: string, alt: string, badge?: string, icon?: React.ReactNode, className?: string }) => {
  return (
    <div className={`relative rounded-3xl overflow-hidden shadow-2xl bg-gray-100 ${className} group aspect-square`}>
      <img src={src} alt={alt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      {badge && (
        <div className={`absolute ${badge === "Buy Template" ? "bottom-6 right-6" : "top-4 right-4"} ${badge === "Buy Template" ? "bg-[#1A1A1A]" : "bg-black/80 backdrop-blur-md"} text-white ${badge === "Buy Template" ? "px-4 py-2" : "px-3 py-1 text-xs"} rounded-full flex items-center gap-2 shadow-lg`}>
          {badge} {icon}
        </div>
      )}
    </div>
  );
};
const HeroPage = () => {
  return (
    <section className="w-full bg-[#f8f9fb] text-[#111] font-sans overflow-hidden relative h-screen min-h-[700px] flex items-center">
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-12 w-full h-full">
        
        {/* Left Column: Content */}
        <div className="flex flex-col items-start justify-center gap-8 z-10 px-4 md:px-8 lg:pl-12">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] text-white rounded-full text-sm font-medium shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#FF4D00] animate-pulse"></span>
            Available For Projects
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-[#111]">
            World-Class <br />
            Design Partner <br />
            For <span className="text-[#555]">AI Startups</span>
          </h1>

          {/* Subtext */}
          <p className="text-lg text-gray-600 max-w-lg leading-relaxed font-medium">
            Fast, reliable, and scalable design solutions tailored for your growing startup.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <Link to="/pricing" className="group">
              <button className="flex items-center gap-3 bg-[#FF4D00] hover:bg-[#ff3300] text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95">
                View Pricing <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            
            <Link to="/contact" className="group">
              <button className="flex items-center gap-3 bg-[#1A1A1A] hover:bg-black text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95">
                Book Free Call <Phone size={20} className="fill-current group-hover:rotate-12 transition-transform" />
              </button>
            </Link>
          </div>
        </div>

        {/* Right Column: Image Grid (Animated) */}
        <div 
          className="relative w-full h-full hidden md:flex items-start justify-center gap-6 overflow-hidden"
        >
          <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-gray-200 to-transparent"></div>
          {/* Left Scroll Column (Moves UP) */}
          <Column direction="up" duration={90}>
            <Card src={subHeroImg} alt="Design Mockup 2" />
            <Card src={ipadImg} alt="Design Mockup 4" />
            <Card src={heroImg} alt="Design Mockup 1" badge="Book Free Call" />
            <Card src={subHeroImg} alt="Design Mockup 2" />
          </Column>

          {/* Right Scroll Column (Moves DOWN) */}
          <Column direction="down" duration={100}>
            <Card src={heroImg} alt="Design Mockup 1" badge="Book Free Call" />
            <Card src={phoneImg} alt="Design Mockup 3" />
            <Card src={ipadImg} alt="Design Mockup 4" />
            <Card src={phoneImg} alt="Design Mockup 3" />
          </Column>
        </div>
      </div>

      


    </section>
  );
};

export default HeroPage;
