"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import LessonCard from "@/components/vocaba/LessonCard";
import ProgressBar from "@/components/vocaba/ProgressBar";
import QuestionCard from "@/components/vocaba/QuestionCard";
import XPBadge from "@/components/vocaba/XPBadge";

import AuthNavBar from "@/components/AuthNavBar";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  const level = searchParams.get("level"); // e.g. "1", "2", etc.
  const [vocab, setVocab] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<string>("");

  async function fetcher(url: string, opts?: RequestInit) {
    const res = await fetch(url, {
      ...opts,
      headers: { "Content-Type": "application/json" },
    });
    const json = await res.json();
    return { ok: res.ok, json };
  }

  const refreshAll = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      // const p = await fetcher("/api/user/profile");
      // if (p.ok) setProfile(p.json.user);
      // else setError(JSON.stringify(p.json));

      // const pr = await fetcher("/api/user/profession");
      // if (pr.ok) setProfession(pr.json);
      // else setError(JSON.stringify(pr.json));

      const v = await fetcher("/api/user/vocabulary/by-level?level=" + level);
      setVocab(v.json);

      console.log(JSON.stringify(v));


      // const list = await fetcher("/api/user/professions");
      // if (list.ok) setProfessions(list.json.items);

      // const cats = await fetcher("/api/user/vocabulary/categories");
      // if (cats.ok) setCategories(cats.json.items);

      // const sum = await fetcher("/api/user/vocabulary/progress");
      // if (sum.ok) setSummary(sum.json.summary);

      setLastRefresh(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const difficulties = [
    { id: 1, title: "Podstawowy" },
    { id: 2, title: "Łatwy" },
    { id: 3, title: "Średni" },
    { id: 4, title: "Trudny" },
    { id: 5, title: "Bardzo Trudny" },
  ];

  return (
    <div className="min-h-screen from-green-50 to-green-100 p-6">
      <AuthNavBar showBackToLogin={false} showDashboard={true} />

      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-green-700">Vocaba</h1>
        </header>


        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10"
        >
        </motion.div>
      </div>
    </div>
  );
}
