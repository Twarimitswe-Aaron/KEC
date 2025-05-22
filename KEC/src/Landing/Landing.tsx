import React from "react";
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
} from "../Routes";

const Landing = () => {
  return (
    <div className="bg-[#F2F2F2] font-robot overflow-x-hidden">
      <Header />
      <Hero />
      <Main />
      <FeaturedCourses />

      <WhatStudentsSay />
      <WhyUs />
      <CoreTeam />
      <FAQ />
      <JoinRwanda />
      <Footer />
    </div>
  );
};

export default Landing;
