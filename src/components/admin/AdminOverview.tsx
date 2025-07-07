"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { BarChart, DonutChart } from "@/components/ui/charts";
import { adminCache, generateCacheKey } from "@/lib/admin-cache";
import { DataStatusIndicator, type DataStatus } from "@/components/ui/data-status-indicator";
import { Button } from "@/components/ui/button";

export default function AdminOverview() {
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [backgroundLoading, setBackgroundLoading] = useState(false);
    const [hasError, setHasError] = useState(false);

    // Memoized fetch function
    const fetchStats = useCallback(async (forceRefresh = false) => {
        const cacheKey = generateCacheKey("admin-stats", {});

        // Check cache first
        if (!forceRefresh) {
            const cachedData = adminCache.get<any>(cacheKey);
            if (cachedData) {
                setStats(cachedData);
                setLoading(false);
                setHasError(false);

                // Schedule background refresh if stale
                if (adminCache.isStale(cacheKey)) {
                    setBackgroundLoading(true);
                    setTimeout(() => fetchStats(true), 100);
                }
                return;
            }
        }

        try {
            if (!forceRefresh) setLoading(true);
            setHasError(false);

            const response = await fetch("/api/admin/stats");
            const data = await response.json();
            
            if (data.success) {
                setStats(data.stats);
                setHasError(false);
                
                // Cache the data
                adminCache.set(cacheKey, data.stats);
            } else {
                setHasError(true);
                console.error("Failed to fetch stats:", data.error);
            }
        } catch (error) {
            setHasError(true);
            console.error("Failed to fetch stats:", error);
        } finally {
            setLoading(false);
            setBackgroundLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // Auto-refresh every 5 minutes
    useEffect(() => {
        const interval = setInterval(() => {
            fetchStats(true);
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [fetchStats]);

    // Memoized overview cards with proper routing
    const overviewCards = useMemo(
        () => [
            {
                id: "users",
                icon: "👥",
                title: "Użytkownicy",
                description: "Zarządzaj kontami użytkowników i uprawnieniami",
                path: "/admin-panel/users",
            },
            {
                id: "activation-codes",
                icon: "🔑",
                title: "Kody Aktywacyjne",
                description: "Generuj i zarządzaj kodami aktywacyjnymi",
                path: "/admin-panel/activation-codes",
            },
            {
                id: "professions",
                icon: "💼",
                title: "Zawody",
                description: "Zarządzaj kategoriami zawodowymi",
                path: "/admin-panel/professions",
            },
            {
                id: "vocabulary",
                icon: "📚",
                title: "Słownictwo",
                description: "Dodawaj i edytuj słownictwo oraz kategorie",
                path: "/admin-panel/vocabulary",
            },
            {
                id: "videos",
                icon: "🎥",
                title: "Filmy",
                description: "Zarządzaj filmami edukacyjnymi",
                path: "/admin-panel/videos",
            },
            {
                id: "games",
                icon: "🎮",
                title: "Gry",
                description: "Twórz i zarządzaj grami edukacyjnymi",
                path: "/admin-panel/games",
            },
        ],
        []
    );

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-100">
                            Panel Administratora
                        </h1>
                        <p className="text-neutral-400 mt-2">
                            Zarządzaj platformą VocEnglish
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <DataStatusIndicator status="loading" />
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={true}
                            className="text-xs"
                        >
                            Odśwież
                        </Button>
                    </div>
                </div>
                <div className="text-center py-8 text-neutral-400">
                    Ładowanie statystyk...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-100">
                        Panel Administratora
                    </h1>
                    <p className="text-neutral-400 mt-2">
                        Zarządzaj platformą VocEnglish
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <DataStatusIndicator 
                        status={
                            hasError 
                                ? "error" 
                                : backgroundLoading 
                                    ? "refreshing" 
                                    : loading 
                                        ? "loading" 
                                        : "current"
                        } 
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchStats(true)}
                        disabled={loading || backgroundLoading}
                        className="text-xs"
                    >
                        Odśwież
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-neutral-800/90 backdrop-blur-md border border-neutral-600/80 rounded-lg p-4">
                        <div className="text-2xl font-bold text-amber-400">
                            {stats.users?.total || 0}
                        </div>
                        <div className="text-sm text-neutral-400">
                            Użytkownicy
                        </div>
                        <div className="text-xs text-neutral-500 mt-1">
                            {stats.users?.newThisMonth || 0} nowych w tym
                            miesiącu
                        </div>
                    </div>
                    <div className="bg-neutral-800/90 backdrop-blur-md border border-neutral-600/80 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-400">
                            {stats.activationCodes?.unused || 0}
                        </div>
                        <div className="text-sm text-neutral-400">
                            Kody dostępne
                        </div>
                        <div className="text-xs text-neutral-500 mt-1">
                            {stats.activationCodes?.used || 0} używanych
                        </div>
                    </div>
                    <div className="bg-neutral-800/90 backdrop-blur-md border border-neutral-600/80 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-400">
                            {stats.vocabulary?.total || 0}
                        </div>
                        <div className="text-sm text-neutral-400">Słówka</div>
                        <div className="text-xs text-neutral-500 mt-1">
                            {stats.vocabulary?.active || 0} aktywnych
                        </div>
                    </div>
                    <div className="bg-neutral-800/90 backdrop-blur-md border border-neutral-600/80 rounded-lg p-4">
                        <div className="text-2xl font-bold text-purple-400">
                            {(stats.videos?.total || 0) +
                                (stats.games?.total || 0)}
                        </div>
                        <div className="text-sm text-neutral-400">
                            Materiały
                        </div>
                        <div className="text-xs text-neutral-500 mt-1">
                            {stats.videos?.total || 0} filmów,{" "}
                            {stats.games?.total || 0} gier
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {overviewCards.map((card) => (
                    <Card
                        key={card.id}
                        className="bg-neutral-800/90 backdrop-blur-md border-neutral-600/80 hover:border-amber-500/50 transition-all cursor-pointer group"
                        onClick={() => router.push(card.path)}
                    >
                        <CardHeader>
                            <CardTitle className="text-neutral-100 flex items-center group-hover:text-amber-200 transition-colors">
                                <span className="mr-2">{card.icon}</span>
                                {card.title}
                            </CardTitle>
                            <CardDescription className="text-neutral-300">
                                {card.description}
                            </CardDescription>
                        </CardHeader>
                        {stats && (
                            <CardContent>
                                <div className="space-y-2">
                                    {card.id === "users" && (
                                        <>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400">
                                                    Razem:
                                                </span>
                                                <span className="text-neutral-200">
                                                    {stats.users?.total || 0}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400">
                                                    Administratorzy:
                                                </span>
                                                <span className="text-neutral-200">
                                                    {stats.users?.admins || 0}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400">
                                                    Aktywni (7 dni):
                                                </span>
                                                <span className="text-green-400">
                                                    {stats.users
                                                        ?.recentLogins || 0}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                    {card.id === "activation-codes" && (
                                        <>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400">
                                                    Razem:
                                                </span>
                                                <span className="text-neutral-200">
                                                    {stats.activationCodes
                                                        ?.total || 0}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400">
                                                    Używane:
                                                </span>
                                                <span className="text-amber-400">
                                                    {stats.activationCodes
                                                        ?.used || 0}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400">
                                                    Dostępne:
                                                </span>
                                                <span className="text-green-400">
                                                    {stats.activationCodes
                                                        ?.unused || 0}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                    {card.id === "professions" && (
                                        <>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400">
                                                    Razem:
                                                </span>
                                                <span className="text-neutral-200">
                                                    {stats.professions?.total ||
                                                        0}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400">
                                                    Aktywne:
                                                </span>
                                                <span className="text-green-400">
                                                    {stats.professions
                                                        ?.active || 0}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                    {card.id === "vocabulary" && (
                                        <>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400">
                                                    Razem:
                                                </span>
                                                <span className="text-neutral-200">
                                                    {stats.vocabulary?.total ||
                                                        0}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400">
                                                    Aktywne:
                                                </span>
                                                <span className="text-green-400">
                                                    {stats.vocabulary?.active ||
                                                        0}
                                                </span>
                                            </div>
                                            <div className="text-xs text-neutral-500 mt-2">
                                                Poziomy: 1-5 (max:{" "}
                                                {Math.max(
                                                    ...Object.values(
                                                        stats.vocabulary
                                                            ?.byLevel || {}
                                                    ).map(
                                                        (v: any) =>
                                                            Number(v) || 0
                                                    )
                                                )}
                                                )
                                            </div>
                                        </>
                                    )}
                                    {card.id === "videos" && (
                                        <>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400">
                                                    Razem:
                                                </span>
                                                <span className="text-neutral-200">
                                                    {stats.videos?.total || 0}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400">
                                                    Aktywne:
                                                </span>
                                                <span className="text-green-400">
                                                    {stats.videos?.active || 0}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                    {card.id === "games" && (
                                        <>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400">
                                                    Razem:
                                                </span>
                                                <span className="text-neutral-200">
                                                    {stats.games?.total || 0}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400">
                                                    Aktywne:
                                                </span>
                                                <span className="text-green-400">
                                                    {stats.games?.active || 0}
                                                </span>
                                            </div>
                                            <div className="text-xs text-neutral-500 mt-2">
                                                Typy: Quiz, Fiszki, Dopasowanie
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        )}
                    </Card>
                ))}
            </div>

            {/* Charts Section */}
            {stats && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                    {/* Vocabulary by Level Chart */}
                    <Card className="bg-neutral-800/90 backdrop-blur-md border-neutral-600/80">
                        <CardHeader>
                            <CardTitle className="text-neutral-100">
                                Słownictwo według poziomów
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <BarChart
                                data={[
                                    {
                                        label: "Poziom 1",
                                        value:
                                            stats.vocabulary?.byLevel?.level1 ||
                                            0,
                                        color: "bg-green-500",
                                    },
                                    {
                                        label: "Poziom 2",
                                        value:
                                            stats.vocabulary?.byLevel?.level2 ||
                                            0,
                                        color: "bg-blue-500",
                                    },
                                    {
                                        label: "Poziom 3",
                                        value:
                                            stats.vocabulary?.byLevel?.level3 ||
                                            0,
                                        color: "bg-yellow-500",
                                    },
                                    {
                                        label: "Poziom 4",
                                        value:
                                            stats.vocabulary?.byLevel?.level4 ||
                                            0,
                                        color: "bg-orange-500",
                                    },
                                    {
                                        label: "Poziom 5",
                                        value:
                                            stats.vocabulary?.byLevel?.level5 ||
                                            0,
                                        color: "bg-red-500",
                                    },
                                ]}
                                maxHeight={60}
                            />
                        </CardContent>
                    </Card>

                    {/* Game Types Chart */}
                    <Card className="bg-neutral-800/90 backdrop-blur-md border-neutral-600/80">
                        <CardHeader>
                            <CardTitle className="text-neutral-100">
                                Gry według typów
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DonutChart
                                data={[
                                    {
                                        label: "Fiszki",
                                        value:
                                            stats.games?.byType?.flashcards ||
                                            0,
                                        color: "#10b981",
                                    },
                                    {
                                        label: "Quiz",
                                        value: stats.games?.byType?.quiz || 0,
                                        color: "#3b82f6",
                                    },
                                    {
                                        label: "Dopasowanie",
                                        value:
                                            stats.games?.byType?.matching || 0,
                                        color: "#f59e0b",
                                    },
                                    {
                                        label: "Przeciągnij",
                                        value:
                                            stats.games?.byType?.dragdrop || 0,
                                        color: "#ef4444",
                                    },
                                ]}
                                size={120}
                            />
                        </CardContent>
                    </Card>

                    {/* User Types Chart */}
                    <Card className="bg-neutral-800/90 backdrop-blur-md border-neutral-600/80">
                        <CardHeader>
                            <CardTitle className="text-neutral-100">
                                Użytkownicy według ról
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DonutChart
                                data={[
                                    {
                                        label: "Uczniowie",
                                        value: stats.users?.regular || 0,
                                        color: "#10b981",
                                    },
                                    {
                                        label: "Administratorzy",
                                        value: stats.users?.admins || 0,
                                        color: "#f59e0b",
                                    },
                                ]}
                                size={120}
                            />
                        </CardContent>
                    </Card>

                    {/* Activation Codes Status */}
                    <Card className="bg-neutral-800/90 backdrop-blur-md border-neutral-600/80">
                        <CardHeader>
                            <CardTitle className="text-neutral-100">
                                Status kodów aktywacyjnych
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DonutChart
                                data={[
                                    {
                                        label: "Dostępne",
                                        value:
                                            stats.activationCodes?.unused || 0,
                                        color: "#10b981",
                                    },
                                    {
                                        label: "Używane",
                                        value: stats.activationCodes?.used || 0,
                                        color: "#f59e0b",
                                    },
                                    {
                                        label: "Wygasłe",
                                        value:
                                            stats.activationCodes?.expired || 0,
                                        color: "#ef4444",
                                    },
                                ]}
                                size={120}
                            />
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
