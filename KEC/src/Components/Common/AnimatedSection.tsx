import React, { ReactNode } from "react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

// Animated section wrapper for scroll-triggered animations

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  animationType?:
    | "slide-up"
    | "fade-in"
    | "slide-left"
    | "slide-right"
    | "scale-in";
  delay?: number;
  once?: boolean;
}

export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className = "",
  animationType = "slide-up",
  delay = 0,
  once = true,
}) => {
  const { elementRef, isVisible } = useScrollAnimation({ delay, once });

  return (
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className={`${animationType} ${isVisible ? "visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
};

interface AnimatedCardGridProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
}

export const AnimatedCardGrid: React.FC<AnimatedCardGridProps> = ({
  children,
  className = "",
  staggerDelay = 100,
}) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <AnimatedSection
          key={index}
          animationType="slide-up"
          delay={index * staggerDelay}
        >
          {child}
        </AnimatedSection>
      ))}
    </div>
  );
};
