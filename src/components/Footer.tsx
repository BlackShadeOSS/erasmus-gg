import React from "react";
import rs from "../../public/radecky-studio-realizacja.svg";
import zs1 from "../../public/zs1-logo.png";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  const LinkStyle =
    "my-1 text-lg text-neutral-300 hover:text-amber-200 transition-colors duration-100";
  return (
    <footer className="w-full h-72 bg-neutral-900/70 border-t-2 border-neutral-800 flex flex-col">
      <div className="flex flex-row items-center h-72 text-neutral-300">
        <div className="flex justify-center items-center w-1/5">
          <Image src={zs1} alt="ZS1 Logo" width={100} height={100} />
        </div>
        <div className="w-3/5 flex flex-col items-center justify-center">
          <p className="text-sm">
            &copy; 2025-{new Date().getFullYear()} Tu jakiees info o szkole i
            odnosnik do niej i jeszcze ig tiktok i facerbook
          </p>
        </div>
        <div className="flex flex-col items-center w-1/5">
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
      <div className="h-1/4 bg-neutral-950/20 flex justify-center items-center border-t-2 border-neutral-800">
        <p className="text-md text-center text-neutral-500">
          Realizacja: TT, KW, ZZ,{" "}
        </p>
        <Image src={rs} alt="Realizacja" width={80} />
      </div>
    </footer>
  );
};

export default Footer;
