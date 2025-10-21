"use client";
import { useEffect } from "react";

const COOKIE_NAME = "erasmus_settings";

function readSettingsFromCookie() {
  try {
    const raw = document.cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(COOKIE_NAME + "="));
    if (!raw) return null;
    const value = decodeURIComponent(raw.split("=")[1] || "");
    return JSON.parse(value);
  } catch (e) {
    console.error("Failed to parse settings cookie", e);
    return null;
  }
}

export default function ThemeInitializer() {
  useEffect(() => {
    const settings = readSettingsFromCookie();

    // Apply theme settings
    if (settings) {
      if (settings.theme === "light") {
        document.documentElement.classList.remove("dark");
      } else if (settings.theme === "dark") {
        document.documentElement.classList.add("dark");
      }

      // Apply reduced motion settings
      if (settings.reduceMotion) {
        document.documentElement.classList.add("reduced-motion");
      } else {
        document.documentElement.classList.remove("reduced-motion");
      }
    } else {
      // default: dark theme, no reduced motion
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("reduced-motion");
    }
  }, []);

  return null;
}
