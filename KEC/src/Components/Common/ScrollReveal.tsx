import { motion } from "framer-motion";
import { ReactNode } from "react";

interface RevealProps {
    children: ReactNode;
    delay?: number;
}

export const ScrollReveal = ({ children, delay = 0 }: RevealProps) => {
    return (
        <motion.div
            initial={{ opacity: 0.3, y: 20, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "0px 0px -200px 0px" }}
            transition={{
                duration: 0.8,
                delay,
                ease: [0.25, 0.1, 0.25, 1],
            }}
        >
            {children}
        </motion.div>
    );
};
