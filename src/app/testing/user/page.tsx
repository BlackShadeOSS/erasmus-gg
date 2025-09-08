"use client";
import { useCallback, useEffect, useState } from "react";

export default function UserApiDebugPage() {
    const [profile, setProfile] = useState<any>(null);
    const [profession, setProfession] = useState<any>(null);
    const [vocab, setVocab] = useState<any>(null);
    const [professions, setProfessions] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);
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

            setLastRefresh(new Date().toLocaleTimeString());
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshAll();
    }, [refreshAll]);

    async function setUserProfession(id: string) {
        setError(null);

        const result = await fetcher("/api/user/profession", {
            method: "PUT",
            body: JSON.stringify({ profession_id: id }),
        });

        // Give a moment for the DB to update, then refresh
        setTimeout(() => {
            refreshAll();
        }, 200);
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">User API debug</h1>
                <div className="flex items-center gap-4">
                    {lastRefresh && (
                        <span className="text-sm text-gray-600">
                            Last refresh: {lastRefresh}
                        </span>
                    )}
                    <button
                        onClick={refreshAll}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Loading..." : "Refresh All"}
                    </button>
                </div>
            </div>
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

            <section>
                <h2 className="text-xl font-semibold">Additional Endpoints</h2>
                <AdditionalEndpointsBlock />
            </section>

            <section>
                <h2 className="text-xl font-semibold">Database Debug</h2>
                <DatabaseDebugBlock />
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

    const load = useCallback(async () => {
        const qs = new URLSearchParams();
        if (search) qs.set("search", search);
        if (difficulty) qs.set("difficulty", difficulty);
        const url = "/api/user/videos" + (qs.size ? `?${qs.toString()}` : "");
        const res = await fetcher(url);
        setVideos(res.json);
    }, [search, difficulty]);

    useEffect(() => {
        load();
    }, [load]);

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

function AdditionalEndpointsBlock() {
    const [byCategory, setByCategory] = useState<any>(null);
    const [byLevel, setByLevel] = useState<any>(null);
    const [recommended, setRecommended] = useState<any>(null);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedLevel, setSelectedLevel] = useState("1");

    async function fetcher(url: string, opts?: RequestInit) {
        const res = await fetch(url, {
            ...opts,
            headers: { "Content-Type": "application/json" },
        });
        const json = await res.json();
        return { ok: res.ok, json };
    }

    const testByCategory = async () => {
        if (!selectedCategory) return;
        const res = await fetcher(
            `/api/user/vocabulary/by-category?categoryId=${selectedCategory}&limit=5`
        );
        setByCategory(res.json);
    };

    const testByLevel = async () => {
        const res = await fetcher(
            `/api/user/vocabulary/by-level?level=${selectedLevel}&limit=5`
        );
        setByLevel(res.json);
    };

    const testRecommended = async () => {
        const res = await fetcher("/api/user/vocabulary/recommended?limit=10");
        setRecommended(res.json);
    };

    const testProfileUpdate = async () => {
        await fetcher("/api/user/profile", {
            method: "PUT",
            body: JSON.stringify({ full_name: "Updated Test Name" }),
        });
        alert("Profile updated! Check the profile section.");
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="border p-3 rounded">
                    <h3 className="font-semibold mb-2">By Category</h3>
                    <div className="space-y-2">
                        <input
                            value={selectedCategory}
                            onChange={(e) =>
                                setSelectedCategory(e.target.value)
                            }
                            placeholder="Category ID (see categories section above)"
                            className="border px-2 py-1 rounded w-full text-xs"
                        />
                        <button
                            onClick={testByCategory}
                            className="px-3 py-1 border rounded w-full"
                        >
                            Test /api/user/vocabulary/by-category
                        </button>
                    </div>
                </div>

                <div className="border p-3 rounded">
                    <h3 className="font-semibold mb-2">By Level</h3>
                    <div className="space-y-2">
                        <select
                            value={selectedLevel}
                            onChange={(e) => setSelectedLevel(e.target.value)}
                            className="border px-2 py-1 rounded w-full"
                        >
                            <option value="1">A1</option>
                            <option value="2">A2</option>
                            <option value="3">B1</option>
                            <option value="4">B2</option>
                            <option value="5">C1</option>
                        </select>
                        <button
                            onClick={testByLevel}
                            className="px-3 py-1 border rounded w-full"
                        >
                            Test /api/user/vocabulary/by-level
                        </button>
                    </div>
                </div>

                <div className="border p-3 rounded">
                    <h3 className="font-semibold mb-2">Recommended</h3>
                    <button
                        onClick={testRecommended}
                        className="px-3 py-1 border rounded w-full"
                    >
                        Test /api/user/vocabulary/recommended
                    </button>
                </div>

                <div className="border p-3 rounded">
                    <h3 className="font-semibold mb-2">Profile Update</h3>
                    <button
                        onClick={testProfileUpdate}
                        className="px-3 py-1 border rounded w-full"
                    >
                        Test PUT /api/user/profile
                    </button>
                </div>
            </div>

            {byCategory && (
                <div>
                    <h4 className="font-semibold">By Category Results:</h4>
                    <pre className="bg-stone-800 p-3 rounded text-xs overflow-auto">
                        {JSON.stringify(byCategory, null, 2)}
                    </pre>
                </div>
            )}

            {byLevel && (
                <div>
                    <h4 className="font-semibold">By Level Results:</h4>
                    <pre className="bg-stone-800 p-3 rounded text-xs overflow-auto">
                        {JSON.stringify(byLevel, null, 2)}
                    </pre>
                </div>
            )}

            {recommended && (
                <div>
                    <h4 className="font-semibold">Recommended Results:</h4>
                    <pre className="bg-stone-800 p-3 rounded text-xs overflow-auto">
                        {JSON.stringify(recommended, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}

function DatabaseDebugBlock() {
    const [debugData, setDebugData] = useState<any>(null);
    const [overviewData, setOverviewData] = useState<any>(null);
    const [seedResult, setSeedResult] = useState<any>(null);
    const [queryTest, setQueryTest] = useState<any>(null);

    async function fetcher(url: string, opts?: RequestInit) {
        const res = await fetch(url, {
            ...opts,
            headers: { "Content-Type": "application/json" },
        });
        const json = await res.json();
        return { ok: res.ok, json };
    }

    const testDebug = async () => {
        const res = await fetcher("/api/debug-vocab");
        setDebugData(res.json);
    };

    const getOverview = async () => {
        const res = await fetcher("/api/db-overview");
        setOverviewData(res.json);
    };

    const seedData = async () => {
        const res = await fetcher("/api/seed-data", { method: "POST" });
        setSeedResult(res.json);
    };

    const testVocabularyQuery = async () => {
        const res = await fetcher("/api/test-debug/vocabulary-query");
        setQueryTest(res.json);
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={testDebug}
                    className="px-4 py-2 bg-red-600 text-white rounded"
                >
                    Run User Debug
                </button>
                <button
                    onClick={getOverview}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                    Database Overview
                </button>
                <button
                    onClick={seedData}
                    className="px-4 py-2 bg-green-600 text-white rounded"
                >
                    Seed Test Data
                </button>
                <button
                    onClick={testVocabularyQuery}
                    className="px-4 py-2 bg-purple-600 text-white rounded"
                >
                    Test Vocabulary Query
                </button>
            </div>

            {debugData && (
                <div>
                    <h4 className="font-semibold">User Debug:</h4>
                    <pre className="bg-stone-800 p-3 rounded text-xs overflow-auto">
                        {JSON.stringify(debugData, null, 2)}
                    </pre>
                </div>
            )}

            {overviewData && (
                <div>
                    <h4 className="font-semibold">Database Overview:</h4>
                    <pre className="bg-stone-800 p-3 rounded text-xs overflow-auto">
                        {JSON.stringify(overviewData, null, 2)}
                    </pre>
                </div>
            )}

            {seedResult && (
                <div>
                    <h4 className="font-semibold">Seed Result:</h4>
                    <pre className="bg-stone-800 p-3 rounded text-xs overflow-auto">
                        {JSON.stringify(seedResult, null, 2)}
                    </pre>
                </div>
            )}

            {queryTest && (
                <div>
                    <h4 className="font-semibold">Vocabulary Query Test:</h4>
                    <pre className="bg-stone-800 p-3 rounded text-xs overflow-auto">
                        {JSON.stringify(queryTest, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
