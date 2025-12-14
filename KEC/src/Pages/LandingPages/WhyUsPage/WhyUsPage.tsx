import { FaLinkedinIn, FaInstagram, FaTwitter } from "react-icons/fa";
import { motion } from "framer-motion";

const WhyUsPage = () => {
  const smallFeatures = [
    {
      title: "Flex",
      subtitle: "Flexible Learning",
      description:
        "Learn through self-paced modules that fit your schedule. You can pause, revisit lessons, and progress without deadlines or penalties.",
      pills: [true, false, false, false]
    },
    {
      title: "100%",
      subtitle: "Interactive Courses",
      description:
        "Courses are built around practice, not videos alone. You work on guided exercises and real-world projects to learn by doing.",
      pills: [true, true, false, false]
    },
    {
      title: "Certs",
      subtitle: "Recognized Certificates",
      description:
        "Certificates are earned through practical assessments, proving real skills rather than simple course completion.",
      pills: [true, true, true, false]
    },
    {
      title: "#1",
      subtitle: "Career Growth",
      description:
        "Skills are aligned with real job requirements, helping learners move from training to practical career opportunities.",
      pills: [true, true, true, true]
    }
  ];



  return (
    <section id="whyUs" className="w-full ">
      <div className="w-[94%] mx-auto max-w-[1440px] py-12">

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
        <div className="grid grid-cols-1 lg:grid-cols-[30%_1fr] gap-[7px]">

          {/* Left Large Card - "Robert Park" Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative w-full h-[400px] lg:h-auto rounded-[24px] overflow-hidden group min-h-[400px]"
          >
            {/* Background Image */}
            <img
              src="/images/hnVZOXiTRpBVsQ6SOl9xIaPVPRg.jpg"
              alt="Shaphat"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* Overlay Info */}
            <div className="absolute inset-0 p-2 flex flex-col justify-end">

              {/* Content */}
              <div className="relative backdrop-blur-[10px] bg-[#00000014] p-4 rounded-[16px] z-10 flex items-end justify-between">

                {/* Text Wrapper */}
                <div className="flex flex-col gap-1">
                  <h4 className="text-white text-xl font-semibold tracking-tight">Shaphat</h4>
                  <p className="text-[#] text-sm font-medium">Founder of KEC</p>
                </div>


                {/* Social Icons Row */}
                <div className="flex rounded-md gap-2.5">
                  <a href="#" className="w-[30px] h-[30px] rounded-full bg-black/20 backdrop-blur-[10px] flex items-center justify-center hover:bg-black/30 transition-all border border-white/5">
                    <FaTwitter className="text-[#EBEBEB]" size={18} />
                  </a>
                  <a href="#" className="w-[30px] h-[30px] rounded-full bg-black/20 backdrop-blur-[10px] flex items-center justify-center hover:bg-black/30 transition-all border border-white/5">
                    <FaLinkedinIn className="text-[#EBEBEB]" size={18} />
                  </a>
                  <a href="#" className="w-[30px] h-[30px] rounded-full bg-black/20 backdrop-blur-[10px] flex items-center justify-center hover:bg-black/30 transition-all border border-white/5">
                    <FaInstagram className="text-[#EBEBEB]" size={18} />
                  </a>
                </div>

              </div>
            </div>
          </motion.div>

          {/* Right Column - 2x2 Grid - "Result Cards" Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 bg-[#e5e5e5] rounded-[20px] gap-[7px] p-[5px] lg:gap-1">
            {smallFeatures.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-[#F0F0F0] rounded-[16px] p-[13px] flex flex-col justify-between min-h-[200px] shadow-[0px_0.6px_0.9px_rgba(0,0,0,0.08),0px_2.3px_1.8px_rgba(0,0,0,0.08),0px_10px_10px_-2.75px_rgba(0,0,0,0.07)] hover:shadow-xl transition-all duration-300"
              >
                {/* Top: Big Title & Pills (Flex Row) */}
                <div className="flex flex-row items-center justify-between w-full mb-4">
                  <h3 className="text-4xl lg:text-5xl font-bold text-[#151619] tracking-tight">{feature.title}</h3>

                  {/* Highlighter Pills */}
                  {/* Highlighter Pills (Dots) */}
                  <div className="flex gap-1.5">
                    {feature.pills.map((isActive, pIdx) => (
                      <div
                        key={pIdx}
                        className={`size-2 rounded-full ${isActive ? 'bg-[#FF4726]' : 'bg-[#E5E5E5]'}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Bottom: Subtitle & Desc Merged */}
                <div className="mt-auto">
                  <p className="font-sans font-semibold text-[1.2rem] leading-[1.2em] tracking-[-0.05em] text-black text-left">
                    {feature.subtitle}. {feature.description}
                  </p>
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
