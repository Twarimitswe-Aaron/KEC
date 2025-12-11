import { useState } from "react";
import { motion } from "framer-motion";
import { HashLink } from "react-router-hash-link";

interface AnimatedNavLinkProps {
    to: string;
    text: string;
    className?: string;
    onClick?: () => void;
}

export const AnimatedNavLink = ({
    to,
    text,
    className = "",
    onClick,
    isActive = false,
}: AnimatedNavLinkProps & { isActive?: boolean }) => {
    const [isHovered, setIsHovered] = useState(false);

    const DURATION = 0.25;
    const STAGGER = 0.025;

    return (
        <HashLink
            smooth
            to={to}
            onClick={onClick}
            className={`relative block cursor-pointer ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {isActive && (
                <motion.div
                    layoutId="active-nav-pill"
                    className="absolute inset-0 bg-white/50 rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            )}
            <div className="relative overflow-hidden z-10">
                <span className="sr-only">{text}</span>
                <div className="flex" aria-hidden="true">
                    {text.split("").map((l, i) => (
                        <motion.span
                            key={i}
                            variants={{
                                initial: { y: 0 },
                                hovered: { y: "100%" },
                            }}
                            animate={isHovered ? "hovered" : "initial"}
                            transition={{
                                duration: DURATION,
                                ease: "easeInOut",
                                delay: STAGGER * i,
                            }}
                            className="inline-block"
                        >
                            {l === " " ? "\u00A0" : l}
                        </motion.span>
                    ))}
                </div>
                <div className="absolute inset-0 flex">
                    {text.split("").map((l, i) => (
                        <motion.span
                            key={i}
                            variants={{
                                initial: { y: "-100%" },
                                hovered: { y: 0 },
                            }}
                            animate={isHovered ? "hovered" : "initial"}
                            transition={{
                                duration: DURATION,
                                ease: "easeInOut",
                                delay: STAGGER * i,
                            }}
                            className="inline-block"
                        >
                            {l === " " ? "\u00A0" : l}
                        </motion.span>
                    ))}
                </div>
            </div>
        </HashLink>
    );
};
