"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LineShadowText } from "@/components/ui/line-shadow-text";
import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";
import GlowingCircle from "@/components/ui/glowing-circle";
import NoiseFilter from "@/components/NoiseFilter";
import { UserSession } from "@/lib/auth";
import { useCallback, useMemo, useState } from "react";
import AuthNavBar from "@/components/AuthNavBar";
import { Menu, X } from "lucide-react";

interface AdminLayoutProps {
  user: UserSession;
  children: React.ReactNode;
}

export default function AdminLayout({ user, children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const menuItems = useMemo(
    () => [
      {
        id: "overview",
        label: "Przegląd",
        icon: "📊",
        path: "/admin-panel",
      },
      {
        id: "users",
        label: "Użytkownicy",
        icon: "👥",
        path: "/admin-panel/users",
      },
      {
        id: "activation-codes",
        label: "Kody Aktywacyjne",
        icon: "🔑",
        path: "/admin-panel/activation-codes",
      },
      {
        id: "professions",
        label: "Zawody",
        icon: "💼",
        path: "/admin-panel/professions",
      },
      {
        id: "vocabulary",
        label: "Słownictwo",
        icon: "📚",
        path: "/admin-panel/vocabulary",
      },
      {
        id: "vocabulary-import",
        label: "Import Słownictwa",
        icon: "📥",
        path: "/admin-panel/vocabulary-import",
      },
      {
        id: "videos",
        label: "Filmy",
        icon: "🎥",
        path: "/admin-panel/videos",
      },
      {
        id: "games",
        label: "Gry",
        icon: "🎮",
        path: "/admin-panel/games",
      },
    ],
    []
  );

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
            <AuthNavBar inline />
            <p className="text-stone-400 text-sm mt-2">Panel Administratora</p>
            <p className="text-stone-300 text-sm">Witaj, {user.username}</p>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive =
                pathname === item.path ||
                (item.path === "/admin-panel" &&
                  pathname === "/admin-panel/overview");

              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "secondary"}
                  className={cn(
                    "w-full justify-start text-left",
                    isActive
                      ? "bg-amber-600 hover:bg-amber-700 text-white"
                      : "text-stone-300 hover:text-white hover:bg-neutral-800"
                  )}
                  onClick={() => router.push(item.path)}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Button>
              );
            })}
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
                  <AuthNavBar inline />
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
                {menuItems.map((item) => {
                  const isActive =
                    pathname === item.path ||
                    (item.path === "/admin-panel" &&
                      pathname === "/admin-panel/overview");

                  return (
                    <Button
                      key={item.id}
                      variant={isActive ? "default" : "secondary"}
                      className={cn(
                        "w-full justify-start text-left",
                        isActive
                          ? "bg-amber-600 hover:bg-amber-700 text-white"
                          : "text-stone-300 hover:text-white hover:bg-neutral-800"
                      )}
                      onClick={() => {
                        router.push(item.path);
                        setIsMobileSidebarOpen(false);
                      }}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.label}
                    </Button>
                  );
                })}
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
          {children}
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
