"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import AuthNavBar from "@/components/AuthNavBar";

interface DashboardSidebarProps {
  username: string;
  onLogout?: () => void;
}

export default function DashboardSidebar({ username, onLogout }: DashboardSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
      return;
    }
    
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
    { label: "Panel", icon: "🏠", path: "/dashboard" },
    { label: "Słownictwo", icon: "📚", path: "/dashboard/vocabulary" },
    { label: "Filmy", icon: "🎥", path: "/dashboard/videos" },
    { label: "Gry", icon: "🎮", path: "/dashboard/games" },
    { label: "Postęp", icon: "📊", path: "/dashboard/progress" },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <div className="w-64 bg-neutral-900/50 backdrop-blur-md border-r border-neutral-800 min-h-screen p-4">
      <div className="mb-8">
        <AuthNavBar inline />
        <p className="text-neutral-400 text-sm mt-2">Panel Ucznia</p>
        <p className="text-neutral-300 text-sm">Witaj, {username}</p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.path}
            variant={isActive(item.path) ? "default" : "secondary"}
            className={`w-full justify-start text-left ${
              isActive(item.path)
                ? "bg-amber-600 hover:bg-amber-700 text-white"
                : "text-neutral-300 hover:text-white hover:bg-neutral-800"
            }`}
            onClick={() => router.push(item.path)}
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
  );
}
