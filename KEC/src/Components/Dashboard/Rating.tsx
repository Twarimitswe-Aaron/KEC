import { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";

const feedbackText = ["Terrible", "Bad", "Okay", "Good", "Awesome"];

const Rating = () => {
  const [rating, setRating] = useState<number>(0);
  const [hovered, setHovered] = useState<number | null>(null);

  // Load saved rating
  useEffect(() => {
    const saved = localStorage.getItem("userRating");
    if (saved) setRating(Number(saved));
  }, []);

  // Save rating
  const handleRating = (value: number) => {
    setRating(value);
    localStorage.setItem("userRating", String(value));
  };

  return (
    <div className="bg-gradient-to-br justify-center text-center from-[#022F40] to-green-500 rounded-2xl p-5 w-full max-w-md shadow-lg flex flex-col items-center text-white">
      <h3 className="text-lg font-semibold mb-2">Rate your experience</h3>

      <div className="flex items-center gap-1 mb-2">
        {[...Array(5)].map((_, i) => {
          const value = i + 1;
          const isActive = (hovered ?? rating) >= value;

          return (
            <button
              key={i}
              onClick={() => handleRating(value)}
              onMouseEnter={() => setHovered(value)}
              onMouseLeave={() => setHovered(null)}
              className="focus:outline-none transition-transform duration-100 hover:scale-110 active:scale-95"
            >
              <FaStar
                className={`w-8 h-8 cursor-pointer transition-colors duration-200 ${
                  isActive ? "text-yellow-400" : "text-white/30"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Fixed space for feedback label */}
      <div className="h-5 text-sm font-medium text-yellow-100">
        {(hovered ?? rating) > 0 && feedbackText[(hovered ?? rating) - 1]}
      </div>

      {/* Fixed space for stored rating */}
      <div className="h-5 text-xs text-white/70">
        {rating > 0 && `You rated this app ${rating} out of 5 ⭐`}
      </div>
    </div>
  );
};

export default Rating;
