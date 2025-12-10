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
    <div className="font-robot px-10 overflow-x-hidden w-[95%] max-w-[1440px] mx-auto border-x border-gray-200  relative ">
      <Header />

      <Hero />
      <Main />
      <FeaturedCourses />
      <WhatStudentsSay />
      <WhyUs />
      <OtherBusinessesDescription />
      <KECServiceForm />
      <CoreTeam />
      <FAQ />
      <JoinRwanda />
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
