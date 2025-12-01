import React, { useState, useEffect, useRef, TouchEvent } from "react";

interface CarouselProps {
  images: string[];
  autoPlay?: boolean;
  interval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  className?: string;
}

export const Carousel: React.FC<CarouselProps> = ({
  images,
  autoPlay = false,
  interval = 3000,
  showDots = true,
  showArrows = true,
  className = "",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      next();
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, autoPlay, interval]);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Touch/Mouse drag handlers
  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    const diff = clientX - startX;
    setTranslateX(diff);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (translateX > 50) {
      prev();
    } else if (translateX < -50) {
      next();
    }

    setTranslateX(0);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleDragEnd();
    }
  };

  // Touch events
  const handleTouchStart = (e: TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    handleDragMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  return (
    <div className={`carousel-container ${className}`}>
      <div
        ref={carouselRef}
        className="carousel-viewport"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          cursor: isDragging ? "grabbing" : "grab",
        }}
      >
        <div
          className="carousel-track"
          style={{
            transform: `translateX(calc(-${
              currentIndex * 100
            }% + ${translateX}px))`,
            transition: isDragging
              ? "none"
              : "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {images.map((image, index) => (
            <div
              key={index}
              className="carousel-slide"
              style={{
                opacity: Math.abs(currentIndex - index) > 1 ? 0 : 1,
                visibility:
                  Math.abs(currentIndex - index) > 1 ? "hidden" : "visible",
              }}
            >
              <img
                src={image}
                alt={`Slide ${index + 1}`}
                draggable={false}
                style={{ userSelect: "none" }}
              />
            </div>
          ))}
        </div>
      </div>

      {showArrows && images.length > 1 && (
        <>
          <button
            className="carousel-arrow carousel-arrow-left"
            onClick={prev}
            aria-label="Previous slide"
          >
            ‹
          </button>
          <button
            className="carousel-arrow carousel-arrow-right"
            onClick={next}
            aria-label="Next slide"
          >
            ›
          </button>
        </>
      )}

      {showDots && images.length > 1 && (
        <div className="carousel-dots">
          {images.map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${
                currentIndex === index ? "active" : ""
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
