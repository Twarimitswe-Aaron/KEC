import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../Landing/Header.tsx";
import Footer from "../Landing/Footer.tsx";

const MainLayout = () => {
  return (
    <div className="bg-[#F2F2F2] font-roboto overflow-x-hidden">
      <Header />
      <Outlet /> {/* Render child route here */}
      <Footer />
    </div>
  );
};

export default MainLayout;
