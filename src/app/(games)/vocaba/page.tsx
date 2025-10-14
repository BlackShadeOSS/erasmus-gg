"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import LessonCard from "@/components/vocaba/LessonCard";
import AuthNavBar from "@/components/AuthNavBar";

export default function Page() {
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);

  const difficulties = [
    { id: 1, title: "Podstawowy", description: "Dla początkujących.", emoji: "🌱" },
    { id: 2, title: "Łatwy", description: "Proste słowa i zwroty.", emoji: "🌿" },
    { id: 3, title: "Średni", description: "Nieco większe wyzwanie.", emoji: "🌳" },
    { id: 4, title: "Trudny", description: "Zaawansowane słownictwo.", emoji: "🏔️" },
    { id: 5, title: "Bardzo Trudny", description: "Dla ekspertów języka.", emoji: "🚀" },
  ];

  const allowZagraj = selectedLesson !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 p-6">
      <AuthNavBar showBackToLogin={false} showDashboard={true} />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-green-400 mb-4">Vocaba</h1>

          {/* Game description */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4 mb-4"
          >
            <p className="text-gray-300 text-sm">
              💡 Ułóż pomieszane słowa w poprawnej kolejności, aby stworzyć zdanie w języku angielskim
            </p>
            <p className="text-gray-300 text-sm">
              📚 Wybierz poziom trudności i rozpocznij naukę!
            </p>
          </motion.div>

          {/* <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-300 text-lg"
          >
            Wybierz poziom trudności i rozpocznij naukę!
          </motion.p> */}
        </motion.header>

        {/* Lesson selection */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold mb-6 text-green-400">Wybierz Poziom</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {difficulties.map((lesson, index) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  onClick={() => setSelectedLesson(lesson.id)}
                  className={`cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 min-h-[140px] flex flex-col ${selectedLesson === lesson.id
                    ? "border-green-500 bg-gray-800 shadow-lg shadow-green-500/20"
                    : "border-gray-700 bg-gray-800/50 hover:border-green-500/50 hover:shadow-md hover:bg-gray-800"
                    }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{lesson.emoji}</span>
                    <h3 className="text-xl font-bold text-white">{lesson.title}</h3>
                  </div>
                  <p className="text-gray-400 text-sm flex-grow">{lesson.description}</p>

                  <div className="h-8 mt-2">
                    {selectedLesson === lesson.id && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center gap-2 text-green-400 font-semibold"
                      >
                        <span className="text-lg">✓</span>
                        <span>Wybrano</span>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Play button */}
        <AnimatePresence mode="wait">
          {allowZagraj && (
            <motion.section
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="mt-8"
            >
              <Link href={`/vocaba/lesson?level=${selectedLesson}`}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xl font-bold py-6 rounded-xl shadow-lg">
                    🎮 Zagraj Teraz
                  </Button>
                </motion.div>
              </Link>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Motivational message when no selection */}
        <AnimatePresence mode="wait">
          {!allowZagraj && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8 text-center"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="inline-block text-6xl mb-4"
              >
                👆
              </motion.div>
              <p className="text-gray-400 text-lg">
                Wybierz poziom, aby rozpocząć naukę
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}