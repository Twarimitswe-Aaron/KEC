import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../Components/Header.tsx";
import Footer from "../Components/Footer.tsx";

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
