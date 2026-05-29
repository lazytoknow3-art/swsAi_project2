import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { sseClient } from "@/services/sseService";
import { useNotificationStore } from "@/store/notificationStore";
import { Notification, Document } from "@/types";
import { toast } from "@/hooks/useToast";

export function useSSE() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    sseClient.connect();

    const handleNotification = (data: unknown) => {
      const notification = data as Notification;
      addNotification(notification);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });

      toast({
        title: notification.type === "SUCCESS" ? "✅ Success" : notification.type === "ERROR" ? "❌ Error" : "ℹ️ Info",
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
  }, [queryClient, addNotification]);
}
