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
