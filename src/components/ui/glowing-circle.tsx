import React from "react";

interface GlowingCircleProps {
  isRight?: boolean;
}

const GlowingCircle = ({ isRight }: GlowingCircleProps) => {
  if (isRight) {
    return (
      <div className="bg-[radial-gradient(circle_farthest-side_at_100%_0,_#fdef7b26,_#fff0_65%)] absolute w-[50%] h-[100%] -z-20 inset-[0_0_0_auto]"></div>
    );
  } else {
    return (
      <div className="bg-[radial-gradient(circle_farthest-side_at_0_0,_#fdef7b26,_#fff0_65%)] absolute w-[50%] h-[100%] -z-20 inset-[0%_0%_0%_0%]"></div>
    );
  }
};

export default GlowingCircle;
