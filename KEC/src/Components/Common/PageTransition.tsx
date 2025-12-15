import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
    children: ReactNode;
    className?: string;
}

const PageTransition = ({ children, className = "" }: PageTransitionProps) => {
    return (
        <motion.div
            initial={{ y: "50vh", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100vh", opacity: 0 }}
            transition={{
                duration: 0.75,
                ease: [0.7, 0, 0.3, 1],
                opacity: { duration: 0.4 }
            }}
            className={`absolute top-0 left-0 w-full min-h-screen z-[200] ${className}`}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
