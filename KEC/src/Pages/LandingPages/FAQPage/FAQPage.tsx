import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    id: 1,
    question: "How does the subscription model work?",
    answer: "You pay a fixed monthly fee and get access to a dedicated design team. Submit unlimited requests, and we’ll deliver them one by one (or two at a time with the Pro plan). No hourly billing, no contracts — cancel or pause anytime.",
  },
  {
    id: 2,
    question: "What kind of design tasks can I request?",
    answer: "You can request a wide range of design tasks including UI/UX design, branding, illustrations, and marketing assets.",
  },
  {
    id: 3,
    question: "How fast will I receive my designs?",
    answer: "Most requests are delivered within 24-48 hours. complex tasks may take slightly longer.",
  },
  {
    id: 4,
    question: "What tools do you use to manage the work?",
    answer: "We use standard industry tools like Figma, Trello, and Slack for seamless management and communication.",
  },
  {
    id: 5,
    question: "Is there a limit to how many requests I can make?",
    answer: "No limits! You can keep the queue full and we'll work through them systematically.",
  },
  {
    id: 6,
    question: "Can I cancel or pause anytime?",
    answer: "Yes, our service is flexible. You can pause or cancel your subscription at any time without penalty.",
  },
];

export const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <section className="w-full py-16 bg-white" id="FAQ">
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
                  layout
                  key={faq.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ layout: { type: "spring", stiffness: 300, damping: 30 }, duration: 0.3 }}
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="w-full relative overflow-hidden cursor-pointer"
                  style={{
                    backgroundColor: "#F0F0F0",
                    borderRadius: "16px",
                    boxShadow: "rgba(0, 0, 0, 0.08) 0px 0.602187px 0.602187px -0.916667px, rgba(0, 0, 0, 0.08) 0px 2.28853px 2.28853px -1.83333px, rgba(0, 0, 0, 0.07) 0px 10px 10px -2.75px",
                  }}
                >
                  <motion.div
                    layout="position"
                    className="flex bg-white flex-col p-5"
                  >
                    {/* Header Row */}
                    <div className="flex items-center justify-between w-full">
                      <h3 className="font-sans font-semibold text-[1.2rem] text-[#151619] text-left pr-4 leading-[1.2em] tracking-[-0.05em]">
                        {faq.question}
                      </h3>

                      {/* Icon */}
                      <div
                        className="flex-shrink-0 w-8 h-8 flex items-center justify-center relative rounded-full bg-[#E5E5E5]"
                      >
                        <motion.div
                          className="absolute rounded-full bg-[#FF3700]"
                          style={{ width: "12px", height: "2px" }}
                        />
                        <motion.div
                          className="absolute rounded-full bg-[#FF3700]"
                          style={{ width: "2px", height: "12px" }}
                          animate={{ rotate: isOpen ? 90 : 0, opacity: isOpen ? 0 : 1 }}
                          transition={{ duration: 0.2 }}
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <AnimatePresence mode="wait" initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            height: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2, delay: 0.1 }
                          }}
                          className="w-full overflow-hidden"
                        >
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.15 }}
                            exit={{ opacity: 0 }}
                            className="w-full h-[1px] bg-black mt-4 mb-4"
                          />
                          <p className="text-[#707070] text-base leading-relaxed font-sans font-medium text-left">
                            {faq.answer}
                          </p>
                          <div className="h-2"></div> {/* Bottom padding compensation */}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
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