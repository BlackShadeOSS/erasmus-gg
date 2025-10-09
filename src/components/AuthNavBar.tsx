"use client";

import React from "react";
import Link from "next/link";
import NavIconSvg from "@/components/NavIconSvg";
import { ArrowLeft, LayoutDashboard } from "lucide-react";

interface AuthNavBarProps {
  showBackToLogin?: boolean;
  showDashboard?: boolean;
  inline?: boolean; // dla sidebara
}

const AuthNavBar = ({
  showBackToLogin = true,
  showDashboard = false,
  inline = false,
}: AuthNavBarProps) => {
  if (inline) {
    // Wersja inline dla sidebara
    return (
      <div className="w-fit h-13 bg-neutral-700/30 border-0 sm:border-2 border-neutral-800 backdrop-blur-md rounded-lg flex gap-1 items-center px-1 py-1 mb-4">
        {/* Logo - powrót do strony głównej */}
        <Link
          href="/"
          className="bg-transparent sm:bg-neutral-700/20 rounded-md w-12 h-11 backdrop-blur-md flex items-center justify-center hover:bg-neutral-700/40 transition-all duration-200 group"
          title="Powrót do strony głównej"
        >
          <NavIconSvg />
        </Link>

        {/* Dashboard - powrót do dashboardu */}
        {showDashboard && (
          <Link
            href="/dashboard"
            className="bg-neutral-700/20 rounded-md w-12 h-11 backdrop-blur-md flex items-center justify-center hover:bg-neutral-700/40 transition-all duration-200 group"
            title="Powrót do dashboardu"
          >
            <LayoutDashboard
              size={24}
              className="text-amber-600 group-hover:text-amber-700 transition-colors duration-200"
            />
          </Link>
        )}

        {/* Strzałka - powrót do logowania */}
        {showBackToLogin && (
          <Link
            href="/login"
            className="bg-neutral-700/20 rounded-md w-12 h-11 backdrop-blur-md flex items-center justify-center hover:bg-neutral-700/40 transition-all duration-200 group"
            title="Powrót do logowania"
          >
            <ArrowLeft
              size={24}
              className="text-amber-600 group-hover:text-amber-700 transition-colors duration-200"
            />
          </Link>
        )}
      </div>
    );
  }

  // Wersja fixed dla innych stron (np. gra pamięć)
  return (
    <header className="flex justify-start fixed top-5 left-5 z-50 pointer-events-none">
      <div className="w-auto h-13 bg-neutral-700/30 border-0 sm:border-2 border-neutral-800 backdrop-blur-md rounded-lg flex gap-1 items-center px-1 py-1 pointer-events-auto">
        {/* Logo - powrót do strony głównej */}
        <Link
          href="/"
          className="bg-transparent sm:bg-neutral-700/20 rounded-md w-12 h-11 backdrop-blur-md flex items-center justify-center hover:bg-neutral-700/40 transition-all duration-200 group"
          title="Powrót do strony głównej"
        >
          <NavIconSvg />
        </Link>

        {/* Dashboard - powrót do dashboardu */}
        {showDashboard && (
          <Link
            href="/dashboard"
            className="bg-neutral-700/20 rounded-md w-12 h-11 backdrop-blur-md flex items-center justify-center hover:bg-neutral-700/40 transition-all duration-200 group"
            title="Powrót do dashboardu"
          >
            <LayoutDashboard
              size={24}
              className="text-amber-600 group-hover:text-amber-700 transition-colors duration-200"
            />
          </Link>
        )}

        {/* Strzałka - powrót do logowania */}
        {showBackToLogin && (
          <Link
            href="/login"
            className="bg-neutral-700/20 rounded-md w-12 h-11 backdrop-blur-md flex items-center justify-center hover:bg-neutral-700/40 transition-all duration-200 group"
            title="Powrót do logowania"
          >
            <ArrowLeft
              size={24}
              className="text-amber-600 group-hover:text-amber-700 transition-colors duration-200"
            />
          </Link>
        )}
      </div>
    </header>
  );
};

export default AuthNavBar;
