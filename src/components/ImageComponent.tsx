import Image, { StaticImageData } from "next/image";
import React from "react";

interface ImageComponentProps {
  header: string;
  src: StaticImageData;
  alt: string;
  width?: number;
  height?: number;
  position?: "left" | "right";
}

const ImageComponent: React.FC<ImageComponentProps> = ({
  header,
  src,
  alt,
  width,
  height,
  position = "left",
}) => {
  return (
    <div className="p-4 md:p-8 flex flex-col gap-8 max-w-6xl mx-auto transition-transform duration-300 ease-in-out hover:scale-102">
      <h2
        className={`text-3xl font-light italic drop-shadow-lg drop-shadow-amber-200/20 ${
          position === "right" ? "text-right" : "text-left"
        }`}
      >
        {header}
      </h2>

      <div
        className={`flex ${
          position === "right" ? "justify-end" : "justify-start"
        }`}
      >
        <div className="w-full md:w-4/5 lg:w-3/5">
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className="object-cover w-full rounded-md shadow-2xl shadow-amber-200/30 "
          />
        </div>
      </div>
    </div>
  );
};

export default ImageComponent;
