"use client";

import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useMemo,
  useCallback,
} from "react";
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
import { useRouter, useSearchParams } from "next/navigation";
import { BarChart, DonutChart } from "@/components/ui/charts";
import { Menu, X } from "lucide-react";

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

// Create context for section change handler
const SectionChangeContext = createContext<
  ((section: AdminSection) => void) | null
>(null);

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get section from URL params, default to "overview"
  const sectionFromUrl = searchParams.get("section") as AdminSection;
  const validSections: AdminSection[] = [
    "overview",
    "users",
    "activation-codes",
    "professions",
    "vocabulary",
    "videos",
    "games",
  ];
  const [activeSection, setActiveSection] = useState<AdminSection>(
    validSections.includes(sectionFromUrl) ? sectionFromUrl : "overview"
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Memoize menu items to prevent re-creation
  const menuItems = useMemo(
    () => [
      { id: "overview", label: "Przegląd", icon: "📊" },
      { id: "users", label: "Użytkownicy", icon: "👥" },
      { id: "activation-codes", label: "Kody Aktywacyjne", icon: "🔑" },
      { id: "professions", label: "Zawody", icon: "💼" },
      { id: "vocabulary", label: "Słownictwo", icon: "📚" },
      { id: "videos", label: "Filmy", icon: "🎥" },
      { id: "games", label: "Gry", icon: "🎮" },
    ],
    []
  );

  // Optimized section change handler with debouncing
  const handleSectionChange = useCallback(
    (section: AdminSection) => {
      if (section === activeSection) return; // Prevent unnecessary updates

      setIsTransitioning(true);
      setActiveSection(section);

      // Use setTimeout to make URL update non-blocking
      setTimeout(() => {
        const url = new URL(window.location.href);
        url.searchParams.set("section", section);
        router.replace(url.pathname + url.search);
        setIsTransitioning(false);
      }, 0);
    },
    [activeSection, router]
  );

  // Optimized URL sync with reduced re-renders
  useEffect(() => {
    const urlSection = searchParams.get("section") as AdminSection;
    if (
      validSections.includes(urlSection) &&
      urlSection !== activeSection &&
      !isTransitioning
    ) {
      setActiveSection(urlSection);
    }
  }, [searchParams]); // Removed activeSection from deps to prevent loops

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, [router]);

  // Memoized content renderer to prevent unnecessary re-renders
  const renderContent = useCallback(() => {
    // Show loading state during transitions
    if (isTransitioning) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-neutral-400">Ładowanie...</div>
        </div>
      );
    }

    switch (activeSection) {
      case "overview":
        return (
          <SectionChangeContext.Provider value={handleSectionChange}>
            <AdminOverview />
          </SectionChangeContext.Provider>
        );
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
        return (
          <SectionChangeContext.Provider value={handleSectionChange}>
            <AdminOverview />
          </SectionChangeContext.Provider>
        );
    }
  }, [activeSection, isTransitioning, handleSectionChange]);

  return (
    <div className="min-h-screen bg-neutral-900 relative">
      <div>
        <GlowingCircle />
        <GlowingCircle isRight={true} />
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800 p-4 flex items-center justify-between sticky top-0 z-40">
        <h1 className="text-xl font-bold text-neutral-100">
          Panel Administratora
        </h1>
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
        <div className="hidden lg:block w-64 bg-neutral-900/50 backdrop-blur-md border-r border-neutral-800 min-h-screen p-4">
          <div className="mb-8">
            <LineShadowText
              className="text-amber-200 text-2xl font-bold"
              shadowColor="#fdef7b"
            >
              VocEnglish
            </LineShadowText>
            <p className="text-stone-400 text-sm mt-2">Panel Administratora</p>
            <p className="text-stone-300 text-sm">Witaj, {user.username}</p>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "default" : "secondary"}
                className={cn(
                  "w-full justify-start text-left",
                  activeSection === item.id
                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                    : "text-stone-300 hover:text-white hover:bg-neutral-800"
                )}
                onClick={() => handleSectionChange(item.id as AdminSection)}
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

        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="relative w-64 bg-neutral-900/95 backdrop-blur-md border-r border-neutral-800 min-h-screen p-4">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <LineShadowText
                    className="text-amber-200 text-xl font-bold"
                    shadowColor="#fdef7b"
                  >
                    VocEnglish
                  </LineShadowText>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="text-neutral-400 hover:text-white"
                  >
                    <X size={16} />
                  </Button>
                </div>
                <p className="text-stone-400 text-sm mt-2">
                  Panel Administratora
                </p>
                <p className="text-stone-300 text-sm">Witaj, {user.username}</p>
              </div>

              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={
                      activeSection === item.id ? "default" : "secondary"
                    }
                    className={cn(
                      "w-full justify-start text-left",
                      activeSection === item.id
                        ? "bg-amber-600 hover:bg-amber-700 text-white"
                        : "text-stone-300 hover:text-white hover:bg-neutral-800"
                    )}
                    onClick={() => {
                      handleSectionChange(item.id as AdminSection);
                      setIsMobileSidebarOpen(false);
                    }}
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
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-6 lg:p-8 bg-neutral-900/20 backdrop-blur-sm">
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

