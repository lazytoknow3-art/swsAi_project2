import { Bell, Moon, Sun, FileText, Upload, LayoutDashboard } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useThemeStore } from "@/store/themeStore";
import { useNotificationStore } from "@/store/notificationStore";
import { useUnreadCount } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

const navLinks = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/upload", label: "Upload", icon: Upload },
  { to: "/notifications", label: "Notifications", icon: Bell },
];

export function Header() {
  const { theme, toggleTheme } = useThemeStore();
  const { unreadCount, setUnreadCount } = useNotificationStore();
  const location = useLocation();

  const { data: serverCount } = useUnreadCount();
  if (serverCount !== undefined && serverCount !== unreadCount) {
    setUnreadCount(serverCount);
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md group-hover:shadow-blue-500/30 transition-shadow">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-base gradient-text hidden sm:block">DocManager</span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {navLinks.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                  active
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
                {active && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-primary" />
                )}
                {to === "/notifications" && unreadCount > 0 && (
                  <span className="ml-0.5 h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="ghost" size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 rounded-lg hover:bg-accent"
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === "light"
              ? <Moon className="h-4 w-4" />
              : <Sun className="h-4 w-4 text-yellow-400" />}
          </Button>

          <Link to="/notifications">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg relative hover:bg-accent">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <>
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive animate-ping opacity-75" />
                </>
              )}
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex border-t px-4 py-1.5 gap-1 overflow-x-auto">
        {navLinks.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors",
                active ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
