import { Outlet } from "react-router-dom";
import { Header } from "@/components/Header";
import { Toaster } from "@/components/ui/toaster";
import { useSSE } from "@/hooks/useSSE";
import { useThemeStore } from "@/store/themeStore";
import { useEffect } from "react";

export function MainLayout() {
  const { theme } = useThemeStore();
  useSSE();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle gradient orbs in background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-3xl" />
      </div>

      <Header />

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>

      <Toaster />
    </div>
  );
}