// Memoized AdminOverview component to prevent unnecessary re-renders
const AdminOverview = React.memo(function AdminOverview() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const handleSectionChange = useContext(SectionChangeContext);

  // Memoized fetch function
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/stats");
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Memoized overview cards to prevent re-creation
  const overviewCards = useMemo(
    () => [
      {
        id: "users",
        icon: "👥",
        title: "Użytkownicy",
        description: "Zarządzaj kontami użytkowników i uprawnieniami",
        section: "users" as AdminSection,
      },
      {
        id: "activation-codes",
        icon: "🔑",
        title: "Kody Aktywacyjne",
        description: "Generuj i zarządzaj kodami aktywacyjnymi",
        section: "activation-codes" as AdminSection,
      },
      {
        id: "professions",
        icon: "💼",
        title: "Zawody",
        description: "Zarządzaj kategoriami zawodowymi",
        section: "professions" as AdminSection,
      },
      {
        id: "vocabulary",
        icon: "📚",
        title: "Słownictwo",
        description: "Dodawaj i edytuj słownictwo oraz kategorie",
        section: "vocabulary" as AdminSection,
      },
      {
        id: "videos",
        icon: "🎥",
        title: "Filmy",
        description: "Zarządzaj filmami edukacyjnymi",
        section: "videos" as AdminSection,
      },
      {
        id: "games",
        icon: "🎮",
        title: "Gry",
        description: "Twórz i zarządzaj grami edukacyjnymi",
        section: "games" as AdminSection,
      },
    ],
    []
  );

  if (loading) {
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
        <div className="text-center py-8 text-neutral-400">
          Ładowanie statystyk...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-100">
          Panel Administratora
        </h1>
        <p className="text-neutral-400 mt-2">Zarządzaj platformą VocEnglish</p>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-neutral-800/90 backdrop-blur-md border border-neutral-600/80 rounded-lg p-4">
            <div className="text-2xl font-bold text-amber-400">
              {stats.users?.total || 0}
            </div>
            <div className="text-sm text-neutral-400">Użytkownicy</div>
            <div className="text-xs text-neutral-500 mt-1">
              {stats.users?.newThisMonth || 0} nowych w tym miesiącu
            </div>
          </div>
          <div className="bg-neutral-800/90 backdrop-blur-md border border-neutral-600/80 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">
              {stats.activationCodes?.unused || 0}
            </div>
            <div className="text-sm text-neutral-400">Kody dostępne</div>
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
              {(stats.videos?.total || 0) + (stats.games?.total || 0)}
            </div>
            <div className="text-sm text-neutral-400">Materiały</div>
            <div className="text-xs text-neutral-500 mt-1">
              {stats.videos?.total || 0} filmów, {stats.games?.total || 0} gier
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
            onClick={() =>
              handleSectionChange && handleSectionChange(card.section)
            }
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
                        <span className="text-neutral-400">Razem:</span>
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
                          {stats.users?.recentLogins || 0}
                        </span>
                      </div>
                    </>
                  )}
                  {card.id === "activation-codes" && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">Razem:</span>
                        <span className="text-neutral-200">
                          {stats.activationCodes?.total || 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">Używane:</span>
                        <span className="text-amber-400">
                          {stats.activationCodes?.used || 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">Dostępne:</span>
                        <span className="text-green-400">
                          {stats.activationCodes?.unused || 0}
                        </span>
                      </div>
                    </>
                  )}
                  {card.id === "professions" && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">Razem:</span>
                        <span className="text-neutral-200">
                          {stats.professions?.total || 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">Aktywne:</span>
                        <span className="text-green-400">
                          {stats.professions?.active || 0}
                        </span>
                      </div>
                    </>
                  )}
                  {card.id === "vocabulary" && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">Razem:</span>
                        <span className="text-neutral-200">
                          {stats.vocabulary?.total || 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">Aktywne:</span>
                        <span className="text-green-400">
                          {stats.vocabulary?.active || 0}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-500 mt-2">
                        Poziomy: 1-5 (max:{" "}
                        {Math.max(
                          ...Object.values(stats.vocabulary?.byLevel || {}).map(
                            (v: any) => Number(v) || 0
                          )
                        )}
                        )
                      </div>
                    </>
                  )}
                  {card.id === "videos" && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">Razem:</span>
                        <span className="text-neutral-200">
                          {stats.videos?.total || 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">Aktywne:</span>
                        <span className="text-green-400">
                          {stats.videos?.active || 0}
                        </span>
                      </div>
                    </>
                  )}
                  {card.id === "games" && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">Razem:</span>
                        <span className="text-neutral-200">
                          {stats.games?.total || 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">Aktywne:</span>
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
                    value: stats.vocabulary?.byLevel?.level1 || 0,
                    color: "bg-green-500",
                  },
                  {
                    label: "Poziom 2",
                    value: stats.vocabulary?.byLevel?.level2 || 0,
                    color: "bg-blue-500",
                  },
                  {
                    label: "Poziom 3",
                    value: stats.vocabulary?.byLevel?.level3 || 0,
                    color: "bg-yellow-500",
                  },
                  {
                    label: "Poziom 4",
                    value: stats.vocabulary?.byLevel?.level4 || 0,
                    color: "bg-orange-500",
                  },
                  {
                    label: "Poziom 5",
                    value: stats.vocabulary?.byLevel?.level5 || 0,
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
                    value: stats.games?.byType?.flashcards || 0,
                    color: "#10b981",
                  },
                  {
                    label: "Quiz",
                    value: stats.games?.byType?.quiz || 0,
                    color: "#3b82f6",
                  },
                  {
                    label: "Dopasowanie",
                    value: stats.games?.byType?.matching || 0,
                    color: "#f59e0b",
                  },
                  {
                    label: "Przeciągnij",
                    value: stats.games?.byType?.dragdrop || 0,
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
                    value: stats.activationCodes?.unused || 0,
                    color: "#10b981",
                  },
                  {
                    label: "Używane",
                    value: stats.activationCodes?.used || 0,
                    color: "#f59e0b",
                  },
                  {
                    label: "Wygasłe",
                    value: stats.activationCodes?.expired || 0,
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
});
