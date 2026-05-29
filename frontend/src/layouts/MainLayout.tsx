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
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}
