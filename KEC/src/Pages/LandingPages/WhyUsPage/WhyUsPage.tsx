import React from "react";
import { Check, Star, TrendingUp, Award, Clock, Users } from "lucide-react";
import { motion } from "framer-motion";

const WhyUsPage = () => {
  return (
    <section id="whyUs" className="w-full py-12">
      {/* Header Section */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[rgb(21,22,25)] text-white rounded-full mb-4">
          <span className="text-[rgb(255,71,38)] text-xs">//</span>
          <span className="text-xs font-medium">Why Us</span>
          <span className="text-[rgb(255,71,38)] text-xs">//</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-[rgb(21,22,25)] tracking-tight">
          Proven results for <span className="text-gray-500">every student</span>
        </h2>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl">
          We combine strategy, speed, and skill to deliver exceptional education — every time.
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Left Column: Large Card (Expert Instructors) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative h-[400px] lg:h-auto bg-[rgb(21,22,25)] rounded-[32px] overflow-hidden p-8 flex flex-col justify-end group shadow-lg"
        >
          {/* Background Gradient/Image placeholder since we don't have the exact image yet */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10" />
          <div className="absolute inset-0 bg-gray-800 opacity-50 group-hover:scale-105 transition-transform duration-700" />

          <div className="relative z-20 text-white">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mb-4 text-[rgb(255,71,38)]">
              <Users size={24} />
            </div>
            <h3 className="text-2xl font-bold mb-2">Expert Instructors</h3>
            <p className="text-gray-300">
              Learn from industry professionals with real-world experience.
            </p>
          </div>
        </motion.div>

        {/* Right Column: 2x2 Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Card 1: Flexible Learning */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-[rgb(240,240,240)] rounded-[32px] p-8 min-h-[240px] flex flex-col justify-between hover:bg-white hover:shadow-lg transition-all duration-300"
          >
            <div className="flex justify-between items-start">
              <h3 className="text-3xl font-bold text-[rgb(21,22,25)]">Flex</h3>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-[rgb(255,71,38)]" />
                <div className="w-2 h-2 rounded-full bg-gray-300" />
                <div className="w-2 h-2 rounded-full bg-gray-300" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-1">Flexible Learning</h4>
              <p className="text-sm text-gray-600">Study at your own pace, on your schedule.</p>
            </div>
          </motion.div>

          {/* Card 2: Interactive Courses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[rgb(240,240,240)] rounded-[32px] p-8 min-h-[240px] flex flex-col justify-between hover:bg-white hover:shadow-lg transition-all duration-300"
          >
            <div className="flex justify-between items-start">
              <h3 className="text-3xl font-bold text-[rgb(21,22,25)]">100%</h3>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-[rgb(255,71,38)]" />
                <div className="w-2 h-2 rounded-full bg-[rgb(255,71,38)]" />
                <div className="w-2 h-2 rounded-full bg-[rgb(255,71,38)]" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-1">Interactive Courses</h4>
              <p className="text-sm text-gray-600">Engage with hands-on projects and real-world case studies.</p>
            </div>
          </motion.div>

          {/* Card 3: Recognized Certifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-[rgb(240,240,240)] rounded-[32px] p-8 min-h-[240px] flex flex-col justify-between hover:bg-white hover:shadow-lg transition-all duration-300"
          >
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[rgb(21,22,25)] shadow-sm">
                <Award size={24} />
              </div>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-[rgb(255,71,38)]" />
                <div className="w-2 h-2 rounded-full bg-gray-300" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-1">Recognized Certs</h4>
              <p className="text-sm text-gray-600">Earn valuable certificates to boost your career.</p>
            </div>
          </motion.div>

          {/* Card 4: Career Growth (Statistic style) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-[rgb(240,240,240)] rounded-[32px] p-8 min-h-[240px] flex flex-col justify-between hover:bg-white hover:shadow-lg transition-all duration-300"
          >
            <div className="flex justify-between items-start">
              <h3 className="text-3xl font-bold text-[rgb(21,22,25)]">#1</h3>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-[rgb(255,71,38)]" />
                <div className="w-2 h-2 rounded-full bg-[rgb(255,71,38)]" />
                <div className="w-2 h-2 rounded-full bg-[rgb(255,71,38)]" />
                <div className="w-2 h-2 rounded-full bg-[rgb(255,71,38)]" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-1">Career Growth</h4>
              <p className="text-sm text-gray-600">Gain the skills needed to excel and advance.</p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default WhyUsPage;
