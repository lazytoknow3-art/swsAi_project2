import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { sseClient } from "@/services/sseService";
import { useNotificationStore } from "@/store/notificationStore";
import { Notification, Document } from "@/types";
import { toast } from "@/hooks/useToast";

export function useSSE() {
  const queryClient = useQueryClient();
  const { addNotification, setUnreadCount } = useNotificationStore();

  useEffect(() => {
    sseClient.connect();

    const handleNotification = (data: unknown) => {
      const notification = data as Notification;

      // Add to local store
      addNotification(notification);

      // Invalidate all notification queries so the page refetches
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });

      // Refetch unread count immediately and sync to store
      queryClient.fetchQuery({
        queryKey: ["notifications-unread"],
        queryFn: () =>
          import("@/services/notificationService").then((m) =>
            m.notificationService.getUnreadCount().then((r) => r.data.data.count)
          ),
      }).then((count) => setUnreadCount(count));

      toast({
        title:
          notification.type === "SUCCESS"
            ? "✅ Upload Complete"
            : notification.type === "ERROR"
            ? "❌ Upload Failed"
            : "ℹ️ Info",
        description: notification.message,
        variant: notification.type === "ERROR" ? "destructive" : "default",
      });
    };

    const handleDocumentUpdate = (data: unknown) => {
      const doc = data as Document;
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.setQueryData(["document", doc.id], doc);
    };

    sseClient.on("notification", handleNotification);
    sseClient.on("document-update", handleDocumentUpdate);

    return () => {
      sseClient.off("notification", handleNotification);
      sseClient.off("document-update", handleDocumentUpdate);
    };
  }, [queryClient, addNotification, setUnreadCount]);
}
