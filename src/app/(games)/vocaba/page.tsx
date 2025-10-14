"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import LessonCard from "@/components/vocaba/LessonCard";
import AuthNavBar from "@/components/AuthNavBar";

export default function Page() {
  const [xp, setXp] = useState(120);
  const [streak, setStreak] = useState(5);
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);

  const difficulties = [
    { id: 1, title: "Podstawowy", description: "Dla początkujących." },
    { id: 2, title: "Łatwy", description: "Proste słowa i zwroty." },
    { id: 3, title: "Średni", description: "Nieco większe wyzwanie." },
    { id: 4, title: "Trudny", description: "Zaawansowane słownictwo." },
    { id: 5, title: "Bardzo Trudny", description: "Dla ekspertów języka." },
  ];

  const allowZagraj = selectedLesson !== null;

  return (
    <div className="min-h-screen from-green-50 to-green-100 p-6">
      <AuthNavBar showBackToLogin={false} showDashboard={true} />

      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-green-700">Vocaba</h1>
        </header>

        <section>
          <h2 className="text-xl font-semibold mb-4">Wybierz Poziom</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {difficulties.map((lesson) => (
              <LessonCard
                key={lesson.id}
                title={lesson.title}
                description={lesson.description}
                selected={selectedLesson === lesson.id}
                onClick={() => setSelectedLesson(lesson.id)}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4"></h2>
          <div className="grid gap-4 sm:grid-cols-1">
            {allowZagraj && (
              <Link href={allowZagraj ? `/vocaba/lesson?level=${selectedLesson}` : "#"}>
                <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                  Zagraj Teraz
                </Button>
              </Link>
            )}
          </div>
        </section>


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
