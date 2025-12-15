import React from "react";
import { motion } from "framer-motion";

interface AnimatedTextButtonProps {
    text: string;
    icon?: React.ReactNode;
    variant?: "primary" | "secondary";
    className?: string;
    onClick?: () => void;
}

export function AnimatedTextButton({
    text,
    icon,
    variant = "primary",
    className = "",
    onClick
}: AnimatedTextButtonProps) {
    const isPrimary = variant === "primary";
    const bgClass = isPrimary ? "bg-[#FF3700]" : "bg-[#151619]";
    const textClass = isPrimary ? "text-[#1A1A1A]" : "text-white";
    const iconBgClass = isPrimary ? "bg-[#1A1A1A]" : "bg-[#FF3700]";
    const iconColorClass = isPrimary ? "text-[#FF3700]" : "text-[#1A1A1A]";

    return (
        <motion.button
            initial="initial"
            whileHover="hovered"
            onClick={onClick}
            className={`relative cursor-pointer pl-2 pr-1 py-1 ml-5 rounded-full font-bold text-base shadow-[0px_7px_20px_0.5px_rgba(0,0,0,0.5)] ${bgClass} ${textClass} flex items-center gap-2 ${className}`}
        >
            <div className="relative overflow-hidden h-[1.25em] -mt-[2px] leading-none">
                <motion.span
                    variants={{
                        initial: { y: 0 },
                        hovered: { y: "-100%" },
                    }}
                    transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1] }}
                    className="block"
                >
                    {text}
                </motion.span>
                <motion.span
                    variants={{
                        initial: { y: "100%" },
                        hovered: { y: 0 },
                    }}
                    transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1] }}
                    className="absolute inset-0 block"
                >
                    {text}
                </motion.span>
            </div>
            {icon && (
                <div className={`p-[10px] rounded-full ${iconBgClass} ${iconColorClass} flex items-center justify-center`}>
                    <div className="relativer overflow-hidden grid place-items-center">
                        <motion.span
                            variants={{
                                initial: { x: 0 },
                                hovered: { x: "-100%" },
                            }}
                            transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1], delay: 0.05 }}
                            style={{ gridArea: "1/1" }}
                        >
                            {icon}
                        </motion.span>
                        <motion.span
                            variants={{
                                initial: { x: "100%" },
                                hovered: { x: 0 },
                            }}
                            transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1], delay: 0.05 }}
                            style={{ gridArea: "1/1" }}
                        >
                            {icon}
                        </motion.span>
                    </div>
                </div>
            )}
        </motion.button>
    );
}
