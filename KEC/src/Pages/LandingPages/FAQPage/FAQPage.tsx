import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    id: 1,
    question: "What we do?",
    answer: "We offer hands-on training in tech and entrepreneurship.",
  },
  {
    id: 2,
    question: "We take students who knows nothing?",
    answer: "Yes! We train beginners from the ground up.",
  },
  {
    id: 3,
    question: "You must be a student to be our fellow?",
    answer: "Yes, student status is required to join.",
  },
  {
    id: 4,
    question: "Where do we take application of what we study?",
    answer: "In real-world projects, internships, and startup environments.",
  },
  {
    id: 5,
    question: "What we do?",
    answer: "We mentor, teach, and empower students in tech.",
  },
  {
    id: 6,
    question: "What we do?",
    answer: "Our goal is to prepare students for real industry roles.",
  },
];

export const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <section className="w-full py-16 bg-[#FAFAFA]" id="FAQ">
      <div className="w-[94%] mx-auto max-w-[1350px]">
        <div className="grid grid-cols-1 lg:grid-cols-[40%_1fr] gap-12 lg:gap-[50px]">
          {/* Left Side - Header */}
          <div className="flex flex-col justify-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#151619] text-white rounded-[25px] mb-6 w-fit"
            >
              <span className="text-[#FF4726] font-medium text-sm">//</span>
              <span className="text-sm font-medium tracking-wide">FAQs</span>
              <span className="text-[#FF4726] font-medium text-sm">//</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#151619] tracking-tight leading-[1.1] mb-4"
            >
              Questions<br />
              & <span className="text-[#4f4f4f]">answers.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-600 leading-relaxed font-medium"
            >
              Everything you need to know about<br />
              our design subscription service.
            </motion.p>
          </div>

          {/* Right Side - FAQ Accordion */}
          <div className="flex flex-col p-2 bg-[#e5e5e5] rounded-[17px] gap-2">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="cursor-pointer flex flex-col items-start w-full relative overflow-hidden"
                  style={{
                    backgroundColor: "#F0F0F0",
                    borderRadius: "16px",
                    boxShadow:
                      "rgba(0, 0, 0, 0.08) 0px 0.602187px 0.602187px -0.916667px, rgba(0, 0, 0, 0.08) 0px 2.28853px 2.28853px -1.83333px, rgba(0, 0, 0, 0.07) 0px 10px 10px -2.75px",
                    willChange: "transform",
                  }}
                >
                  {/* Content Wrapper */}
                  <div
                    className="flex flex-col bg-white items-center gap-6 w-full p-5 relative"
                    style={{ borderRadius: "10px" }}
                  >
                    {/* Question Row */}
                    <motion.button
                      onClick={() => setOpenIndex(isOpen ? -1 : index)}
                      className="w-full flex items-center justify-between"
                      whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                      transition={{ duration: 0.2 }}
                      style={{ backgroundColor: "transparent" }}
                    >
                      <p className="font-sans font-semibold text-[1.2rem] leading-[1.2em] tracking-[-0.05em] text-black text-left pr-4">
                        {faq.question}
                      </p>

                      {/* Icon Container */}
                      <div
                        className="flex-shrink-0 w-8 h-8 flex items-center justify-center relative"
                        style={{
                          backgroundColor: "#E5E5E5",
                          borderRadius: "30px",
                        }}
                      >
                        {/* Horizontal bar */}
                        <motion.div
                          className="absolute rounded-full"
                          style={{ width: "12px", height: "2px", borderRadius: "10px" }}
                          animate={{
                            backgroundColor: isOpen ? "#FF3700" : "#151619",
                          }}
                          transition={{ duration: 0.3 }}
                        />
                        {/* Vertical bar */}
                        <motion.div
                          className="absolute rounded-full"
                          style={{
                            width: "2px",
                            height: "12px",
                            borderRadius: "10px",
                          }}
                          animate={{
                            backgroundColor: isOpen ? "#FF3700" : "#151619",
                            opacity: isOpen ? 0 : 1,
                            rotate: isOpen ? 90 : 0,
                          }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </motion.button>

                    {/* Answer Section */}
                    <AnimatePresence initial={false} mode="wait">
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{
                            height: "auto",
                            opacity: 1,
                            transition: {
                              height: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
                              opacity: { duration: 0.35, ease: "easeOut", delay: 0.1 },
                            },
                          }}
                          exit={{
                            height: 0,
                            opacity: 0,
                            transition: {
                              height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
                              opacity: { duration: 0.2, ease: "easeIn" },
                            },
                          }}
                          className="w-full overflow-hidden"
                          style={{
                            borderTop: "1px solid rgba(0, 0, 0, 0.15)",
                            borderBottom: "0px",
                            borderLeft: "0px",
                            borderRight: "0px",
                            willChange: "transform",
                          }}
                        >
                          <motion.div
                            initial={{ y: -15, opacity: 0 }}
                            animate={{
                              y: 0,
                              opacity: 1,
                              transition: {
                                y: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
                                opacity: { duration: 0.35, ease: "easeOut", delay: 0.15 },
                              },
                            }}
                            exit={{
                              y: -10,
                              opacity: 0,
                              transition: {
                                duration: 0.2,
                                ease: "easeIn",
                              },
                            }}
                            className="pt-6"
                          >
                            <p
                              className="text-left"
                              style={{
                                fontFamily: "Inter, sans-serif",
                                fontWeight: 500,
                                fontSize: "1rem",
                                letterSpacing: "-0.035em",
                                lineHeight: "1.3em",
                                color: "#707070",
                                textDecoration: "none",
                                textTransform: "none",
                              }}
                            >
                        {faq.answer}
                            </p>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQPage;