"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const COOKIE_NAME = "erasmus_settings";

function saveSettingsToCookie(settings: any) {
  try {
    const value = encodeURIComponent(JSON.stringify(settings));
    // 1 year expiration
    const expires = new Date(
      Date.now() + 1000 * 60 * 60 * 24 * 365
    ).toUTCString();
    document.cookie = `${COOKIE_NAME}=${value}; path=/; expires=${expires}; SameSite=Lax`;
  } catch (e) {
    console.error("Failed to save settings cookie", e);
  }
}

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

export default function SettingsPanel() {
  const [themeLight, setThemeLight] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const s = readSettingsFromCookie();
    if (s) {
      setThemeLight(s.theme === "light");
      setReduceMotion(!!s.reduceMotion);
    }
  }, []);

  useEffect(() => {
    // Apply theme immediately using the `.dark` class
    if (themeLight) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  }, [themeLight]);

  useEffect(() => {
    // Apply reduced motion immediately
    if (reduceMotion) {
      document.documentElement.classList.add("reduced-motion");
    } else {
      document.documentElement.classList.remove("reduced-motion");
    }
  }, [reduceMotion]);

  function handleSave() {
    const settings = { theme: themeLight ? "light" : "dark", reduceMotion };
    saveSettingsToCookie(settings);
    // force navigation refresh to ensure any server-side components re-read cookies if needed
    try {
      router.refresh();
    } catch (e) {
      // ignore if not available
    }
  }

  function handleReset() {
    setThemeLight(false);
    setReduceMotion(false);
    saveSettingsToCookie({ theme: "dark", reduceMotion: false });
    router.refresh();
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Ustawienia</h2>

      <div className="bg-white/5 p-4 rounded-md mb-4">
        <label className="flex items-center justify-between gap-4">
          <div>
            <div className="font-medium">
              Light Theme <span className="text-sm text-amber-400">(beta)</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Przełącz na jasny motyw dla panelu.
            </div>
          </div>
          <input
            type="checkbox"
            checked={themeLight}
            onChange={(e) => setThemeLight(e.target.checked)}
            aria-label="Włącz jasny motyw"
            className="h-5 w-5"
          />
        </label>
      </div>

      <div className="bg-white/5 p-4 rounded-md mb-4">
        <label className="flex items-center justify-between gap-4">
          <div>
            <div className="font-medium">Reduce motion</div>
            <div className="text-sm text-muted-foreground">
              Minimalizuj animacje i ruchome elementy.
            </div>
          </div>
          <input
            type="checkbox"
            checked={reduceMotion}
            onChange={(e) => setReduceMotion(e.target.checked)}
            aria-label="Zminimalizuj animacje"
            className="h-5 w-5"
          />
        </label>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSave} variant="default">
          Zapisz
        </Button>
        <Button onClick={handleReset} variant="secondary">
          Resetuj
        </Button>
      </div>
    </div>
  );
}
