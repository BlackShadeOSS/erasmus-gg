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

    // ALWAYS default to dark mode first
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("reduced-motion");

    // Only apply light theme if explicitly set in cookie
    if (settings) {
      if (settings.theme === "light") {
        // User explicitly chose light theme
        document.documentElement.classList.remove("dark");
      }
      // If theme is "dark" or undefined, keep dark class (already added above)

      // Apply reduced motion settings
      if (settings.reduceMotion) {
        document.documentElement.classList.add("reduced-motion");
      }
    }
  }, []);

  return null;
}
