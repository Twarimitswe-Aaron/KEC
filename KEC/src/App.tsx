import React from "react";
import "./App.css";
import {
  Tests,
  Header,
  Hero,
  Main,
  FeaturedCourses,
  WhatStudentsSay,
  WhyUs,
  CoreTeam,
  FAQ,
  JoinRwanda,
  Footer
} from "./Routes";
import styles from "./Styles/styles";

const App = () => {
  return (
    <div className="bg-[#F2F2F2] font-Poppins overflow-x-hidden">
      <Header />
      <Hero />
      <Main />
      <FeaturedCourses />
      <WhatStudentsSay />
      <WhyUs />
      <CoreTeam />
      <FAQ />
      <JoinRwanda/>
      <Footer/>
    </div>
  );
};

export default App;
