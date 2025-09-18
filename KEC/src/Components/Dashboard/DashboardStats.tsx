import { useState, useEffect, useContext, JSX } from "react";
import {
  FaMoneyBillWave,
  FaStar,
  FaGraduationCap,
  FaChartLine,
} from "react-icons/fa";
import { PiStudentDuotone } from "react-icons/pi";

import { UserRoleContext } from "../../UserRoleContext";

interface StatCard {
  label: string;
  value: string;
  icon: JSX.Element;
  bg: string;
  iconBg: string;
}

const chunk = (arr: StatCard[], size: number): StatCard[][] => {
  const out: StatCard[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

const DashboardStats = () => {
  const userRole = useContext(UserRoleContext);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  // visibleCards: how many cards are visible in the grid
  // carouselWindow: how many cards are included in the carousel buffer
  const [visibleCards, setVisibleCards] = useState<number>(3);
  const [carouselWindow, setCarouselWindow] = useState<number | "all">("all");
  const [belowMs, setBelowMs]=useState(false);

  // Base stat cards (mock data)
  const baseCards: StatCard[] = [
    {
      label: "Profit",
      value: "4.8/5",
      icon: <FaStar className="text-2xl text-white" />,
      bg: "bg-yellow-50",
      iconBg: "bg-yellow-500",
    },
    {
      label: "Expenses",
      value: "1200 USD",
      icon: <FaGraduationCap className="text-2xl text-white" />,
      bg: "bg-green-50",
      iconBg: "bg-green-500",
    },
    {
      label: "Students",
      value: "450",
      icon: <PiStudentDuotone className="text-2xl text-white" />,
      bg: "bg-slate-100",
      iconBg: "bg-gray-700",
    },
    {
      label: "Teachers",
      value: "30",
      icon: <FaChartLine className="text-2xl text-white" />,
      bg: "bg-blue-50",
      iconBg: "bg-blue-500",
    },
    {
      label: "Revenue",
      value: "9,800 USD",
      icon: <FaMoneyBillWave className="text-2xl text-white" />,
      bg: "bg-purple-50",
      iconBg: "bg-purple-600",
    },
    {
      label: "Courses",
      value: "45",
      icon: <PiStudentDuotone className="text-2xl text-white" />,
      bg: "bg-slate-100",
      iconBg: "bg-gray-700",
    },
  ];

  // Role-based filtering
  let statCards: StatCard[] = [];
  if (userRole === "admin") {
    statCards = baseCards;
  } else if (userRole === "teacher") {
    statCards = [
      {
        label: "Courses",
        value: "12",
        icon: <FaGraduationCap className="text-2xl text-white" />,
        bg: "bg-indigo-50",
        iconBg: "bg-indigo-500",
      },
      {
        label: "Users",
        value: "8",
        icon: <FaStar className="text-2xl text-white" />,
        bg: "bg-green-50",
        iconBg: "bg-green-500",
      },
      {
        label: "Certificates",
        value: "5",
        icon: <FaMoneyBillWave className="text-2xl text-white" />,
        bg: "bg-purple-50",
        iconBg: "bg-purple-600",
      },
      ...(
        belowMs ? [
          {
            label: "Average Score",
            value: "3",
            icon: <FaStar className="text-2xl text-white" />,
            bg: "bg-yellow-50",
            iconBg: "bg-yellow-500",
          }
        ] :[]
      )
    ];
  } else {
    // student
    statCards = [
      {
        label: "Ongoing Courses",
        value: "12",
        icon: <FaGraduationCap className="text-2xl text-white" />,
        bg: "bg-indigo-50",
        iconBg: "bg-indigo-500",
      },
      {
        label: "Completed Courses",
        value: "8",
        icon: <FaStar className="text-2xl text-white" />,
        bg: "bg-green-50",
        iconBg: "bg-green-500",
      },
      {
        label: "Certificates",
        value: "5",
        icon: <FaMoneyBillWave className="text-2xl text-white" />,
        bg: "bg-purple-50",
        iconBg: "bg-purple-600",
      },
      ...(
        belowMs ? [
          {
            label: "Average",
            value: "3",
            icon: <FaStar className="text-2xl text-white" />,
            bg: "bg-yellow-50",
            iconBg: "bg-yellow-500",
          }
        ] :[]
      )
    ];
  }

  // Layout decision: visibleCards and carouselWindow
  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) {
        // SMALL screens: show 2 visible, but carousel paginates over first 4 cards (2 slides)
        setVisibleCards(2);
        setBelowMs(true);
        setCarouselWindow(4);
      } else {
        // LARGE screens: show 3 visible, use all cards for carousel pagination
        setVisibleCards(3);
        setCarouselWindow("all");
      }
      setCurrentIndex(0); // reset index when layout changes
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Determine which cards are included in carousel window
  const carouselCards =
    carouselWindow === "all" ? statCards : statCards.slice(0, Math.min(statCards.length, carouselWindow));

  // Build slides by chunking with visibleCards (so each slide contains visibleCards items)
  const slides = chunk(carouselCards, visibleCards);
  // If there is only 1 slide, still render it; if none, return null
  if (slides.length === 0) return null;

  // Add clone for seamless looping
  const slidesWithClone = [...slides, slides[0]];

  // Auto slide every 4s (only if more than 1 slide)
  useEffect(() => {
    if (slidesWithClone.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
      setIsTransitioning(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [slidesWithClone.length]);

  // Reset to first slide when we reach the clone
  useEffect(() => {
    if (currentIndex === slidesWithClone.length - 1) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(0);
      }, 700); // match transition duration
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, slidesWithClone.length]);

  // Helper to pick grid-cols class
  const gridColsClass = visibleCards === 2 ? "grid-cols-2" : visibleCards === 3 ? "grid-cols-3" : "grid-cols-2";

  return (
    <div className="relative w-full max-w-4xl mx-auto overflow-hidden">
      <div
        className={`flex ${isTransitioning ? "transition-transform duration-700 ease-in-out" : ""}`}
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slidesWithClone.map((group, idx) => (
          <div key={idx} className={`flex-shrink-0 w-full grid gap-4 p-4 ${gridColsClass}`}>
            {group.map((card, subIdx) => (
              <div
                key={subIdx}
                className={`flex flex-col items-center justify-center rounded-xl p-4 ${card.bg}`}
              >
                <div className={`p-3 rounded-full mb-2 shadow-inner ${card.iconBg}`}>{card.icon}</div>
                <p className="text-sm font-medium text-gray-500">{card.label}</p>
                <p className="text-xl font-bold text-gray-800">{card.value}</p>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* dots (optional) */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrentIndex(idx);
              setIsTransitioning(true);
            }}
            className={`w-3 h-3 rounded-full ${idx === currentIndex % slides.length ? "bg-blue-600" : "bg-gray-300"}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default DashboardStats;
