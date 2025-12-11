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
                    className="absolute inset-0 rounded-full"
                    style={{
                        backgroundColor: "rgb(229, 229, 229)",
                        boxShadow: `
                            rgba(0, 0, 0, 0.08) 0px 0.602187px 0.421531px -0.833333px,
                            rgba(0, 0, 0, 0.08) 0px 2.28853px 1.60197px -1.66667px,
                            rgba(0, 0, 0, 0.08) 0px 10px 7px -2.5px,
                            rgba(0, 0, 0, 0.17) 0px 0.301094px 0.903281px -1.16667px inset,
                            rgba(0, 0, 0, 0.15) 0px 1.14427px 3.4328px -2.33333px inset,
                            rgba(0, 0, 0, 0.08) 0px 5px 15px -3.5px inset
                        `
                    }}
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
