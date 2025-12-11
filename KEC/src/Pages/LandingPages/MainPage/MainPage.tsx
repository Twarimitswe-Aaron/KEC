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

const ImageCarousel = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative  aspect-[4/3] rounded-3xl overflow-hidden shadow-md">
      {images.map((img, idx) => (
        <motion.div
          key={idx}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: idx === currentIndex ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        >
          <img
            src={img}
            alt={`Slide ${idx + 1}`}
            className="w-full h-full object-cover"
          />
        </motion.div>
      ))}

      {/* Pagination dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-[rgb(240,240,240)] rounded-full px-2 py-1.5">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className="transition-opacity"
          >
            <div
              className={`w-1.5 h-1.5 rounded-full bg-[rgb(21,22,25)] transition-opacity ${idx === currentIndex ? 'opacity-100' : 'opacity-50'
                }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

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
          <div className="w-full md:w-1/2">
            <ImageCarousel images={service.images} />
          </div>
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
      className="w-[95%] max-w-[1440px] mx-auto px-6 py-12 md:py-16"
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
