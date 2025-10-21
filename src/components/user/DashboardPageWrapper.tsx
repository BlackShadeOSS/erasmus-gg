"use client";

import { useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import DashboardSidebar from "@/components/user/DashboardSidebar";
import { Menu, X } from "lucide-react";
import ThemeInitializer from "@/components/ThemeInitializer";

interface DashboardPageWrapperProps {
  username: string;
  children: ReactNode;
}

export default function DashboardPageWrapper({
  username,
  children,
}: DashboardPageWrapperProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <>
      <ThemeInitializer />
      {/* Mobile Header */}
      <div className="lg:hidden bg-card/95 backdrop-blur-md border-b border-border p-4 flex items-center justify-between sticky top-0 z-40">
        <h1 className="text-xl font-bold text-foreground">Panel Ucznia</h1>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="text-muted-foreground hover:text-foreground"
        >
          {isMobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <DashboardSidebar username={username} />
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
                username={username}
                onClose={() => setIsMobileSidebarOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        {children}
      </div>
    </>
  );
}
