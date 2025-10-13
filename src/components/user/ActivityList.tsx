"use client";

import React, { useMemo, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

type Row = any;

export default function ActivityList({
    rows,
    gamesMap,
    vocabMap,
}: {
    rows: Row[];
    gamesMap: Record<string, any>;
    vocabMap: Record<string, any>;
}) {
    const [filterType, setFilterType] = useState<string>("all");
    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState<string>("last_attempt_at");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

    const filtered = useMemo(() => {
        let arr = [...(rows || [])];
        if (filterType !== "all")
            arr = arr.filter((r) => r.content_type === filterType);
        if (search.trim()) {
            const s = search.toLowerCase();
            arr = arr.filter((r) => {
                const title =
                    r.content_type === "game"
                        ? gamesMap?.[r.content_id]?.title
                        : r.content_type === "vocabulary"
                        ? vocabMap?.[r.content_id]?.term_en
                        : r.content_id;
                return String(title || "")
                    .toLowerCase()
                    .includes(s);
            });
        }
        arr.sort((a, b) => {
            const va = (a as any)[sortKey];
            const vb = (b as any)[sortKey];
            if (va == null && vb == null) return 0;
            if (va == null) return 1;
            if (vb == null) return -1;
            if (sortKey === "last_attempt_at") {
                return sortDir === "asc"
                    ? new Date(va).getTime() - new Date(vb).getTime()
                    : new Date(vb).getTime() - new Date(va).getTime();
            }
            return 0;
        });
        return arr;
    }, [rows, filterType, search, sortKey, sortDir, gamesMap, vocabMap]);

    return (
        <div className="space-y-3">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex items-center gap-2">
                    <label className="text-sm text-neutral-300">Filtruj:</label>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="bg-neutral-900 border border-neutral-700 text-neutral-200 rounded px-2 py-1"
                    >
                        <option value="all">Wszystkie</option>
                        <option value="game">Ćwiczenia</option>
                        <option value="vocabulary">Słownictwo</option>
                        <option value="video">Wideo</option>
                    </select>
                </div>

                <div className="flex items-center gap-2 flex-1">
                    <input
                        className="flex-1 bg-neutral-900 border border-neutral-700 px-3 py-2 rounded text-neutral-100"
                        placeholder="Szukaj po tytule"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button
                        className="px-3 py-2 bg-amber-600 rounded text-black"
                        onClick={() => {
                            setSearch("");
                        }}
                    >
                        Wyczyść
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                {filtered.length === 0 ? (
                    <div className="text-neutral-400">Brak aktywności</div>
                ) : (
                    filtered.map((r) => (
                        <details
                            key={r.id}
                            className="bg-neutral-800/70 border border-neutral-700 rounded-md p-3"
                        >
                            <summary className="flex items-center justify-between cursor-pointer">
                                <div>
                                    <div className="text-neutral-100 font-medium">
                                        {r.content_type === "game"
                                            ? gamesMap?.[r.content_id]?.title ||
                                              r.content_id
                                            : r.content_type === "vocabulary"
                                            ? vocabMap?.[r.content_id]
                                                  ?.term_en || r.content_id
                                            : r.content_id}
                                    </div>
                                    <div className="text-neutral-400 text-xs">
                                        Typ: {r.content_type} •{" "}
                                        {new Date(
                                            r.last_attempt_at
                                        ).toLocaleString()}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {r.content_type === "vocabulary" ? (
                                        <div className="text-sm text-neutral-200">
                                            Opanowanie:{" "}
                                            <strong>
                                                {vocabMap?.[r.content_id]
                                                    ?.mastery_level ?? 0}
                                            </strong>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-neutral-200">
                                            Wynik:{" "}
                                            <strong>{r.score ?? "-"}</strong>
                                        </div>
                                    )}
                                </div>
                            </summary>
                            <div className="mt-3 text-neutral-300 text-sm space-y-2">
                                <div>
                                    Attempts: {r.attempts ?? 1} • Time spent:{" "}
                                    {r.time_spent ? `${r.time_spent}s` : "-"}
                                </div>
                                {r.context && (
                                    <div>
                                        Context: {JSON.stringify(r.context)}
                                    </div>
                                )}
                                <div className="pt-2">
                                    {r.content_type === "vocabulary" && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 text-neutral-300 text-sm">
                                                Mastery
                                            </div>
                                            <Progress
                                                value={
                                                    ((vocabMap?.[r.content_id]
                                                        ?.mastery_level ?? 0) /
                                                        5) *
                                                    100
                                                }
                                                className="flex-1"
                                            />
                                            <div className="w-12 text-right">
                                                {vocabMap?.[r.content_id]
                                                    ?.mastery_level ?? 0}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="pt-2">
                                    <a
                                        className="text-amber-300 underline text-sm"
                                        href={
                                            r.content_type === "game"
                                                ? `/pamiec`
                                                : r.content_type ===
                                                  "vocabulary"
                                                ? `/dashboard/vocabulary`
                                                : "#"
                                        }
                                    >
                                        Otwórz
                                    </a>
                                </div>
                            </div>
                        </details>
                    ))
                )}
            </div>
        </div>
    );
}
