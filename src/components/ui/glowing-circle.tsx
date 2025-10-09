import React from "react";
import { cn } from "@/lib/utils";
interface GlowingCircleProps {
  isRight?: boolean;
  mobile?: boolean;
  className?: string;
}

const GlowingCircle = ({
  isRight,
  className,
  mobile = false,
}: GlowingCircleProps) => {
  if (isRight) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none hidden md:block bg-[radial-gradient(circle_farthest-side_at_100%_0,_#fdef7b26,_#fff0_65%)] absolute md:w-[50%] w-[60%] h-full -z-20 inset-[0_0_0_auto]",
          className
        )}
      ></div>
    );
  } else if (mobile) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none md:hidden bg-[radial-gradient(circle_farthest-side_at_50%_0,_#fdef7b26,_#fff0_65%)] absolute w-full h-[600px] opacity-90 -z-20 left-0 top-0",
          className
        )}
      ></div>
    );
  } else {
    return (
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none hidden md:block bg-[radial-gradient(circle_farthest-side_at_0_0,_#fdef7b26,_#fff0_65%)] absolute md:w-[50%] w-[60%] h-full -z-20 inset-0",
          className
        )}
      ></div>
    );
  }
};

export default GlowingCircle;
