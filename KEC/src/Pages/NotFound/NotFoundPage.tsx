import React from "react";
import { FaArrowRight } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { Header, Footer } from "../../Routes";
import { AnimatedTextButton } from "../../Components/Common/AnimatedTextButton";
import { motion } from "framer-motion";

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ y: "120vh" }} // Start slightly further down to ensure cleared
            animate={{ y: 0 }}
            exit={{ y: "120vh" }}
            transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }} // smooth cubic-bezier or similar "out" curve
            className="font-sans w-full relative min-h-screen flex flex-col justify-between bg-[#F0F0F0]"
        >
            <Header />

            <div className="w-full border-t border-gray-200" />

            <div className="w-[95%] max-w-[1440px] mx-auto border-x border-gray-200 flex-grow flex flex-col items-center justify-center font-sans px-4 py-20">
                <div className="flex flex-col items-center text-center max-w-lg gap-[25px]">
                    <h1 className="text-[80px] md:text-[100px] font-bold text-[#151619] tracking-tight leading-none">
                        Error 404
                    </h1>
                    <h3 className="text-[1.6rem] font-bold text-black tracking-[-0.05em] leading-[1.1em]">
                        Ooops! Page Not Found
                    </h3>
                    <p className="text-[#707070] font-sans font-semibold text-[1.2rem] max-w-md mx-auto tracking-[-0.035em] leading-[1.35em]">
                        Oops! The page you're looking for doesn't exist. It may have been moved, deleted, or never existed.
                    </p>

                    <AnimatedTextButton
                        text="Back to home"
                        icon={<FaArrowRight />}
                        variant="secondary"
                        onClick={() => navigate("/")}
                        className="!ml-0 !text-lg !py-[7px] !pl-[21px] !pr-[7px] !bg-[#212121] shadow-[0px_7px_20px_0.5px_rgba(0,0,0,0.5)]"
                    />
                </div>
            </div>

            <div className="w-full border-t border-gray-200" />
            <Footer />
        </motion.div>
    );
};

export default NotFoundPage;
