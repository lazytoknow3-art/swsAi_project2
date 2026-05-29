import { useState } from "react";
import { CheckCheck, Bell, AlertCircle, CheckCircle, Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useMarkAsRead, useMarkAllAsRead } from "@/hooks/useNotifications";
import { notificationService } from "@/services/notificationService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Notification } from "@/types";
import { formatRelativeTime } from "@/utils/format";
import { cn } from "@/lib/utils";

const typeIcon = {
  SUCCESS: <CheckCircle className="h-4 w-4 text-green-500" />,
  ERROR: <AlertCircle className="h-4 w-4 text-destructive" />,
  INFO: <Info className="h-4 w-4 text-blue-500" />,
};

const typeBadge: Record<Notification["type"], string> = {
  SUCCESS: "success",
  ERROR: "destructive",
  INFO: "info",
};

export function NotificationsPage() {
  const [page, setPage] = useState(0);
  const [type, setType] = useState("");

  // Use staleTime: 0 so any invalidation immediately triggers a refetch
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
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllAsRead.mutate()}>
            <CheckCheck className="h-4 w-4 mr-1.5" />
            Mark all read
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">All Notifications</CardTitle>
            <Select
              value={type || "all"}
              onValueChange={(v) => { setType(v === "all" ? "" : v); setPage(0); }}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="SUCCESS">Success</SelectItem>
                <SelectItem value="ERROR">Error</SelectItem>
                <SelectItem value="INFO">Info</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !data?.content.length ? (
            <div className="p-12 text-center">
              <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Notifications will appear here after uploading files
              </p>
            </div>
          ) : (
            <div>
              {data.content.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 border-b last:border-0 transition-colors",
                    !n.isRead && "bg-primary/5"
                  )}
                >
                  <div className="mt-0.5 shrink-0">{typeIcon[n.type]}</div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm", !n.isRead && "font-medium")}>{n.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={typeBadge[n.type] as any} className="text-[10px] px-1.5 py-0">
                        {n.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(n.createdAt)}
                      </span>
                    </div>
                  </div>
                  {!n.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs shrink-0"
                      onClick={() => markAsRead.mutate(n.id)}
                    >
                      Mark read
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">
                Page {page + 1} of {data.totalPages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={data.last} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
