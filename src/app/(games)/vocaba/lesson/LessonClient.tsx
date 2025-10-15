"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter } from "next/navigation";
import AuthNavBar from "@/components/AuthNavBar";

export default function LessonClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const level = searchParams.get("level");

    const [vocab, setVocab] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState(false);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [shuffledWords, setShuffledWords] = useState<string[]>([]);
    const [selectedWords, setSelectedWords] = useState<string[]>([]);
    const [feedback, setFeedback] = useState<string>("");
    const [showConfetti, setShowConfetti] = useState(false);

    const fetcher = async (url: string, opts?: RequestInit) => {
        const res = await fetch(url, { ...opts, headers: { "Content-Type": "application/json" } });
        const json = await res.json();
        return { ok: res.ok, json };
    };

    const loadVocab = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const v = await fetcher("/api/user/vocabulary/by-level?level=" + level);
            if (v.ok) {
                setVocab(v.json.items);
                prepareSentence(0, v.json.items);
            } else {
                setError("Failed to fetch vocabulary.");
            }
        } catch (err: any) {
            setError(err.message || "Unknown error.");
        } finally {
            setLoading(false);
        }
    }, [level]);

    useEffect(() => {
        loadVocab();
    }, [loadVocab]);

    const shuffle = (arr: string[]) => [...arr].sort(() => Math.random() - 0.5);

    const prepareSentence = (index: number, items: any[] = vocab) => {
        if (!items || items.length === 0) return;
        const sentence = items[index]?.example_sentence_en || "";
        const words = sentence.trim().split(" ");
        setShuffledWords(shuffle(words));
        setSelectedWords([]);
        setFeedback("");
        setIsCorrect(false);
        setShowConfetti(false);
    };

    const handleWordClick = (word: string) => {
        if (selectedWords.includes(word)) return;
        const newSelected = [...selectedWords, word];
        setSelectedWords(newSelected);

        const correctSentence = vocab[currentIndex]?.example_sentence_en.split(" ");
        if (newSelected.length === correctSentence.length) {
            if (newSelected.join(" ") === correctSentence.join(" ")) {
                setFeedback("✓ Dobrze!");
                setIsCorrect(true);
                setShowConfetti(true);
            } else {
                setFeedback("✗ Spróbuj ponownie!");
                setIsCorrect(false);
            }
        }
    };

    const handleNext = () => {
        if (!isCorrect) return;
        const nextIndex = currentIndex + 1;
        if (nextIndex < vocab.length) {
            setCurrentIndex(nextIndex);
            prepareSentence(nextIndex);
        } else {
            // Don't set feedback here, just mark as complete
            setFeedback("🎉 Wszystkie zdania wykonane!");
        }
    };

    const handleBack = () => {
        router.push("/vocaba");
    };

    const isCompleted = currentIndex === vocab.length - 1 && feedback.includes("Wszystkie");

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 p-6">
            <AuthNavBar showBackToLogin={false} showDashboard={true} />

            <div className="max-w-3xl mx-auto">
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <h1 className="text-3xl font-bold text-green-400 mb-4">Lekcja Vocaba</h1>
                    {vocab.length > 0 && (
                        <div className="flex items-center justify-between">
                            <motion.div
                                whileHover={isCorrect ? { scale: 1.05 } : {}}
                                whileTap={isCorrect ? { scale: 0.95 } : {}}
                            >
                                <Button
                                    onClick={isCompleted ? handleBack : handleNext}
                                    className={`bg-amber-600 text-white hover:bg-amber-700 font-bold py-3 px-6 text-lg transition-all ${!isCorrect ? "opacity-50 cursor-not-allowed" : ""
                                        }`}
                                    disabled={!isCorrect}
                                >
                                    {isCompleted ? "Powrót" : "Następne"}
                                </Button>
                            </motion.div>
                            <motion.div
                                className="text-sm font-semibold text-green-400 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                {currentIndex + 1} / {vocab.length}
                            </motion.div>
                        </div>
                    )}
                </motion.header>

                {loading && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-gray-300"
                    >
                        Ładowanie...
                    </motion.p>
                )}

                {error && (
                    <motion.p
                        className="text-red-400"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        {error}
                    </motion.p>
                )}

                {!loading && !error && vocab.length > 0 && (
                    <motion.div
                        className="mt-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <motion.h2
                            className="text-xl font-semibold mb-4 text-green-400"
                            key={currentIndex}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            Utwórz zdanie:
                        </motion.h2>

                        {/* Selected words */}
                        <motion.div
                            className="min-h-[80px] border-2 rounded-lg p-4 mb-6 flex flex-wrap gap-2 bg-gray-800/50"
                            animate={isCorrect ? {
                                borderColor: "#22c55e",
                                backgroundColor: "#064e3b"
                            } : !isCorrect && feedback ? {
                                borderColor: "#ef4444",
                                backgroundColor: "#450a0a"
                            } : {
                                borderColor: "#374151"
                            }}
                            transition={{ duration: 0.3 }}
                        >
                            <AnimatePresence mode="popLayout">
                                {selectedWords.map((word, i) => (
                                    <motion.span
                                        key={`${word}-${i}`}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                        className="px-3 py-2 bg-amber-600 rounded-lg cursor-pointer hover:bg-amber-500 text-white font-medium shadow-sm"
                                        onClick={() => {
                                            const newSelected = selectedWords.filter((_, idx) => idx !== i);
                                            setSelectedWords(newSelected);
                                            setIsCorrect(false);
                                            setFeedback("");
                                        }}
                                    >
                                        {word}
                                    </motion.span>
                                ))}
                            </AnimatePresence>
                        </motion.div>

                        {/* Shuffled word bank */}
                        <motion.div
                            className="flex flex-wrap gap-2 mb-6"
                            key={`bank-${currentIndex}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {shuffledWords.map((word, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <Button
                                        onClick={() => handleWordClick(word)}
                                        disabled={selectedWords.includes(word)}
                                        className={`bg-gray-700 hover:bg-gray-600 text-gray-100 border border-gray-600 font-medium transition-all ${selectedWords.includes(word) ? "opacity-30" : ""
                                            }`}
                                    >
                                        {word}
                                    </Button>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Feedback - Fixed height to prevent layout shift */}
                        <div className="min-h-[80px] mb-6">
                            <AnimatePresence mode="wait">
                                {feedback && (
                                    <motion.div
                                        key={feedback}
                                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                        className={`p-4 rounded-lg font-semibold text-lg ${isCorrect
                                            ? "bg-green-900/50 text-green-300 border-2 border-green-500"
                                            : feedback.includes("Wszystkie")
                                                ? "bg-purple-900/50 text-purple-300 border-2 border-purple-500"
                                                : "bg-red-900/50 text-red-300 border-2 border-red-500"
                                            }`}
                                    >
                                        {feedback}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Confetti Effect */}
                        <AnimatePresence>
                            {showConfetti && (
                                <div className="fixed inset-0 pointer-events-none">
                                    {[...Array(20)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{
                                                opacity: 1,
                                                y: "50%",
                                                x: `${50 + (Math.random() - 0.5) * 20}%`,
                                                scale: 0
                                            }}
                                            animate={{
                                                opacity: 0,
                                                y: "-20%",
                                                x: `${50 + (Math.random() - 0.5) * 100}%`,
                                                scale: 1,
                                                rotate: Math.random() * 360
                                            }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 1.5, delay: i * 0.02 }}
                                            className="absolute w-3 h-3 rounded-full"
                                            style={{
                                                backgroundColor: ['#fbbf24', '#22c55e', '#3b82f6', '#a855f7'][i % 4],
                                                left: 0,
                                                top: '50%'
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
