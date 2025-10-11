"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReportProgress } from "@/hooks/useReportProgress";

type VocabRow = {
    id: string;
    term: string; // e.g. term_en (word)
    translation: string; // e.g. term_pl
    definition: string; // e.g. definition_en
};

type Settings = {
    limit: number;
    category?: string;
    mode: "term" | "definition";
};

function SettingsForm({ onStart }: { onStart: (settings: Settings) => void }) {
    const [limit, setLimit] = useState(8);
    const [category, setCategory] = useState<string>("");
    const [mode, setMode] = useState<"term" | "definition">("term");
    const [categories, setCategories] = useState<
        { id: string; name: string }[]
    >([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadCategories() {
            try {
                const res = await fetch("/api/user/vocabulary/categories");
                if (res.ok) {
                    const data = await res.json();
                    const categoriesData =
                        data?.items ||
                        data?.categories ||
                        (Array.isArray(data) ? data : []);
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
                    <label className="block text-neutral-300 mb-1">
                        Liczba pytań:
                    </label>
                    <select
                        value={limit}
                        onChange={(e) => setLimit(Number(e.target.value))}
                        className="rounded bg-neutral-700 px-2 py-1 w-full"
                    >
                        <option value={5}>5</option>
                        <option value={8}>8</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={20}>20</option>
                        <option value={25}>25</option>
                    </select>
                </div>
                <div>
                    <label className="block text-neutral-300 mb-1">
                        Kategoria (opcjonalnie):
                    </label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="rounded bg-neutral-700 px-2 py-1 w-full"
                    >
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
                <div>
                    <label className="block text-neutral-300 mb-1">Tryb:</label>
                    <select
                        value={mode}
                        onChange={(e) =>
                            setMode(e.target.value as "term" | "definition")
                        }
                        className="rounded bg-neutral-700 px-2 py-1 w-full"
                    >
                        <option value="term">
                            Pokaż słowo (poprawne tłumaczenie)
                        </option>
                        <option value="definition">
                            Pokaż definicję (wybierz słowo)
                        </option>
                    </select>
                </div>
                <Button
                    onClick={() =>
                        onStart({
                            limit,
                            category: category || undefined,
                            mode,
                        })
                    }
                    className="w-full"
                >
                    Rozpocznij Quiz
                </Button>
            </CardContent>
        </Card>
    );
}

export default function WordQuiz({ limit = 8 }: { limit?: number }) {
    const [items, setItems] = useState<VocabRow[]>([]);
    const [index, setIndex] = useState(0);
    const [choices, setChoices] = useState<string[]>([]);
    const [selected, setSelected] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [attempts, setAttempts] = useState(0);
    const [finished, setFinished] = useState(false);
    const [mode, setMode] = useState<"term" | "definition">("term");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);
    const [settings, setSettings] = useState<Settings | null>(null);
    const [startTime, setStartTime] = useState<number | null>(null);

    const { report } = useReportProgress();

    const filteredItems = useMemo(() => {
        if (mode === "definition") {
            return items.filter(
                (item) => item.definition && item.definition.trim().length > 0
            );
        }
        return items;
    }, [items, mode]);

    useEffect(() => {
        if (settings) {
            setMode(settings.mode);
            setIndex(0);
            setFinished(false);
            setScore(0);
            setAttempts(0);
            setSelected(null);
            setStartTime(Date.now());
        }
    }, [settings]);

    // Report final completion when quiz finishes
    useEffect(() => {
        if (finished && startTime) {
            const totalTimeSpent = Math.floor((Date.now() - startTime) / 1000);
            report({
                content_type: "game",
                content_id: "83520994-5984-439d-a4e6-196f7889b8a0",
                progress: {
                    completed: true,
                    score: score,
                    attempts: attempts,
                    time_spent: totalTimeSpent,
                },
            }).catch((e) => console.error("Final progress report error", e));
        }
    }, [finished, startTime, score, attempts, report]);

    useEffect(() => {
        async function load() {
            if (!settings) return;
            try {
                setLoading(true);
                setError(null);
                let url = `/api/user/vocabulary/recommended?limit=${settings.limit}`;
                if (settings.category) {
                    url = `/api/user/vocabulary/by-category?categoryId=${settings.category}&limit=${settings.limit}`;
                }
                const res = await fetch(url);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();

                // support multiple response shapes: { items: [...] } or { vocabulary: [...] }
                const list =
                    json?.items ||
                    json?.vocabulary ||
                    json?.vocab ||
                    json?.data ||
                    [];

                // fallback: if recommended returned empty, try the generic endpoint
                const rowsSource =
                    list && list.length ? list : json?.items ? list : null;

                const rows: VocabRow[] = (rowsSource || []).map((v: any) => {
                    const termEn =
                        v.term_en || v.term || v.english || v.word || "";
                    const termPl = v.term_pl || v.polish || v.translation || "";
                    const definitionEn =
                        v.definition_en || v.definition_pl || "";
                    return {
                        id: v.id,
                        term: String(termEn),
                        translation: String(termPl),
                        definition: String(definitionEn),
                    };
                });

                // If still empty, try the non-recommended endpoint as a last resort
                if (!rows.length) {
                    let altUrl = `/api/user/vocabulary?limit=${settings.limit}`;
                    if (settings.category) {
                        altUrl = `/api/user/vocabulary/by-category?categoryId=${settings.category}&limit=${settings.limit}`;
                    }
                    const alt = await fetch(altUrl);
                    if (!alt.ok) throw new Error(`HTTP ${alt.status}`);
                    const altJson = await alt.json();
                    const altList = altJson?.items || altJson?.vocabulary || [];
                    const altRows: VocabRow[] = (altList || []).map(
                        (v: any) => ({
                            id: v.id,
                            term: String(
                                v.term_en || v.term || v.english || v.word || ""
                            ),
                            translation: String(
                                v.term_pl || v.polish || v.translation || ""
                            ),
                            definition: String(
                                v.definition_en || v.definition_pl || ""
                            ),
                        })
                    );
                    setItems(altRows || []);
                    setLoading(false);
                    return;
                }

                setItems(rows);
                setLoading(false);
            } catch (e) {
                console.error(e);
                setError(String(e));
                setLoading(false);
            }
        }
        load();
    }, [settings]);

    useEffect(() => {
        setIndex(0);
        setFinished(false);
        setScore(0);
        setAttempts(0);
        setSelected(null);
    }, [mode]);

    useEffect(() => {
        if (!filteredItems.length) return;
        const cur = filteredItems[index];
        if (!cur) return;

        // build choices depending on mode
        let pool: VocabRow[] = [];
        let opts: string[] = [];
        if (mode === "term") {
            // show term -> ask for translation
            pool = filteredItems.filter(
                (_, i) =>
                    i !== index &&
                    filteredItems[i].translation &&
                    filteredItems[i].translation.length
            );
            opts = [cur.translation].filter(Boolean) as string[];
            const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
            for (let i = 0; i < shuffledPool.length && opts.length < 4; i++) {
                const t = shuffledPool[i].translation;
                if (t && !opts.includes(t)) opts.push(t);
            }
            // fallback
            if (opts.length < 2) {
                const other = filteredItems.find(
                    (_, i) => i !== index && filteredItems[i].translation
                );
                if (other) opts.push(other.translation);
            }
        } else {
            // definition mode: show definition -> ask for term
            pool = filteredItems.filter(
                (_, i) =>
                    i !== index &&
                    filteredItems[i].term &&
                    filteredItems[i].term.length
            );
            opts = [cur.term].filter(Boolean) as string[];
            const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
            for (let i = 0; i < shuffledPool.length && opts.length < 4; i++) {
                const t = shuffledPool[i].term;
                if (t && !opts.includes(t)) opts.push(t);
            }
            if (opts.length < 2) {
                const other = filteredItems.find(
                    (_, i) => i !== index && filteredItems[i].term
                );
                if (other) opts.push(other.term);
            }
        }

        // shuffle final choices
        for (let i = opts.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [opts[i], opts[j]] = [opts[j], opts[i]];
        }

        setChoices(opts);
        setSelected(null);
    }, [filteredItems, index, mode]);

    async function patchMastery(vocabId: string) {
        try {
            const res = await fetch(`/api/user/vocabulary`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ vocabulary_id: vocabId, delta: 1 }),
            });
            return res.ok;
        } catch (e) {
            return false;
        }
    }

    const answer = async (choice: string) => {
        if (selected) return; // already answered
        setSelected(choice);
        setAttempts((a) => a + 1);
        const correct =
            mode === "term"
                ? filteredItems[index].translation === choice
                : filteredItems[index].term === choice;
        if (correct) setScore((s) => s + 1);

        // Don't report progress for individual answers - only at the end
        // if (correct) {
        //     // best-effort: try several patch shapes
        //     void patchMastery(filteredItems[index].id);
        // }

        setTimeout(() => {
            if (index + 1 >= filteredItems.length) {
                setFinished(true);
            } else {
                setIndex((i) => i + 1);
            }
        }, 700);
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
                            setIndex(0);
                            setReloadKey((k) => k + 1);
                        }}
                    >
                        Spróbuj ponownie
                    </Button>
                </div>
            </div>
        );
    }

    if (finished) {
        return (
            <Card className="bg-neutral-800/80">
                <CardHeader>
                    <CardTitle>Gratulacje!</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="pb-10">
                        Twój wynik: {score} / {filteredItems.length}
                    </p>
                    <Button
                        onClick={() => {
                            setIndex(0);
                            setScore(0);
                            setAttempts(0);
                            setFinished(false);
                            setStartTime(Date.now());
                        }}
                    >
                        Zagraj jeszcze raz
                    </Button>
                    <Button
                        onClick={() => setSettings(null)}
                        variant="outline"
                        className="ml-2"
                    >
                        Nowe ustawienia
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const cur = filteredItems[index];

    if (!cur) {
        return (
            <Card className="bg-neutral-800/80">
                <CardHeader>
                    <CardTitle>Word Quiz</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-neutral-200">
                        Brak słówek dostępnych dla wybranego trybu. Spróbuj
                        zmienić tryb lub załaduj więcej słówek.
                    </p>
                    <Button
                        onClick={() =>
                            setMode(mode === "term" ? "definition" : "term")
                        }
                        className="mt-2"
                    >
                        Zmień tryb
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <Card className="bg-neutral-800/80">
                <CardHeader>
                    <CardTitle>Word Quiz</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-neutral-200 mb-2">
                        {mode === "term" ? (
                            <>
                                Przetłumacz: <strong>{cur.term}</strong>
                            </>
                        ) : (
                            <>
                                Wybierz poprawne słowo dla definicji:{" "}
                                <strong>{cur.definition}</strong>
                            </>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {choices.map((c) => {
                            const isCorrect =
                                mode === "term"
                                    ? c === cur.translation
                                    : c === cur.term;
                            const isSelected = selected === c;
                            const btnClass =
                                "w-full text-left hover:text-black" +
                                (selected
                                    ? isCorrect
                                        ? " bg-green-600 hover:bg-green-600"
                                        : isSelected
                                        ? " bg-red-600 hover:bg-red-600"
                                        : ""
                                    : " bg-neutral-600 text-white");
                            return (
                                <Button
                                    key={c}
                                    onClick={() => answer(c)}
                                    className={btnClass}
                                >
                                    {c}
                                </Button>
                            );
                        })}
                    </div>
                    <div className="mt-3 text-neutral-400 text-sm">
                        Pytanie {index + 1} / {filteredItems.length}
                    </div>
                </CardContent>
            </Card>

            <div className="flex gap-2 items-center">
                <div className="text-neutral-300">Wynik: {score}</div>
                <div className="text-neutral-300">Próby: {attempts}</div>
            </div>
        </div>
    );
}
