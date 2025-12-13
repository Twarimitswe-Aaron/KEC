import React from "react";
import { Monitor, Award, BookOpen, Video, Sparkles, Check } from "lucide-react";
import { motion } from "framer-motion";

// Importing existing images from your project
import heroImg from "/images/AzAdX1DYmhihXP38LmibbAVL8g8.jpg";
import ipadImg from "/images/ETCssBH90lwo0gbiqpQ7LHR8E.jpg";
import subHeroImg from "/images/hnVZOXiTRpBVsQ6SOl9xIaPVPRg.jpg";

type ServiceData = {
  icon: React.ReactNode;
  title: string;
  description: string;
  tags: string[];
  images: string[];
};

const serviceData: ServiceData[] = [
  {
    icon: <Monitor size={24} />,
    title: "Easy to use",
    description: "Our platform is simple and intuitive, helping all users quickly access tools and resources.",
    tags: ["User Friendly", "Quick Access", "Intuitive Design"],
    images: [heroImg, ipadImg, subHeroImg]
  },
  {
    icon: <BookOpen size={24} />,
    title: "Enroll in courses",
    description: "Browse top Mechanical Engineering courses and enroll easily after previewing the course content offered.",
    tags: ["Course Catalog", "Easy Enrollment", "Preview Content"],
    images: [ipadImg, subHeroImg, heroImg]
  },
  {
    icon: <Video size={24} />,
    title: "Learn online",
    description: "Watch engaging videos, complete quizzes and assignments, and monitor your learning progress throughout courses.",
    tags: ["Video Lessons", "Quizzes", "Progress Tracking"],
    images: [heroImg, ipadImg, subHeroImg]
  },
  {
    icon: <Award size={24} />,
    title: "Earn certificates",
    description: "Receive a certificate automatically when finishing a course to prove your skills and accomplishments.",
    tags: ["Certificates", "Achievements", "Recognition"],
    images: [subHeroImg, heroImg, ipadImg]
  }
];

