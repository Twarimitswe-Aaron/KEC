import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Phone } from "lucide-react";
import { motion, Variants } from "framer-motion";

// Using existing images as placeholders for the design grid
import heroImg from "/images/Hero.png";
import ipadImg from "/images/ipad landing page.png";
import subHeroImg from "/images/subHero.png";
import phoneImg from "/images/phone landing page.png";







function AnimatedTextButton({ text }: { text: string }) {
  return (
    <motion.button
      initial="initial"
      whileHover="hovered"
      className="relative overflow-hidden px-6 py-3 rounded-full font-bold text-lg shadow-xl bg-[#FF4D00] text-white"
    >
      <div className="relative overflow-hidden h-[1.25em]">
        <motion.span
          variants={{
            initial: { y: 0 },
            hovered: { y: "-100%" },
          }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="block"
        >
          {text}
        </motion.span>
        <motion.span
          variants={{
            initial: { y: "100%" },
            hovered: { y: 0 },
          }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="absolute inset-0 block"
        >
          {text}
        </motion.span>
      </div>
    </motion.button>
  );
}





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
          repeatType: "loop",
        }}
        style={{
          willChange: "transform",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          transform: "translate3d(0, 0, 0)",
          WebkitTransform: "translate3d(0, 0, 0)"
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
    <div className={`relative rounded-3xl overflow-hidden  ${className} group aspect-square`}>
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
    <section className="w-full text-[#111] font-sans overflow-hidden relative h-screen min-h-[700px] flex items-center">
      <div className="max-w-[1400px]  grid lg:grid-cols-2   w-full h-full">

        {/* Left Column: Content */}
        <div className="flex flex-col items-start justify-center gap-8 z-10">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] text-white rounded-full text-sm font-medium shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#FF4D00] animate-pulse"></span>
            Available For Work
          </div>

          {/* Heading */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] text-[#111]">
            Rwandan Mechanical <br />
            Learning & Support <br />
            For <span className="text-[#555]">Practical Engineering</span>
          </h1>

          {/* Subtext */}
          <p className="text-lg text-gray-600 max-w-lg leading-relaxed font-medium">
            Learn, get guidance, and receive local assistance for installations, repairs, and all mechanical needs.
          </p>

          <div className="flex">
            <Link to="/pricing">
              <AnimatedTextButton text="Create Account" />
            </Link>

            <Link to="/contact">
              <AnimatedTextButton text="Login" />
            </Link>
          </div>
        </div>

        {/* Right Column: Image Grid (Animated) */}
        <div
          className="relative w-full h-full hidden md:flex items-start justify-center gap-3 overflow-hidden"
        >
          <div className="absolute left-0 top-0 bottom-0 w-[1px]"></div>
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
