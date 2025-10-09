"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import icon from "@/lib/NavIcon.svg";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { NavBarContent } from "@/data/NavBarContent";
import { useAuth } from "@/hooks/useAuth";

const NavBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, loading } = useAuth();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Dynamiczne menu items w zależności od statusu logowania
  const menuItems = useMemo(() => {
    if (loading) return NavBarContent.navItems;

    if (user) {
      // Użytkownik zalogowany - zastąp "Logowanie" i "Rejestracja" na "Panel"
      const dashboardPath =
        user.role === "admin" ? "/admin-panel" : "/dashboard";

      return [
        {
          label: "Strona główna",
          href: "/",
        },
        {
          label: "Szkoła",
          href: "https://zs1.nowotarski.edu.pl/",
        },
        {
          label: "Panel",
          href: dashboardPath,
          highlight: true,
        },
      ];
    }

    return NavBarContent.navItems;
  }, [user, loading]);

  const linkClass: string =
    "border-2 border-neutral-700 text-center w-full py-1.5 rounded-md text-stone-200 cursor-pointer text-base hover:bg-neutral-800/70 hover:text-white transition-all duration-200";

  // Dynamiczna szerokość w zależności od liczby elementów
  const getLinkWidth = () => {
    const itemCount = menuItems.length;
    if (itemCount === 3) return "w-[32%]"; // 3 przyciski dla zalogowanych
    if (itemCount === 4) return "w-[24%]"; // 4 przyciski dla niezalogowanych
    return "w-[24%]"; // domyślnie
  };

  return (
    <>
      <header className="flex justify-center fixed top-5 left-0 right-0 z-50 pointer-events-none">
        <div className="w-11/12 md:w-2/3 2xl:w-1/3 h-13 bg-neutral-700/30 border-0 sm:border-2 border-neutral-800 backdrop-blur-md rounded-lg flex justify-end items-center pointer-events-auto">
          <div className="bg-transparent sm:bg-neutral-700/20 rounded-md w-12 h-11 mx-1 backdrop-blur-md flex items-center justify-center">
            <Link href={"/"} className=" cursor-pointer">
              <Image src={icon} width={45} alt={NavBarContent.logoAlt} />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="w-19/20 float-right rounded-md backdrop-blur-2xl bg-neutral-700/20 h-11 mr-1 font-light capitalize hidden sm:block">
            <ul className="flex justify-evenly items-center h-11">
              {menuItems.map((item, index) => (
                <Link key={index} href={item.href} className={getLinkWidth()}>
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

          {/* Mobile Navigation */}
          <nav className="w-19/20 float-right rounded-md backdrop-blur-2xl bg-transparent h-11 mr-1 font-light capitalize block sm:hidden">
            <ul className="flex justify-end pr-2 items-center h-11">
              {/* Hamburger Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="w-8 h-8 flex flex-col justify-center items-center gap-1.5 focus:outline-none"
                aria-label="Toggle menu"
              >
                <span
                  className={cn(
                    "block w-6 h-0.5 bg-amber-200 transition-all duration-300 ease-in-out",
                    isMobileMenuOpen && "rotate-45 translate-y-2"
                  )}
                />
                <span
                  className={cn(
                    "block w-6 h-0.5 bg-amber-200 transition-all duration-300 ease-in-out",
                    isMobileMenuOpen && "opacity-0"
                  )}
                />
                <span
                  className={cn(
                    "block w-6 h-0.5 bg-amber-200 transition-all duration-300 ease-in-out",
                    isMobileMenuOpen && "-rotate-45 -translate-y-2"
                  )}
                />
              </button>
            </ul>
          </nav>
        </div>
      </header>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="fixed top-20 left-0 right-0 flex justify-center z-50 pointer-events-none">
          <div className="w-11/12 md:w-2/3 2xl:w-1/3 bg-neutral-700/30 border-0 sm:border-2 border-neutral-800 backdrop-blur-md rounded-lg sm:hidden animate-in slide-in-from-top duration-300 pointer-events-auto">
            <nav className="w-full p-3">
              <ul className="flex flex-col gap-2">
                {menuItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <li
                      className={cn(
                        linkClass,
                        item.highlight &&
                          "bg-amber-200 text-neutral-800 border-0 hover:bg-stone-200 hover:text-black"
                      )}
                    >
                      {item.label}
                    </li>
                  </Link>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default NavBar;
