import React from "react";

interface GlowingCircleProps {
  isRight?: boolean;
}

const GlowingCircle = ({ isRight }: GlowingCircleProps) => {
  if (isRight) {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none hidden md:block bg-[radial-gradient(circle_farthest-side_at_100%_0,_#fdef7b26,_#fff0_65%)] absolute md:w-[50%] w-[60%] h-full -z-20 inset-[0_0_0_auto]"
      ></div>
    );
  } else {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none hidden md:block bg-[radial-gradient(circle_farthest-side_at_0_0,_#fdef7b26,_#fff0_65%)] absolute md:w-[50%] w-[60%] h-full -z-20 inset-0"
      ></div>
    );
  }
};

export default GlowingCircle;
