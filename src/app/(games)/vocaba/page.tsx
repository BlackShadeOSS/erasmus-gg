"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import LessonCard from "@/components/vocaba/LessonCard";
import ProgressBar from "@/components/vocaba/ProgressBar";
import QuestionCard from "@/components/vocaba/QuestionCard";
import XPBadge from "@/components/vocaba/XPBadge";

export default function Page() {
  const [xp, setXp] = useState(120);
  const [streak, setStreak] = useState(5);

  const lessons = [
    { id: 1, title: "Basics 1", progress: 100 },
    { id: 2, title: "Basics 2", progress: 40 },
    { id: 3, title: "Greetings", progress: 0 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 p-6">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-green-700">Duolingo Clone</h1>
          <XPBadge xp={xp} streak={streak} />
        </header>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Your Progress</h2>
          <ProgressBar progress={xp / 200 * 100} />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Lessons</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {lessons.map((lesson) => (
              <LessonCard key={lesson.id} {...lesson} />
            ))}
          </div>
        </section>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10"
        >
          <QuestionCard
            question="How do you say 'Hello' in Spanish?"
            options={["Hola", "Adiós", "Gracias", "Por favor"]}
            correctAnswer="Hola"
            onAnswered={(correct) => {
              if (correct) setXp((prev) => prev + 10);
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
