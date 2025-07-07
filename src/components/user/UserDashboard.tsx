"use client";

import { useRouter } from "next/navigation";
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

interface UserDashboardProps {
    user: UserSession;
}

export default function UserDashboard({ user }: UserDashboardProps) {
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
                        <p className="text-neutral-400 text-sm mt-2">
                            Panel Ucznia
                        </p>
                        <p className="text-neutral-300 text-sm">
                            Witaj, {user.username}
                        </p>
                    </div>

                    <nav className="space-y-2">
                        <Button
                            variant="default"
                            className="w-full justify-start text-left bg-amber-600 hover:bg-amber-700 text-white"
                        >
                            <span className="mr-2">🏠</span>
                            Panel
                        </Button>
                        <Button
                            variant="secondary"
                            className="w-full justify-start text-left text-neutral-300 hover:text-white hover:bg-neutral-800"
                        >
                            <span className="mr-2">📚</span>
                            Słownictwo
                        </Button>
                        <Button
                            variant="secondary"
                            className="w-full justify-start text-left text-neutral-300 hover:text-white hover:bg-neutral-800"
                        >
                            <span className="mr-2">🎥</span>
                            Filmy
                        </Button>
                        <Button
                            variant="secondary"
                            className="w-full justify-start text-left text-neutral-300 hover:text-white hover:bg-neutral-800"
                        >
                            <span className="mr-2">🎮</span>
                            Gry
                        </Button>
                        <Button
                            variant="secondary"
                            className="w-full justify-start text-left text-neutral-300 hover:text-white hover:bg-neutral-800"
                        >
                            <span className="mr-2">📊</span>
                            Postęp
                        </Button>
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
                <div className="flex-1 p-8">
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-100">
                                Witaj ponownie, {user.username}!
                            </h1>
                            <p className="text-neutral-400 mt-2">
                                Kontynuuj swoją naukę angielskiego
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Card className="bg-neutral-800/90 backdrop-blur-md border-neutral-600/80">
                                <CardHeader>
                                    <CardTitle className="text-neutral-100 flex items-center">
                                        <span className="mr-2">📚</span>
                                        Słownictwo
                                    </CardTitle>
                                    <CardDescription className="text-neutral-300">
                                        Ucz się nowych słów i zwrotów
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                                        Rozpocznij Naukę
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="bg-neutral-800/90 backdrop-blur-md border-neutral-600/80">
                                <CardHeader>
                                    <CardTitle className="text-neutral-100 flex items-center">
                                        <span className="mr-2">🎥</span>
                                        Filmy
                                    </CardTitle>
                                    <CardDescription className="text-neutral-300">
                                        Oglądaj filmy edukacyjne
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                                        Oglądaj Teraz
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="bg-neutral-800/90 backdrop-blur-md border-neutral-600/80">
                                <CardHeader>
                                    <CardTitle className="text-neutral-100 flex items-center">
                                        <span className="mr-2">🎮</span>
                                        Gry
                                    </CardTitle>
                                    <CardDescription className="text-neutral-300">
                                        Graj w gry edukacyjne
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                                        Zagraj
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="bg-neutral-800/90 backdrop-blur-md border-neutral-600/80">
                                <CardHeader>
                                    <CardTitle className="text-neutral-100 flex items-center">
                                        <span className="mr-2">📊</span>
                                        Postęp
                                    </CardTitle>
                                    <CardDescription className="text-neutral-300">
                                        Śledź swój postęp w nauce
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                                        Zobacz Postęp
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="bg-neutral-800/90 backdrop-blur-md border-neutral-600/80">
                                <CardHeader>
                                    <CardTitle className="text-neutral-100 flex items-center">
                                        <span className="mr-2">⚙️</span>
                                        Ustawienia
                                    </CardTitle>
                                    <CardDescription className="text-neutral-300">
                                        Zarządzaj ustawieniami konta
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                                        Otwórz Ustawienia
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
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
