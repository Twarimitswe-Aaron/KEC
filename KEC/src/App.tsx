import React from "react";
import "./App.css";
import { Tests, Header, Hero,Main } from "./Routes";
import styles from "./Styles/styles";

const App = () => {
  return (
    <div className="bg-[#F2F2F2]">
      <Header />
      <Hero />
      <Main/>
    </div>
  );
};

export default App;
