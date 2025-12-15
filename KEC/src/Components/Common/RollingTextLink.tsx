import { useState } from "react";
import { motion } from "framer-motion";
import { HashLink } from "react-router-hash-link";

interface RollingTextLinkProps {
    href: string;
    children: string;
    className?: string; // Allow passing text colors etc.
}

export const RollingTextLink = ({
    href,
    children,
    className = "",
}: RollingTextLinkProps) => {
    const [isHovered, setIsHovered] = useState(false);

    const DURATION = 0.25;
    const STAGGER = 0.025;

    // Determine if it's an external link
    const isExternal = href.startsWith("http");
    const Component = isExternal ? "a" : HashLink;
    const props = isExternal
        ? { href, target: "_blank", rel: "noopener noreferrer" }
        : { to: href, smooth: true };

    return (
        // @ts-ignore - Dynamic component typings can be tricky, suppressing for simplicity in this specific context
        <Component
            {...props}
            className={`relative block cursor-pointer overflow-hidden ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative z-10">
                <span className="sr-only">{children}</span>
                {/* Initial Text (Slides Up) */}
                <div className="flex" aria-hidden="true">
                    {children.split("").map((l, i) => (
                        <motion.span
                            key={i}
                            variants={{
                                initial: { y: 0 },
                                hovered: { y: "-100%" }, // Move UP out of view
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

                {/* Hover Text (Slides Up from Bottom) */}
                <div className="absolute inset-0 flex">
                    {children.split("").map((l, i) => (
                        <motion.span
                            key={i}
                            variants={{
                                initial: { y: "100%" }, // Start below
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
        </Component>
    );
};
