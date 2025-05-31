import React from "react";
import clsx from "clsx";

interface SkeletonProps {
  width?: string;
  height?: string;
  rounded?: string;
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({
  width = "w-full",
  height = "h-4",
  rounded = "rounded",
  className = "",
}) => (
  <div
    className={clsx(
      "animate-pulse bg-gray-200",
      width,
      height,
      rounded,
      className
    )}
  />
);

export default Skeleton; 