import React from "react";
import "./App.css";
import { Tests, Header, Hero,Main,FeaturedCourses,WhatStudentsSay,WhyUs ,CoreTeam} from "./Routes";
import styles from "./Styles/styles";

const App = () => {
  return (
    <div className="bg-[#F2F2F2] overflow-x-hidden">
      <Header />
      <Hero />
      <Main/>
      <FeaturedCourses/>
      <WhatStudentsSay/>
      <WhyUs/>
      <CoreTeam/>
    </div>
  );
};

export default App;
