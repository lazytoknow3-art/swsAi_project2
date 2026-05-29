import { useState } from "react";
import { CheckCheck, Bell, AlertCircle, CheckCircle, Info, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useMarkAsRead, useMarkAllAsRead } from "@/hooks/useNotifications";
import { notificationService } from "@/services/notificationService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Notification } from "@/types";
import { formatRelativeTime } from "@/utils/format";
import { cn } from "@/lib/utils";

const typeConfig = {
  SUCCESS: {
    icon: CheckCircle,
    color: "text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    label: "Success",
  },
  ERROR: {
    icon: AlertCircle,
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    label: "Error",
  },
  INFO: {
    icon: Info,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    label: "Info",
  },
};

export function NotificationsPage() {
  const [page, setPage] = useState(0);
  const [type, setType] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", { page, size: 20, type }],
    queryFn: () =>
      notificationService.getAll({ page, size: 20, type: type || undefined }).then((r) => r.data.data),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const unreadCount = data?.content.filter((n) => !n.isRead).length ?? 0;

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {unreadCount > 0
              ? <span className="text-primary font-medium">{unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}</span>
              : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline" size="sm"
            onClick={() => markAllAsRead.mutate()}
            className="gap-1.5 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              All Notifications
              {data && data.totalElements > 0 && (
                <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {data.totalElements}
                </span>
              )}
            </CardTitle>
            <Select value={type || "all"} onValueChange={(v) => { setType(v === "all" ? "" : v); setPage(0); }}>
              <SelectTrigger className="w-36 bg-background">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="SUCCESS">✅ Success</SelectItem>
                <SelectItem value="ERROR">❌ Error</SelectItem>
                <SelectItem value="INFO">ℹ️ Info</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : !data?.content.length ? (
            <div className="p-16 text-center">
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-medium">No notifications yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Upload a PDF and notifications will appear here in real time
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {data.content.map((n, i) => {
                const cfg = typeConfig[n.type];
                const Icon = cfg.icon;
                return (
                  <div
                    key={n.id}
                    className={cn(
                      "flex items-start gap-3 px-4 py-4 transition-colors animate-fade-in",
                      !n.isRead ? "bg-primary/[0.03]" : "hover:bg-muted/30"
                    )}
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    {/* Icon */}
                    <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5", cfg.bg)}>
                      <Icon className={cn("h-4 w-4", cfg.color)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm leading-snug", !n.isRead && "font-semibold")}>
                        {n.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-md border", cfg.bg, cfg.color, cfg.border)}>
                          {cfg.label}
                        </span>
                        <span className="text-xs text-muted-foreground">{formatRelativeTime(n.createdAt)}</span>
                        {!n.isRead && (
                          <span className="flex items-center gap-1 text-[10px] text-primary font-medium">
                            <Sparkles className="h-2.5 w-2.5" />
                            New
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Unread dot + action */}
                    <div className="flex items-center gap-2 shrink-0">
                      {!n.isRead && (
                        <>
                          <span className="h-2 w-2 rounded-full bg-primary" />
                          <Button
                            variant="ghost" size="sm"
                            className="h-7 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => markAsRead.mutate(n.id)}
                          >
                            Mark read
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
              <p className="text-sm text-muted-foreground">Page {page + 1} of {data.totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={data.last} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
