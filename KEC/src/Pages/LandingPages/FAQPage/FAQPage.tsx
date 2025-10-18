import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa"; // Install: npm i react-icons

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
  const [openId, setOpenId] = useState<number | null>(null);

  const toggle = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="w-full mx-auto my-10 px-4 font-roboto" id="FAQ">
      <div className="my-10">
        <h2 className="sm:text-3xl text-[22px] mx-auto text-center font-bold mb-4">
          Frequently Asked Questions
        </h2>
      </div>
      {faqs.map(({ id, question, answer }) => {
        const isOpen = openId === id;
        return (
          <div
            key={id}
            className="mb-4 rounded-lg shadow-md bg-white transition-all"
          >
            <button
              onClick={() => toggle(id)}
              className="w-full flex justify-between items-center px-6 py-4 text-left text-lg font-medium"
            >
              <span className="sm:text-[13px] md:text-[16px] text-sm lg:text-lg">
                {question}
              </span>
              <FaChevronDown
                className={`text-sm transition-transform duration-300 cursor-pointer ${
                  isOpen ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-6 pb-4 text-gray-600 transition-all duration-300">
                {answer}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
};

export default FAQPage;