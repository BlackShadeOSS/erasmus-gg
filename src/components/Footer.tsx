import React from "react";
import rs from "../../public/radecky-studio-realizacja.svg";
import zs1 from "../../public/zs1-logo.png";
import Image from "next/image";
import Link from "next/link";
import SocialCircle from "./SocialCircle";
import facebook from "@/lib/facebook-link.svg";
import ig from "@/lib/ig-link.svg";
import tiktok from "@/lib/tiktok-link.svg";

const Footer = () => {
  const LinkStyle =
    "my-1 text-base sm:text-lg text-neutral-300 hover:text-amber-200 transition-colors duration-100";
  return (
    <footer className="w-full bg-neutral-900/70 border-t-2 border-neutral-800 flex flex-col">
      <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-6 sm:gap-0 py-8 sm:py-10 text-neutral-300">
        <div className="flex justify-center items-center w-full sm:w-1/4">
          <Image
            src={zs1}
            alt="ZS1 Logo"
            width={100}
            height={100}
            className="object-contain mx-8"
          />
          <div className="flex flex-col items-center justify-center">
            <SocialCircle
              url="https://www.instagram.com/"
              altText="Instagram"
              icon={facebook}
            />
            <SocialCircle
              url="https://www.tiktok.com/"
              altText="TikTok"
              icon={ig}
            />
            <SocialCircle
              url="https://www.facebook.com/"
              altText="Facebook"
              icon={tiktok}
            />
          </div>
        </div>
        <div className="w-full sm:w-2/4 flex flex-col items-center justify-center px-4 text-center">
          <p className="text-sm sm:text-base">
            &copy; 2025-{new Date().getFullYear()} Tu jakiees info o szkole i
            odnosnik do niej i jeszcze ig tiktok i facerbook
          </p>
        </div>
        <div className="flex flex-col items-center w-full sm:w-1/4">
          <Link href={"/"} className={LinkStyle}>
            Strona Główna
          </Link>
          <Link href={"/privacy-policy"} className={LinkStyle}>
            Szkoła
          </Link>
          <Link href={"/privacy-policy"} className={LinkStyle}>
            Logowanie
          </Link>
          <Link href={"/privacy-policy"} className={LinkStyle}>
            Rejestracja
          </Link>
        </div>
      </div>
      <div className="py-3 bg-neutral-950/20 flex justify-center items-center gap-2 border-t-2 border-neutral-800">
        <p className="text-sm sm:text-md text-center text-neutral-500">
          Realizacja: TT, KW, ZZ,
        </p>
        <Image src={rs} alt="Realizacja" width={80} />
      </div>
    </footer>
  );
};

export default Footer;
