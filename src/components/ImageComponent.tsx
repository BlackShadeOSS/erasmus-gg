import Image, { StaticImageData } from "next/image";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      <div
        className={`flex ${
          position === "right" ? "justify-end" : "justify-start"
        }`}
      >
        <div className="w-full md:w-4/5 lg:w-3/5">
          <Card
            className={`${
              position === "right"
                ? "shadow-[-10px_10px_32px_rgba(0,0,0,0.35)]"
                : "shadow-[10px_10px_32px_rgba(0,0,0,0.35)]"
            }`}
          >
            <CardHeader>
              <h2 className="text-2xl italic">{header}</h2>
            </CardHeader>
            <CardContent>
              <Image
                src={src}
                alt={alt}
                width={width}
                height={height}
                className="object-cover w-full h-full rounded-md  shadow-md"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ImageComponent;
