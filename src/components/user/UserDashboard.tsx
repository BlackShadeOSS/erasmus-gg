"use client";

import { useRouter } from "next/navigation";
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
import DashboardSidebar from "@/components/user/DashboardSidebar";
import { Menu, X } from "lucide-react";

interface UserDashboardProps {
  user: UserSession;
}

export default function UserDashboard({ user }: UserDashboardProps) {
  const router = useRouter();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const goToVocabulary = () => router.push("/dashboard/vocabulary");
  const goToGames = () => router.push("/dashboard/games");
  const goToVideos = () => router.push("/dashboard/videos");
  const goToProgress = () => router.push("/dashboard/progress");

  return (
    <div className="min-h-screen bg-neutral-900 relative">
      <div>
        <GlowingCircle />
        <GlowingCircle isRight={true} />
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800 p-4 flex items-center justify-between sticky top-0 z-40">
        <h1 className="text-xl font-bold text-neutral-100">Panel Ucznia</h1>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="text-neutral-300 hover:text-white"
        >
          {isMobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <DashboardSidebar username={user.username} />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="relative">
              <DashboardSidebar
                username={user.username}
                onClose={() => setIsMobileSidebarOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-8">
          <div className="space-y-6">
            <div className="hidden lg:block">
              <h1 className="text-3xl font-bold text-neutral-100">
                Witaj ponownie, {user.username}!
              </h1>
              <p className="text-neutral-400 mt-2">
                Kontynuuj swoją naukę angielskiego
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
                  <Button
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                    onClick={goToVocabulary}
                  >
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
                  <Button
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                    onClick={goToVideos}
                  >
                    Oglądaj Teraz
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-neutral-800/90 backdrop-blur-md border-neutral-600/80">
                <CardHeader>
                  <CardTitle className="text-neutral-100 flex items-center">
                    <span className="mr-2">🎮</span>
                    Ćwiczenia
                  </CardTitle>
                  <CardDescription className="text-neutral-300">
                    Rozwiązuj ćwiczenia edukacyjne
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                    onClick={goToGames}
                  >
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
                  <Button
                    onClick={goToProgress}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                  >
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
