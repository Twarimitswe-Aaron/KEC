import { SiWhatsapp } from "react-icons/si";
import {
  CoreTeam,
  FAQ,
  FeaturedCourses,
  Footer,
  Header,
  Hero,
  JoinRwanda,
  Main,
  WhatStudentsSay,
  WhyUs,
  OtherBusinessesDescription,
} from "../Routes";
import KECServiceForm from "../Components/Landing/OtherBusinesses/OtherBusinesses";
import { ScrollReveal } from "../Components/Common/ScrollReveal";

const Landing = () => {
  return (
    <div className="font-robot w-full relative">
      <Header />
      <div className="w-full border-t border-gray-200" />
      <ScrollReveal>
        <Hero />
      </ScrollReveal>
      <div className="w-full border-t border-gray-200" />
      <ScrollReveal delay={0.1}>
        <Main />
      </ScrollReveal>
      <div className="w-full border-t border-gray-200" />
      <ScrollReveal delay={0.1}>
        <FeaturedCourses />
      </ScrollReveal>
      <div className="w-full border-t border-gray-200" />
      <ScrollReveal delay={0.1}>
        <WhatStudentsSay />
      </ScrollReveal>
      <div className="w-full border-t border-gray-200" />
      <ScrollReveal delay={0.1}>
        <WhyUs />
      </ScrollReveal>
      <div className="w-full border-t border-gray-200" />
      <ScrollReveal delay={0.1}>
        <OtherBusinessesDescription />
      </ScrollReveal>
      <div className="w-full border-t border-gray-200" />
      <ScrollReveal delay={0.1}>
        <KECServiceForm />
      </ScrollReveal>
      <div className="w-full border-t border-gray-200" />
      <ScrollReveal delay={0.1}>
        <CoreTeam />
      </ScrollReveal>
      <div className="w-full border-t border-gray-200" />
      <ScrollReveal delay={0.1}>
        <FAQ />
      </ScrollReveal>
      <div className="w-full border-t border-gray-200" />
      <ScrollReveal delay={0.1}>
        <JoinRwanda />
      </ScrollReveal>
      <div className="w-full border-t border-gray-200" />
      <Footer />

      {/* Global Bottom Blur Overlay */}
      <div className="fixed bottom-0 left-0 right-0 h-[150px] z-[100] pointer-events-none">
        <div style={{ position: "absolute", inset: "0px", overflow: "hidden" }}>
          <div style={{ opacity: 1, position: "absolute", inset: "0px", zIndex: 6, maskImage: "linear-gradient(rgba(0, 0, 0, 0) 62.5%, rgb(0, 0, 0) 75%, rgb(0, 0, 0) 87.5%, rgba(0, 0, 0, 0) 100%)", WebkitMaskImage: "linear-gradient(rgba(0, 0, 0, 0) 62.5%, rgb(0, 0, 0) 75%, rgb(0, 0, 0) 87.5%, rgba(0, 0, 0, 0) 100%)", backdropFilter: "blur(2px)" }} /> 
          <div style={{ opacity: 1, position: "absolute", inset: "0px", zIndex: 7, maskImage: "linear-gradient(rgba(0, 0, 0, 0) 75%, rgb(0, 0, 0) 87.5%, rgb(0, 0, 0) 100%)", WebkitMaskImage: "linear-gradient(rgba(0, 0, 0, 0) 75%, rgb(0, 0, 0) 87.5%, rgb(0, 0, 0) 100%)", backdropFilter: "blur(3px)" }} />
          <div style={{ opacity: 1, position: "absolute", inset: "0px", zIndex: 8, maskImage: "linear-gradient(rgba(0, 0, 0, 0) 87.5%, rgb(0, 0, 0) 100%)", WebkitMaskImage: "linear-gradient(rgba(0, 0, 0, 0) 87.5%, rgb(0, 0, 0) 100%)", backdropFilter: "blur(4px)" }} />
        </div>
      </div>

      <a
        href="https://wa.me/yourphonenumber"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full flex items-center justify-center bg-[#25D366] text-white shadow-lg transition-transform duration-300 hover:scale-110 hover:-translate-y-1 z-50"
      >
        <SiWhatsapp size={28} />
      </a>
    </div>
  );
};

export default Landing;
