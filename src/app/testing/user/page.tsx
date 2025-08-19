"use client";
import { useEffect, useState } from "react";

export default function UserApiDebugPage() {
    const [profile, setProfile] = useState<any>(null);
    const [profession, setProfession] = useState<any>(null);
    const [vocab, setVocab] = useState<any>(null);
    const [professions, setProfessions] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    async function fetcher(url: string, opts?: RequestInit) {
        const res = await fetch(url, {
            ...opts,
            headers: { "Content-Type": "application/json" },
        });
        const json = await res.json();
        return { ok: res.ok, json };
    }

    async function refreshAll() {
        const p = await fetcher("/api/user/profile");
        if (p.ok) setProfile(p.json.user);
        else setError(JSON.stringify(p.json));

        const pr = await fetcher("/api/user/profession");
        if (pr.ok) setProfession(pr.json);
        else setError(JSON.stringify(pr.json));

        const v = await fetcher("/api/user/vocabulary?limit=5");
        setVocab(v.json);

        const list = await fetcher("/api/user/professions");
        if (list.ok) setProfessions(list.json.items);

        const cats = await fetcher("/api/user/vocabulary/categories");
        if (cats.ok) setCategories(cats.json.items);

        const sum = await fetcher("/api/user/vocabulary/progress");
        if (sum.ok) setSummary(sum.json.summary);
    }

    useEffect(() => {
        refreshAll();
    }, []);

    async function setUserProfession(id: string) {
        await fetcher("/api/user/profession", {
            method: "PUT",
            body: JSON.stringify({ profession_id: id }),
        });
        await refreshAll();
    }

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">User API debug</h1>
            {error && <pre className="text-red-600">{error}</pre>}

            <section>
                <h2 className="text-xl font-semibold">/api/user/profile</h2>
                <pre className="bg-stone-800 p-3 rounded text-xs overflow-auto">
                    {JSON.stringify(profile, null, 2)}
                </pre>
            </section>

            <section>
                <h2 className="text-xl font-semibold">/api/user/profession</h2>
                <pre className="bg-stone-800 p-3 rounded text-xs overflow-auto">
                    {JSON.stringify(profession, null, 2)}
                </pre>
                <div className="flex gap-2 flex-wrap mt-2">
                    {professions?.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => setUserProfession(p.id)}
                            className="px-3 py-1 border rounded hover:bg-gray-50"
                        >
                            Set: {p.name_en}
                        </button>
                    ))}
                </div>
            </section>

            <section>
                <h2 className="text-xl font-semibold">/api/user/vocabulary</h2>
                <pre className="bg-stone-800 p-3 rounded text-xs overflow-auto">
                    {JSON.stringify(vocab, null, 2)}
                </pre>
            </section>

            <section>
                <h2 className="text-xl font-semibold">
                    /api/user/vocabulary/categories
                </h2>
                <pre className="bg-stone-800 p-3 rounded text-xs overflow-auto">
                    {JSON.stringify(categories, null, 2)}
                </pre>
            </section>

            <section>
                <h2 className="text-xl font-semibold">
                    /api/user/vocabulary/progress (summary)
                </h2>
                <pre className="bg-stone-800 p-3 rounded text-xs overflow-auto">
                    {JSON.stringify(summary, null, 2)}
                </pre>
            </section>

            <section>
                <h2 className="text-xl font-semibold">/api/user/videos</h2>
                <VideosBlock />
            </section>

            <section>
                <h2 className="text-xl font-semibold">
                    Vocabulary search & progress
                </h2>
                <SearchAndProgress />
            </section>
        </div>
    );
}

function VideosBlock() {
    const [videos, setVideos] = useState<any>(null);
    const [search, setSearch] = useState("");
    const [difficulty, setDifficulty] = useState("");

    async function fetcher(url: string, opts?: RequestInit) {
        const res = await fetch(url, {
            ...opts,
            headers: { "Content-Type": "application/json" },
        });
        const json = await res.json();
        return { ok: res.ok, json };
    }

    async function load() {
        const qs = new URLSearchParams();
        if (search) qs.set("search", search);
        if (difficulty) qs.set("difficulty", difficulty);
        const url = "/api/user/videos" + (qs.size ? `?${qs.toString()}` : "");
        const res = await fetcher(url);
        setVideos(res.json);
    }

    useEffect(() => {
        load();
    }, []);

    return (
        <div className="space-y-2">
            <div className="flex gap-2 items-center">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="search title"
                    className="border px-2 py-1 rounded"
                />
                <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="border px-2 py-1 rounded"
                >
                    <option value="">all levels</option>
                    <option value="1">A1</option>
                    <option value="2">A2</option>
                    <option value="3">B1</option>
                    <option value="4">B2</option>
                    <option value="5">C1</option>
                </select>
                <button onClick={load} className="px-3 py-1 border rounded">
                    Load
                </button>
            </div>
            <pre className="bg-stone-800 p-3 rounded text-xs overflow-auto">
                {JSON.stringify(videos, null, 2)}
            </pre>
        </div>
    );
}

function SearchAndProgress() {
    const [q, setQ] = useState("");
    const [res, setRes] = useState<any>(null);

    async function fetcher(url: string, opts?: RequestInit) {
        const res = await fetch(url, {
            ...opts,
            headers: { "Content-Type": "application/json" },
        });
        const json = await res.json();
        return { ok: res.ok, json };
    }

    async function search() {
        const r = await fetcher(
            `/api/user/vocabulary/search?q=${encodeURIComponent(q)}&limit=10`
        );
        setRes(r.json);
    }

    async function bump(id: string, delta: number) {
        await fetcher("/api/user/vocabulary", {
            method: "PATCH",
            body: JSON.stringify({ vocabulary_id: id, delta }),
        });
        await search();
    }

    return (
        <div className="space-y-2">
            <div className="flex gap-2 items-center">
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="search word"
                    className="border px-2 py-1 rounded"
                />
                <button onClick={search} className="px-3 py-1 border rounded">
                    Search
                </button>
            </div>
            <pre className="bg-stone-800 p-3 rounded text-xs overflow-auto">
                {JSON.stringify(res, null, 2)}
            </pre>
            {res?.items?.length ? (
                <div className="space-y-1">
                    {res.items.map((it: any) => (
                        <div key={it.id} className="flex items-center gap-2">
                            <span className="text-sm">
                                {it.term_en} / {it.term_pl} — mastery:{" "}
                                {it.mastery_level}
                            </span>
                            <button
                                onClick={() => bump(it.id, 1)}
                                className="px-2 py-0.5 border rounded"
                            >
                                +1
                            </button>
                            <button
                                onClick={() => bump(it.id, -1)}
                                className="px-2 py-0.5 border rounded"
                            >
                                -1
                            </button>
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
