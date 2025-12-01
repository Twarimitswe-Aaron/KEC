import React, { ReactNode, ButtonHTMLAttributes } from "react";

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  hoverEffect?: "scale" | "lift" | "glow";
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  className = "",
  variant = "primary",
  hoverEffect = "scale",
  ...props
}) => {
  const hoverClass =
    hoverEffect === "scale"
      ? "btn-hover-scale"
      : hoverEffect === "lift"
      ? "btn-hover-lift"
      : "btn-hover-glow";

  return (
    <button className={`${hoverClass} ${className}`} {...props}>
      {children}
    </button>
  );
};

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
  animateOnScroll?: boolean;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = "",
  hoverEffect = true,
  animateOnScroll = true,
}) => {
  const classes = [
    className,
    hoverEffect && "card-hover",
    animateOnScroll && "slide-up",
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classes}>{children}</div>;
};

interface AnimatedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  zoomOnHover?: boolean;
  wrapperClassName?: string;
}

export const AnimatedImage: React.FC<AnimatedImageProps> = ({
  zoomOnHover = true,
  wrapperClassName = "",
  className = "",
  ...props
}) => {
  if (!zoomOnHover) {
    return <img className={className} {...props} />;
  }

  return (
    <div className={`img-hover-zoom ${wrapperClassName}`}>
      <img className={className} {...props} />
    </div>
  );
};
