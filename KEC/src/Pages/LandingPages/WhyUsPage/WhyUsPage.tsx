import React from "react";
import { Check, Star, TrendingUp, Award, Clock, Users, MousePointer2 } from "lucide-react";
import { FaLinkedinIn, FaInstagram, FaTwitter } from "react-icons/fa";
import { motion } from "framer-motion";

const WhyUsPage = () => {
  const smallFeatures = [
    {
      title: "Flex",
      subtitle: "Flexible Learning",
      description: "Study at your own pace, on your schedule.",
      pills: [true, false, false, false] // true = orange, false = gray
    },
    {
      title: "100%",
      subtitle: "Interactive Courses",
      description: "Engage with hands-on projects and real-world case studies.",
      pills: [true, true, true, false]
    },
    {
      title: "Certs",
      subtitle: "Recognized Certs",
      description: "Earn valuable certificates to boost your career.",
      pills: [true, true, false, false]
    },
    {
      title: "#1",
      subtitle: "Career Growth",
      description: "Gain the skills needed to excel and advance.",
      pills: [true, true, true, true]
    }
  ];

  return (
    <section id="whyUs" className="w-full py-20 px-4 md:px-8 bg-[#E5E5E5]">
      <div className="max-w-[1400px] mx-auto">

        {/* Header Section - Flex Layout */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-12 px-2">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#151619] text-white rounded-full mb-6">
              <span className="text-[#FF4726] font-medium">//</span>
              <span className="text-sm font-medium tracking-wide">Why Us</span>
              <span className="text-[#FF4726] font-medium">//</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#151619] tracking-tight leading-[1.1]">
              Proven results for <br /> <span className="text-gray-500">every student</span>
            </h2>
          </div>
          <p className="text-lg md:text-xl text-gray-600 max-w-sm leading-relaxed font-medium">
            We combine strategy, speed, and skill to deliver exceptional education — every time.
          </p>
        </div>

        {/* Content Grid: Left Big Card (30%) + Right 2x2 Grid (70%) */}
        <div className="grid grid-cols-1 lg:grid-cols-[30%_1fr] gap-6">

          {/* Left Large Card - "Robert Park" Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative w-full h-[500px] lg:h-auto rounded-[24px] overflow-hidden group min-h-[500px]"
          >
            {/* Background Image */}
            <img
              src="/images/hnVZOXiTRpBVsQ6SOl9xIaPVPRg.jpg"
              alt="Robert Park"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* Overlay Info */}
            <div className="absolute inset-0 p-8 flex flex-col justify-end">
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

              {/* Content */}
              <div className="relative z-10 flex items-end justify-between gap-4">

                {/* Text Wrapper */}
                <div className="flex flex-col gap-1">
                  <h4 className="text-white text-2xl font-semibold tracking-tight">Robert Park</h4>
                  <p className="text-[#A1A1A1] text-sm font-medium">Founder of Formix</p>
                </div>

                {/* Social Icons Row */}
                <div className="flex gap-2.5">
                  <a href="#" className="w-[50px] h-[50px] rounded-full bg-black/20 backdrop-blur-[10px] flex items-center justify-center hover:bg-black/30 transition-all border border-white/5">
                    <FaTwitter className="text-[#EBEBEB]" size={18} />
                  </a>
                  <a href="#" className="w-[50px] h-[50px] rounded-full bg-black/20 backdrop-blur-[10px] flex items-center justify-center hover:bg-black/30 transition-all border border-white/5">
                    <FaLinkedinIn className="text-[#EBEBEB]" size={18} />
                  </a>
                  <a href="#" className="w-[50px] h-[50px] rounded-full bg-black/20 backdrop-blur-[10px] flex items-center justify-center hover:bg-black/30 transition-all border border-white/5">
                    <FaInstagram className="text-[#EBEBEB]" size={18} />
                  </a>
                </div>

              </div>
            </div>
          </motion.div>

          {/* Right Column - 2x2 Grid - "Result Cards" Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            {smallFeatures.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-[#F0F0F0] rounded-[24px] p-6 lg:p-8 flex flex-col justify-between min-h-[260px] hover:bg-white hover:shadow-xl transition-all duration-300"
              >
                {/* Top: Big Title */}
                <div>
                  <h3 className="text-4xl lg:text-5xl font-bold text-[#151619] mb-4">{feature.title}</h3>
                </div>

                {/* Middle: Highlighter Pills */}
                <div className="flex gap-1.5 my-4">
                  {feature.pills.map((isActive, pIdx) => (
                    <div
                      key={pIdx}
                      className={`h-[8px] flex-1 rounded-full ${isActive ? 'bg-[#FF4726]' : 'bg-[#E5E5E5]'}`}
                    />
                  ))}
                </div>

                {/* Bottom: Subtitle & Desc */}
                <div>
                  <h4 className="text-lg lg:text-xl font-bold text-[#151619] mb-2">{feature.subtitle}</h4>
                  <p className="text-sm text-gray-600 leading-snug">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};

export default WhyUsPage;
