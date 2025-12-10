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
  OtherBusinessesDescription,
} from "../Routes";
import KECServiceForm from "../Components/Landing/OtherBusinesses/OtherBusinesses";
import { AnimatedSection } from "../Components/Common/AnimatedSection";
import "../styles/animations.css";

const Landing = () => {
  return (
    <div className="font-robot overflow-x-hidden w-[95%] max-w-[1440px] mx-auto border-x border-gray-200 bg-white relative shadow-sm">
      <Header />

      <AnimatedSection animationType="fade-in">
        <Hero />
      </AnimatedSection>

      <AnimatedSection animationType="slide-up" delay={100}>
        <Main />
      </AnimatedSection>

      <AnimatedSection animationType="slide-up" delay={150}>
        <FeaturedCourses />
      </AnimatedSection>

      <AnimatedSection animationType="slide-up" delay={100}>
        <WhatStudentsSay />
      </AnimatedSection>

      <AnimatedSection animationType="slide-up" delay={100}>
        <WhyUs />
      </AnimatedSection>

      <AnimatedSection animationType="slide-up" delay={100}>
        <OtherBusinessesDescription />
      </AnimatedSection>

      <AnimatedSection animationType="slide-up" delay={100}>
        <KECServiceForm />
      </AnimatedSection>

      <AnimatedSection animationType="slide-up" delay={100}>
        <CoreTeam />
      </AnimatedSection>

      <AnimatedSection animationType="slide-up" delay={100}>
        <FAQ />
      </AnimatedSection>

      <AnimatedSection animationType="slide-up" delay={100}>
        <JoinRwanda />
      </AnimatedSection>

      <Footer />
    </div>
  );
};

export default Landing;
