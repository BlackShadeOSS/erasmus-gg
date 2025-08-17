import React from "react";
import Link from "next/link";
import icon from "@/lib/NavIcon.svg";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { NavBarContent } from "@/data/NavBarContent";

const NavBar = () => {
  const linkClass: string =
    "border-2 border-neutral-700 text-center w-full py-1.5 rounded-md text-stone-200 cursor-pointer text-base hover:bg-neutral-800/70 hover:text-white transition-all duration-200";
  return (
    <header className="flex justify-center relative top-5 z-50">
      <div className="fixed w-1/3 h-13 bg-neutral-700/30 border-2 border-neutral-800 backdrop-blur-md rounded-lg flex justify-end items-center">
        <div className="bg-neutral-700/20 rounded-md w-12 h-11 mx-1 backdrop-blur-md flex items-center justify-center">
          <Image src={icon} width={45} alt={NavBarContent.logoAlt} />
        </div>
        <nav className="w-19/20 float-right rounded-md backdrop-blur-2xl bg-neutral-700/20 h-11 mr-1 font-light capitalize">
          <ul className="flex justify-evenly items-center h-11">
            {NavBarContent.navItems.map((item, index) => (
              <Link key={index} href={item.href} className="w-[24%]">
                <li
                  className={cn(
                    linkClass,
                    item.highlight &&
                      "bg-amber-200 text-neutral-800 border-0 ml-0.5 hover:bg-stone-200 hover:text-black"
                  )}
                >
                  {item.label}
                </li>
              </Link>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default NavBar;