const ImageCarousel = React.memo(({ images }: { images: string[] }) => {
  // Ensure we have enough slides for the "Previous" vs "Next" logic to work simultaneously without conflict
  // We need at least 3, better 4, to have: [Prev, Active, Next, Waiting]
  const displayImages = React.useMemo(() => {
    let result = [...images];
    while (result.length < 4) {
      result = [...result, ...images];
    }
    return result;
  }, [images]);

  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayImages.length);
    }, 7000); // 7s interval as requested
    return () => clearInterval(interval);
  }, [displayImages.length]);

  return (
    <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-md">
      <div className="relative w-full h-full rounded-2xl overflow-hidden">
        {displayImages.map((img, idx) => {

          const length = displayImages.length;
          // Standard circular difference: (idx - currentIndex + length) % length
          // 0 = Active, 1 = Next, length-1 = Previous
          const relativeIdx = (idx - currentIndex + length) % length;

          // Determine target position based on relative index
          let position = "calc(100% + 1rem)"; // Default: waiting on right with gap
          let zIndex = 0;
          let transitionDuration = 0; // Default: instant snap

          if (relativeIdx === 0) {
            // Active slide: At center
            position = "0%";
            zIndex = 10;
            transitionDuration = 1; // Fast entry
          } else if (relativeIdx === length - 1) {
            // Previous slide (just left): Move to left with gap
            position = "calc(-100% - 1rem)";
            zIndex = 5;
            transitionDuration = 1; // Fast exit
          }
          // All others stay at calc(100% + 1rem) (right) waiting to enter

          return (
            <motion.div
              key={idx}
              className="absolute inset-0 rounded-2xl overflow-hidden"
              initial={false}
              animate={{
                x: position,
                zIndex: zIndex
              }}
              transition={{
                duration: transitionDuration,
                ease: "linear"
              }}
            >
              <img
                src={img}
                alt={`Slide ${idx + 1}`}
                className="w-full h-full object-cover rounded-2xl"
              />
            </motion.div>
          );
        })}

        {/* Pagination dots */}
        <div
          className="absolute bottom-[14px] left-1/2 -translate-x-1/2 flex bg-[rgb(240,240,240)] rounded-[50px] select-none pointer-events-auto z-20"
        >
          {images.map((_, originalIdx) => {
            const isFirst = originalIdx === 0;
            const isLast = originalIdx === images.length - 1;

            // Replicate specific padding logic from user snippet
            // First: 7px 3.5px 7px 7px (pl-7 pr-3.5)
            // Last: 7px 7px 7px 3.5px (pl-3.5 pr-7)
            // Middle: 7px 3.5px (px-3.5)
            let paddingClass = "px-[3.5px]";
            if (isFirst) paddingClass = "pl-[7px] pr-[3.5px]";
            if (isLast) paddingClass = "pl-[3.5px] pr-[7px]";

            return (
              <button
                key={originalIdx}
                onClick={() => setCurrentIndex(originalIdx)}
                className={`border-none bg-transparent cursor-pointer m-0 py-[7px] flex items-center justify-center ${paddingClass}`}
                aria-label={`Scroll to page ${originalIdx + 1}`}
              >
                <div
                  className={`w-[7px] h-[7px] rounded-full bg-[rgb(21,22,25)] transition-opacity duration-300 ${currentIndex % images.length === originalIdx ? 'opacity-100' : 'opacity-50'
                    }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});

const ServiceCard = React.memo(({ service, index }: { service: ServiceData; index: number }) => {
  const isReversed = index % 2 === 1; // Reverse layout for even indices (0-based: 1, 3, 5...)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className="bg-[rgb(229,229,229)] rounded-3xl p-1"
    >
      <div className="">
        <div className={`flex flex-col md:flex-row gap-1 ${isReversed ? 'md:flex-row-reverse' : ''}`}>

          {/* Left: Text Content - Framer Style */}
          <div className="w-full md:w-1/2 bg-white rounded-3xl p-6 shadow-[rgba(0,0,0,0.08)_0px_0.602187px_0.602187px_-0.916667px,rgba(0,0,0,0.08)_0px_2.28853px_2.28853px_-1.83333px,rgba(0,0,0,0.07)_0px_10px_10px_-2.75px]">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="w-11 h-11 bg-[rgb(21,22,25)] rounded-lg flex items-center justify-center flex-shrink-0 text-[rgb(240,240,240)]">
                {service.icon}
              </div>

              {/* Title, Description & Tags Container */}
              <div className="flex-1">
                {/* Title & Description */}
                <div className="mb-3">
                  <h3 className="text-xl font-bold text-[rgb(21,22,25)] mb-2">
                    {service.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {service.tags.map((tag, idx) => (
                    <div
                      key={idx}
                      className="bg-[rgb(229,229,229)] rounded-lg px-2.5 py-1 flex items-center gap-1.5"
                    >
                      <Check size={14} className="text-[rgb(79,79,79)]" />
                      <span className="text-xs text-[rgb(79,79,79)]">{tag}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Image Carousel */}
          <motion.div
            className="w-full md:w-1/2"
            initial={{
              opacity: 0,
              x: isReversed ? -100 : 100 // Slide from left if reversed, right if normal
            }}
            whileInView={{
              opacity: 1,
              x: 0
            }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            <ImageCarousel images={service.images} />
          </motion.div>
        </div>

        {/* Horizontal Layout: Text Left, Image Right */}
      </div>
    </motion.div>
  );
});

const MainPage: React.FC = () => {
  return (
    <section
      id="main"
      className="w-[94%] mx-auto max-w-[1440px] py-12 md:py-16"
    >
      {/* Header Section */}
      <div className="mb-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[rgb(21,22,25)] text-white rounded-full mb-4">
          <span className="text-[rgb(255,71,38)] text-xs">//</span>
          <span className="text-xs font-medium">Process</span>
          <span className="text-[rgb(255,71,38)] text-xs">//</span>
        </div>

        {/* Heading */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[rgb(21,22,25)] max-w-2xl leading-tight">
            How We Help <span className="text-[rgb(79,79,79)]">Your Learning</span>
          </h2>
          <br />
          <p className="text-base text-gray-600 max-w-md">
            We combine strategy, speed, and skill to deliver exceptional education — every time.
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 gap-2">
        {serviceData.map((service, index) => (
          <ServiceCard key={index} service={service} index={index} />
        ))}
      </div>
    </section>
  );
};

export default MainPage;
