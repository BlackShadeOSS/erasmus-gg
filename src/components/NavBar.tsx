import React from "react";
import Link from "next/link";
import icon from "@/lib/icon.png";
import Image from "next/image";
import { cn } from "@/lib/utils";

const NavBar = () => {
  let linkClass: string =
    "border-2 border-neutral-700 text-center w-[19%] py-1.5 rounded-md text-stone-200 cursor-pointer";
  return (
    <header className="flex justify-center relative top-5 z-50">
      <div className="fixed w-1/3 h-13 bg-neutral-700/30 border-2 border-neutral-800 backdrop-blur-md opacity-100 rounded-lg flex justify-end items-center">
        <div className="bg-neutral-700/20 rounded-md w-12 h-11 mx-1 backdrop-blur-md">
          <Image src={icon} width={60} height={60} alt="icon of the " />
        </div>
        <nav className="w-10/11 float-right rounded-md backdrop-blur-2xl bg-neutral-700/20 h-11 mr-1 font-light capitalize">
          <ul className="flex justify-evenly items-center h-11">
            <li className={linkClass}>
              <Link href="/">dsadasda</Link>
            </li>
            <li className={linkClass}>
              <Link href="/">ddasdasds</Link>
            </li>
            <li className={linkClass}>
              <Link href="/">dasdsaa</Link>
            </li>
            <li className={linkClass}>
              <Link href="/">dadsasd</Link>
            </li>
            <li
              className={cn(
                linkClass,
                "bg-amber-200 text-neutral-800 border-0 ml-0.5 "
              )}
            >
              <Link href="/">Login</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default NavBar;
