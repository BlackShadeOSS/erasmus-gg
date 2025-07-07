"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { LineShadowText } from "@/components/ui/line-shadow-text";
import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";
import GlowingCircle from "@/components/ui/glowing-circle";
import NoiseFilter from "@/components/NoiseFilter";
import { UserSession } from "@/lib/auth";
import ProfessionsManager from "./ProfessionsManager";
import VocabularyManager from "./VocabularyManager";
import VideosManager from "./VideosManager";
import GamesManager from "./GamesManager";
import UsersManager from "./UsersManager";
import ActivationCodesManager from "./ActivationCodesManager";
import { useRouter } from "next/navigation";

interface AdminDashboardProps {
    user: UserSession;
}

type AdminSection =
    | "overview"
    | "users"
    | "activation-codes"
    | "professions"
    | "vocabulary"
    | "videos"
    | "games";

export default function AdminDashboard({ user }: AdminDashboardProps) {
    const [activeSection, setActiveSection] =
        useState<AdminSection>("overview");
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
            });
            router.push("/login");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const menuItems = [
        { id: "overview", label: "Przegląd", icon: "📊" },
        { id: "users", label: "Użytkownicy", icon: "👥" },
        { id: "activation-codes", label: "Kody Aktywacyjne", icon: "🔑" },
        { id: "professions", label: "Zawody", icon: "💼" },
        { id: "vocabulary", label: "Słownictwo", icon: "📚" },
        { id: "videos", label: "Filmy", icon: "🎥" },
        { id: "games", label: "Gry", icon: "🎮" },
    ];

    const renderContent = () => {
        switch (activeSection) {
            case "overview":
                return <AdminOverview />;
            case "users":
                return <UsersManager />;
            case "activation-codes":
                return <ActivationCodesManager />;
            case "professions":
                return <ProfessionsManager />;
            case "vocabulary":
                return <VocabularyManager />;
            case "videos":
                return <VideosManager />;
            case "games":
                return <GamesManager />;
            default:
                return <AdminOverview />;
        }
    };

    return (
        <div className="min-h-screen bg-neutral-900 relative">
            <div>
                <GlowingCircle />
                <GlowingCircle isRight={true} />
            </div>

            <div className="flex">
                {/* Sidebar */}
                <div className="w-64 bg-neutral-900/50 backdrop-blur-md border-r border-neutral-800 min-h-screen p-4">
                    <div className="mb-8">
                        <LineShadowText
                            className="text-amber-200 text-2xl font-bold"
                            shadowColor="#fdef7b"
                        >
                            VocEnglish
                        </LineShadowText>
                        <p className="text-stone-400 text-sm mt-2">
                            Panel Administratora
                        </p>
                        <p className="text-stone-300 text-sm">
                            Witaj, {user.username}
                        </p>
                    </div>

                    <nav className="space-y-2">
                        {menuItems.map((item) => (
                            <Button
                                key={item.id}
                                variant={
                                    activeSection === item.id
                                        ? "default"
                                        : "secondary"
                                }
                                className={cn(
                                    "w-full justify-start text-left",
                                    activeSection === item.id
                                        ? "bg-amber-600 hover:bg-amber-700 text-white"
                                        : "text-stone-300 hover:text-white hover:bg-neutral-800"
                                )}
                                onClick={() =>
                                    setActiveSection(item.id as AdminSection)
                                }
                            >
                                <span className="mr-2">{item.icon}</span>
                                {item.label}
                            </Button>
                        ))}
                    </nav>

                    <div className="mt-auto pt-8">
                        <Button
                            variant="secondary"
                            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            onClick={handleLogout}
                        >
                            🚪 Wyloguj
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-8 bg-neutral-900/20 backdrop-blur-sm">
                    {renderContent()}
                </div>
            </div>

            <div className="-z-10">
                <DotPattern
                    glow={false}
                    className={cn(
                        "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)] opacity-20"
                    )}
                />
            </div>

            <NoiseFilter className="-z-10" />
        </div>
    );
}

function AdminOverview() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-neutral-100">
                    Panel Administratora
                </h1>
                <p className="text-neutral-400 mt-2">
                    Zarządzaj platformą VocEnglish
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-neutral-800/90 backdrop-blur-md border-neutral-600/80">
                    <CardHeader>
                        <CardTitle className="text-neutral-100 flex items-center">
                            <span className="mr-2">👥</span>
                            Użytkownicy
                        </CardTitle>
                        <CardDescription className="text-neutral-300">
                            Zarządzaj kontami użytkowników i uprawnieniami
                        </CardDescription>
                    </CardHeader>
                </Card>

                <Card className="bg-neutral-800/90 backdrop-blur-md border-neutral-600/80">
                    <CardHeader>
                        <CardTitle className="text-neutral-100 flex items-center">
                            <span className="mr-2">🔑</span>
                            Kody Aktywacyjne
                        </CardTitle>
                        <CardDescription className="text-neutral-300">
                            Generuj i zarządzaj kodami aktywacyjnymi
                        </CardDescription>
                    </CardHeader>
                </Card>

                <Card className="bg-neutral-800/90 backdrop-blur-md border-neutral-600/80">
                    <CardHeader>
                        <CardTitle className="text-neutral-100 flex items-center">
                            <span className="mr-2">💼</span>
                            Zawody
                        </CardTitle>
                        <CardDescription className="text-neutral-300">
                            Zarządzaj kategoriami zawodowymi
                        </CardDescription>
                    </CardHeader>
                </Card>

                <Card className="bg-neutral-800/90 backdrop-blur-md border-neutral-600/80">
                    <CardHeader>
                        <CardTitle className="text-neutral-100 flex items-center">
                            <span className="mr-2">📚</span>
                            Słownictwo
                        </CardTitle>
                        <CardDescription className="text-neutral-300">
                            Dodawaj i edytuj słownictwo
                        </CardDescription>
                    </CardHeader>
                </Card>

                <Card className="bg-neutral-800/90 backdrop-blur-md border-neutral-600/80">
                    <CardHeader>
                        <CardTitle className="text-neutral-100 flex items-center">
                            <span className="mr-2">🎥</span>
                            Filmy
                        </CardTitle>
                        <CardDescription className="text-neutral-300">
                            Zarządzaj filmami edukacyjnymi
                        </CardDescription>
                    </CardHeader>
                </Card>

                <Card className="bg-neutral-800/90 backdrop-blur-md border-neutral-600/80">
                    <CardHeader>
                        <CardTitle className="text-neutral-100 flex items-center">
                            <span className="mr-2">🎮</span>
                            Gry
                        </CardTitle>
                        <CardDescription className="text-neutral-300">
                            Twórz i zarządzaj grami edukacyjnymi
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        </div>
    );
}
