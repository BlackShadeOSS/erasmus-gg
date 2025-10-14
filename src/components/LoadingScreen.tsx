"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [prevPath, setPrevPath] = useState("");

  useEffect(() => {
    const currentPath = pathname + (searchParams?.toString() || "");

    // Show loading only if path actually changed
    if (currentPath !== prevPath && prevPath !== "") {
      setIsLoading(true);
      const timeout = setTimeout(() => setIsLoading(false), 500);
      setPrevPath(currentPath);
      return () => clearTimeout(timeout);
    }

    setPrevPath(currentPath);
  }, [pathname, searchParams]);

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm caret-transparent"
        >
          <div className="flex flex-col items-center gap-4">
            {/* Spinner */}
            <div className="relative">
              <div className="w-16 h-16 border-4 border-neutral-700 border-t-stone-200 rounded-full animate-spin" />
              <div
                className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-stone-100 rounded-full animate-spin"
                style={{ animationDuration: "0.6s" }}
              />
            </div>

            {/* Loading text */}
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold text-lg">
                Ładowanie...
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
