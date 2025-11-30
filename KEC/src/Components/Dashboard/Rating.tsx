import { useState, useEffect } from "react";
import {
  useGetRatingQuery,
  useSubmitRatingMutation,
} from "../../state/api/authApi";
import { toast } from "react-toastify";

const feedbackText = ["Terrible", "Bad", "Okay", "Good", "Awesome"];

const Rating = () => {
  const { data: ratingData } = useGetRatingQuery();
  const [submitRating] = useSubmitRatingMutation();

  const [rating, setRating] = useState<number>(0);
  const [hovered, setHovered] = useState<number | null>(null);

  // Sync with backend data
  useEffect(() => {
    if (ratingData?.score) {
      setRating(ratingData.score);
    }
  }, [ratingData]);

  const handleRating = async (value: number) => {
    setRating(value);
    try {
      await submitRating({ score: value }).unwrap();
      toast.success("Thanks for your feedback!");
    } catch (error) {
      console.error("Failed to submit rating:", error);
      toast.error("Failed to save rating");
    }
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
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 576 512"
                className={`w-8 h-8 cursor-pointer transition-colors duration-200 ${
                  isActive ? "text-yellow-400" : "text-white/30"
                }`}
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"></path>
              </svg>
            </button>
          );
        })}
      </div>
      <div className="h-5 text-sm font-medium text-yellow-100">
        {(hovered ?? rating) > 0 && feedbackText[(hovered ?? rating) - 1]}
      </div>
      <div className="h-5 text-xs text-white/70">
        {rating > 0 && `You rated this app ${rating} out of 5 ⭐`}
      </div>
    </div>
  );
};

export default Rating;
