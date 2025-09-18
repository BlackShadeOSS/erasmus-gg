"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

function hasConsentCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .some((c) => c.trim().startsWith("cookie-consent="));
}

function setConsentCookie() {
  const oneYear = 60 * 60 * 24 * 365; // seconds
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `cookie-consent=1; Path=/; Max-Age=${oneYear}; SameSite=Lax${secure}`;
}

export default function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!hasConsentCookie()) {
      setVisible(true);
    }
  }, []);

  if (!mounted || !visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4">
      <div className="mx-auto max-w-4xl rounded-lg border border-neutral-700 bg-neutral-900/95 backdrop-blur supports-[backdrop-filter]:bg-neutral-900/80 shadow-xl">
        <div className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
            <div className="text-neutral-200 text-sm sm:text-base">
              <p className="font-semibold text-neutral-100 mb-1">
                Ta strona używa plików cookie
              </p>
              <p className="text-neutral-300 leading-relaxed">
                Używamy plików cookie do zapewnienia podstawowych funkcji
                serwisu (logowanie, bezpieczeństwo) oraz poprawy komfortu
                korzystania. Kontynuując korzystanie z serwisu, wyrażasz zgodę
                na ich użycie.
              </p>
            </div>
            <div className="flex gap-2 sm:gap-3 shrink-0">
              <Button
                variant="secondary"
                className="bg-neutral-800 hover:bg-neutral-700 text-neutral-100"
                onClick={() => setVisible(false)}
                aria-label="Ukryj komunikat o cookies"
              >
                Zamknij
              </Button>
              <Button
                className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => {
                  setConsentCookie();
                  setVisible(false);
                }}
                aria-label="Akceptuję pliki cookie"
              >
                Akceptuję
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
