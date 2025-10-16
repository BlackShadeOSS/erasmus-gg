"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DndContext, useSensor, useSensors, PointerSensor, closestCenter, DragEndEvent, DragStartEvent, useDroppable, useDraggable, TouchSensor } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { restrictToFirstScrollableAncestor } from "@dnd-kit/modifiers";

type VocabRow = {
    id: string;
    term: string; // e.g. term_en (word)
    translation: string; // e.g. term_pl
};

type Settings = {
    limit: number;
    language: string;
    category?: string;
};

function SettingsForm({ onStart }: { onStart: (settings: Settings) => void }) {
    const [limit, setLimit] = useState(8);
    const [category, setCategory] = useState<string>("");
    const [language, setLanguage] = useState<string>("en");
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadCategories() {
            try {
                const res = await fetch("/api/user/vocabulary/categories");
                if (res.ok) {
                    const data = await res.json();
                    const categoriesData = data?.items || data?.categories || (Array.isArray(data) ? data : []);
                    setCategories(categoriesData);
                } else {
                    console.error("Failed to load categories");
                    setCategories([]);
                }
            } catch (e) {
                console.error("Failed to load categories", e);
            } finally {
                setLoading(false);
            }
        }
        loadCategories();
    }, []);

    if (loading) return <div>Ładowanie ustawień…</div>;

    return (
        <Card className="bg-neutral-800/80">
            <CardHeader>
                <CardTitle>Ustawienia Quizu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <label className="block text-neutral-300 mb-1">Liczba słów:</label>
                    <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="rounded bg-neutral-700 px-2 py-1 w-full">
                        <option value={5}>5</option>
                        <option value={8}>8</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={20}>20</option>
                        <option value={25}>25</option>
                    </select>
                </div>
                <div>
                    <label className="block text-neutral-300 mb-1">Język słów</label>
                    <select value={language} onChange={(e) => setLanguage(e.target.value)} className="rounded bg-neutral-700 px-2 py-1 w-full">
                        <option value="en">Angielski</option>
                        <option value="pl">Polski</option>
                    </select>
                </div>
                <div>
                    <label className="block text-neutral-300 mb-1">Kategoria (opcjonalnie):</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded bg-neutral-700 px-2 py-1 w-full">
                        <option value="">Wszystkie</option>
                        {categories &&
                            Array.isArray(categories) &&
                            categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                    </select>
                </div>
                <Button
                    onClick={() =>
                        onStart({
                            limit,
                            language,
                            category: category || undefined,
                        })
                    }
                    className="w-full"
                >
                    Rozpocznij
                </Button>
            </CardContent>
        </Card>
    );
}

