import { useEffect, useRef, useState } from "react";

interface ScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  delay?: number;
  once?: boolean;
}

export const useScrollAnimation = (options: ScrollAnimationOptions = {}) => {
  const {
    threshold = 0.1,
    rootMargin = "0px 0px -50px 0px",
    delay = 0,
    once = true,
  } = options;

  const elementRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setIsVisible(true);
              if (once && element) {
                observer.unobserve(element);
              }
            }, delay);
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, rootMargin, delay, once]);

  return { elementRef, isVisible };
};

// Hook for staggered animations
export const useStaggeredAnimation = (
  count: number,
  baseDelay: number = 100
) => {
  const [visibleIndexes, setVisibleIndexes] = useState<Set<number>>(new Set());
  const elementRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setVisibleIndexes(new Set(Array.from({ length: count }, (_, i) => i)));
      return;
    }

    const observers = elementRefs.current.map((element, index) => {
      if (!element) return null;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setTimeout(() => {
                setVisibleIndexes((prev) => new Set([...prev, index]));
                observer.disconnect();
              }, baseDelay * index);
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
      );

      observer.observe(element);
      return observer;
    });

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, [count, baseDelay]);

  const setRef = (index: number) => (element: HTMLElement | null) => {
    elementRefs.current[index] = element;
  };

  return { setRef, visibleIndexes };
};
