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

const Landing = () => {
  return (
    <div className="font-robot w-full relative">
      <Header />
      <div className="w-full border-t border-gray-200" />
      <Hero />
      <div className="w-full border-t border-gray-200" />
      <Main />
      <div className="w-full border-t border-gray-200" />
      <FeaturedCourses />
      <div className="w-full border-t border-gray-200" />
      <WhatStudentsSay />
      <div className="w-full border-t border-gray-200" />
      <WhyUs />
      <div className="w-full border-t border-gray-200" />
      <OtherBusinessesDescription />
      <div className="w-full border-t border-gray-200" />
      <KECServiceForm />
      <div className="w-full border-t border-gray-200" />
      <CoreTeam />
      <div className="w-full border-t border-gray-200" />
      <FAQ />
      <div className="w-full border-t border-gray-200" />
      <JoinRwanda />
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
