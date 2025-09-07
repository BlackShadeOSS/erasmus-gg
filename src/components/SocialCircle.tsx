import React from "react";
import Image, { ImageProps } from "next/image";
import { StaticImport } from "next/dist/shared/lib/get-img-props";

interface SocialCircleProps {
  url: string;
  altText: string;
  icon: StaticImport | string | ImageProps["src"];
  width?: number;
  height?: number;
  imgWidth?: number;
  imgHeight?: number;
  className?: string;
}

const SocialCircle: React.FC<SocialCircleProps> = ({
  url,
  altText,
  icon,
  width = 40,
  height = 40,
  className = "",
}) => {
  const iconW = Math.round(width * 0.6);
  const iconH = Math.round(height * 0.6);

  return (
    <a
      target="_blank"
      href={url}
      aria-label={altText}
      title={altText}
      style={{ width, height }}
      className={`inline-flex items-center my-1 justify-center rounded-full border-3 p-2 border-amber-200 hover:border-white bg-transparent transition-colors duration-200 cursor-pointer shrink-0 ${className}`}
    >
      <Image src={icon} alt={altText} width={iconW} height={iconH} />
      <span className="sr-only">{altText}</span>
    </a>
  );
};

export default SocialCircle;
