import { cn } from "@/lib/utils";
import React from "react";

interface NoiseFilterProps {
  className?: string;
}

const NoiseFilter = ({ className }: NoiseFilterProps) => {
  return (
    <div className={cn("absolute inset-0", className)}>
      <svg>
        <filter id="noiseFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.6"
            stitchTiles="stitch"
          />
        </filter>
      </svg>
    </div>
  );
};

export default NoiseFilter;
