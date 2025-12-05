import React from "react";
import rs from "../../public/radecky-studio-realizacja.svg";
import zs1 from "../../public/zs1-logo.png";
import uczniowie from "@/lib/logo-uczniowie.jpg";
import Image from "next/image";
import Link from "next/link";
import SocialCircle from "./SocialCircle";
import facebook from "@/lib/facebook-link.svg";
import ig from "@/lib/ig-link.svg";
import tiktok from "@/lib/tiktok-link.svg";
import { NavBarContent as FooterContent } from "@/data/NavBarContent";

const Footer = () => {
  const LinkStyle =
    "my-1 text-base sm:text-lg text-neutral-300 hover:text-amber-200 transition-colors duration-100";
  return (
    <footer className="w-full bg-neutral-900/70 border-t-2 border-neutral-800 flex flex-col">
      <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-8 sm:gap-10 py-8 sm:py-6 text-neutral-300">
        {/* Left: school logo + socials */}
        <div className="flex justify-center items-center gap-4 w-full sm:w-1/3 px-4">
          <Link
            href={"https://zs1.nowotarski.edu.pl/"}
            target="_blank"
            rel="noopener noreferrer"
            className="curson-pointer"
          >
            <Image
              src={zs1}
              alt="ZS1 Logo"
              width={100}
              height={100}
              className="object-contain mx-2"
            />
          </Link>
          <div className="flex flex-col items-center justify-center">
            <SocialCircle
              url="https://www.facebook.com/sokol.nowytarg/"
              altText="Facebook"
              icon={facebook}
            />
            <SocialCircle
              url="https://www.instagram.com/zs1nowytarg/"
              altText="Instagram"
              icon={ig}
            />
            <SocialCircle
              url="https://www.tiktok.com/@zs1.sokol"
              altText="TikTok"
              icon={tiktok}
            />
          </div>
        </div>
        {/* Center: EU / funding logo, large and visible */}
        <div className="w-full sm:w-1/3 flex flex-col items-center justify-center px-4 text-center">
          <div className="w-full max-w-3xl flex flex-col items-center">
            <Image
              src={uczniowie}
              alt="Logo projektu współfinansowanego ze środków UE"
              width={500}
              height={60}
              className="object-contain w-full max-h-24 drop-shadow-md"
              priority
            />
          </div>
        </div>

        {/* Right: nav links */}
        <div className="flex flex-col items-center w-full sm:w-1/3 mt-2 sm:mt-0 px-4 text-center gap-2">
          {FooterContent.navItems.map((item, index) => (
            <Link key={index} href={item.href} className={LinkStyle}>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      {/* Centered copyright, full width as before */}
      <div className="pb-4 flex justify-center items-center text-center">
        <p className="text-xs sm:text-sm text-neutral-400">
          &copy; 2025-{new Date().getFullYear()} Zespół Szkół nr 1 im.
          Władysława Orkana
        </p>
      </div>
      <div className="py-4 bg-neutral-950/20 flex justify-center items-center gap-2 border-t-2 border-neutral-800">
        <Link
          href="/realizacja"
          className="text-sm sm:text-md text-center text-amber-200 hover:text-stone-100 hover:underline transition-colors duration-200 flex items-center justify-center gap-2"
        >
          REALIZACJA PROJEKTU
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
