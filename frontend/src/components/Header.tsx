import { Bell, Moon, Sun, FileText } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useThemeStore } from "@/store/themeStore";
import { useNotificationStore } from "@/store/notificationStore";
import { useUnreadCount } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

export function Header() {
  const { theme, toggleTheme } = useThemeStore();
  const { unreadCount, setUnreadCount } = useNotificationStore();
  const location = useLocation();

  const { data: serverCount } = useUnreadCount();

  if (serverCount !== undefined && serverCount !== unreadCount) {
    setUnreadCount(serverCount);
  }

  const navLinks = [
    { to: "/", label: "Dashboard" },
    { to: "/upload", label: "Upload" },
    { to: "/notifications", label: "Notifications" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 font-semibold text-primary">
            <FileText className="h-5 w-5" />
            <span>DocManager</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm transition-colors",
                  location.pathname === link.to
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
          <Link to="/notifications">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