export default function WordMatching({ limit = 8 }: { limit?: number }) {
    const [items, setItems] = useState<VocabRow[]>([]);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);
    const [settings, setSettings] = useState<Settings | null>(null);
    const [words, setWords] = useState<string[]>([]);
    const [choices, setChoices] = useState<string[]>([]);
    const [matches, setMatches] = useState<Record<string, string>>({});
    const [results, setResults] = useState<Record<string, "correct" | "wrong">>({});
    const [isDragging, setIsDragging] = useState(false);

    const matchesRef = useRef<Record<string, string>>(matches);
    const choicesRef = useRef<string[]>(choices);
    useEffect(() => {
        matchesRef.current = matches;
    }, [matches]);
    useEffect(() => {
        choicesRef.current = choices;
    }, [choices]);

    useEffect(() => {
        if (settings) {
            setFinished(false);
            setScore(0);
        }
    }, [settings]);

    const loadWords = async (currentSettings: Settings) => {
        try {
            if (!settings) return;
            setLoading(true);
            setError(null);

            let url = `/api/user/vocabulary/recommended?limit=100`;
            if (settings.category) {
                url += `&categoryId=${settings.category}`;
            }

            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();

            const list = json?.items || json?.vocabulary || json?.vocab || json?.data || [];
            const rowsSource = list && list.length ? list : json?.items ? list : null;

            const rows: VocabRow[] = (rowsSource || []).map((v: any) => {
                const termEn = v.term_en || v.term || v.english || v.word || "";
                const termPl = v.term_pl || v.polish || v.translation || "";
                return {
                    id: v.id,
                    term: String(termEn),
                    translation: String(termPl),
                };
            });

            for (let i = rows.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [rows[i], rows[j]] = [rows[j], rows[i]];
            }

            const limitedRows = rows.slice(0, settings.limit);

            const shuffle = <T,>(array: T[]) => [...array].sort(() => Math.random() - 0.5);

            const wordSide: string[] = [];
            const choiceSide: string[] = [];

            limitedRows.forEach((r) => {
                if (currentSettings.language === "pl") {
                    wordSide.push(r.translation);
                    choiceSide.push(r.term);
                } else {
                    wordSide.push(r.term);
                    choiceSide.push(r.translation);
                }
            });

            setItems(rows);
            setWords(shuffle(wordSide));
            setChoices(shuffle(choiceSide));
            setMatches({});
            setResults({});
            setScore(0);
            setFinished(false);
            setLoading(false);
        } catch (e) {
            console.error(e);
            setError(String(e));
            setLoading(false);
        }
    };

    useEffect(() => {
        if (settings) loadWords(settings);
    }, [settings]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 150,
                tolerance: 5,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setIsDragging(true);
    };

    const handleDragEnd = ({ active, over }: DragEndEvent) => {
        setIsDragging(false);

        if (!active) return;
        const newChoice = String(active.id);

        if (!over) return;

        const overId = String(over.id);

        const prevMatches = { ...matchesRef.current };
        const prevChoices = [...choicesRef.current];

        const filteredChoices = prevChoices.filter((c) => c !== newChoice);

        let prevAssignedWord: string | undefined = undefined;
        for (const w of Object.keys(prevMatches)) {
            if (prevMatches[w] === newChoice) {
                prevAssignedWord = w;
                delete prevMatches[w];
                break;
            }
        }

        if (overId === "choices-basket") {
            const combined = [...filteredChoices, newChoice];
            const dedup = Array.from(new Set(combined));
            setMatches(prevMatches);
            setChoices(dedup);
            matchesRef.current = prevMatches;
            choicesRef.current = dedup;
            return;
        }

        const oldChoice = prevMatches[overId];
        if (oldChoice && oldChoice !== newChoice) {
            filteredChoices.push(oldChoice);
            delete prevMatches[overId];
        }

        prevMatches[overId] = newChoice;

        const finalChoices = Array.from(new Set(filteredChoices));

        setMatches(prevMatches);
        setChoices(finalChoices);

        matchesRef.current = prevMatches;
        choicesRef.current = finalChoices;
    };

    const checkAnswers = () => {
        let scoreCount = 0;
        const newResults: Record<string, "correct" | "wrong"> = {};
        words.forEach((word) => {
            const choice = matches[word];
            const correct = items.find((item) => (item.term === word && item.translation === choice) || (item.translation === word && item.term === choice));
            if (correct) {
                scoreCount++;
                newResults[word] = "correct";
            } else {
                newResults[word] = "wrong";
            }
        });
        setScore(scoreCount);
        setResults(newResults);
        setFinished(true);
    };

    if (!settings) return <SettingsForm onStart={setSettings} />;

    if (loading) return <div>Ładowanie słówek…</div>;
    if (error) {
        return (
            <div className="space-y-3">
                <div className="text-red-400">Błąd: {error}</div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => {
                            setLoading(true);
                            setError(null);
                            setItems([]);
                            setReloadKey((k) => k + 1);
                        }}
                    >
                        Spróbuj ponownie
                    </Button>
                </div>
            </div>
        );
    }

    function DraggableChoice({ id, children, disabled = false }: { id: string; children: React.ReactNode; disabled?: boolean }) {
        const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
            id,
            disabled,
        });

        const style: React.CSSProperties = {
            transform: transform ? CSS.Translate.toString(transform) : undefined,
            cursor: disabled ? "default" : "grab",
            width: "100%",
            boxSizing: "border-box",
            flexShrink: 0,
            zIndex: isDragging ? 999 : "auto",
            opacity: disabled ? 0.7 : 1,
            pointerEvents: disabled ? "none" : "auto",
            transition: "opacity 0.2s ease",
        };

        return (
            <div ref={setNodeRef} style={style} {...(!disabled ? listeners : {})} {...(!disabled ? attributes : {})} className="bg-neutral-500 text-neutral-200 p-2 rounded text-center select-none">
                {children}
            </div>
        );
    }

    function DroppableWord({ id, children, assignedChoice, status, finished }: { id: string; children: React.ReactNode; assignedChoice?: string; status?: "correct" | "wrong"; finished?: boolean }) {
        const { setNodeRef, isOver } = useDroppable({ id });

        let borderClass = "border-transparent";
        if (status === "correct") borderClass = "border-2 border-green-500";
        else if (status === "wrong") borderClass = "border-2 border-red-500";

        return (
            <div
                ref={setNodeRef}
                className={`flex flex-col md:flex-row justify-between items-stretch gap-2 p-2 rounded mb-2
        ${isOver ? "bg-neutral-600" : "bg-neutral-700"} ${borderClass}`}
                style={{ minHeight: 56 }}
            >
                <div className="text-neutral-200 text-center w-full md:w-auto flex justify-center items-center">{children}</div>
                <div className="flex justify-center items-center w-full md:w-72" style={{ minHeight: 40 }}>
                    {assignedChoice ? (
                        <DraggableChoice id={assignedChoice} disabled={finished}>
                            {assignedChoice}
                        </DraggableChoice>
                    ) : (
                        <div className="h-10 w-full md:w-72" />
                    )}
                </div>
            </div>
        );
    }

    const BottomPoolDroppable = () => {
        const { setNodeRef, isOver } = useDroppable({ id: "choices-basket" });
        return (
            <div ref={setNodeRef} className={`mt-4 p-3 rounded ${isOver ? "bg-neutral-600" : "bg-neutral-800/60"}`}>
                <div className="grid gap-2 grid-cols-1 xl:grid-cols-4 select-none touch-none">
                    {choices.map((choice) => (
                        <DraggableChoice key={choice} id={choice} disabled={finished}>
                            {choice}
                        </DraggableChoice>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <Card
                className="bg-neutral-800/80"
                style={{
                    overflow: isDragging ? "hidden" : "auto",
                    maxWidth: 1594,
                }}
            >
                <CardHeader>
                    <CardTitle>Word Matching</CardTitle>
                </CardHeader>
                <CardContent>
                    <DndContext sensors={sensors} modifiers={[restrictToFirstScrollableAncestor]} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                        <div className="grid grid-cols-1 gap-4 mb-4 select-none touch-none">
                            {words.map((word) => (
                                <DroppableWord key={word} id={word} assignedChoice={matches[word]} status={results[word]}>
                                    {word}
                                </DroppableWord>
                            ))}
                        </div>
                        <BottomPoolDroppable />
                    </DndContext>
                    {finished && (
                        <div>
                            <div className="text-neutral-200 mt-2">
                                Wynik: {score} / {words.length}
                            </div>
                            <Button
                                onClick={() => {
                                    if (settings) loadWords(settings);
                                }}
                                className="mt-4 w-full"
                            >
                                Zagraj jeszcze raz
                            </Button>
                            <Button onClick={() => setSettings(null)} variant="outline" className="mt-4 w-full">
                                Nowe ustawienia
                            </Button>
                        </div>
                    )}
                    {!finished && (
                        <Button onClick={checkAnswers} className="mt-4 w-full">
                            Sprawdź odpowiedzi
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
