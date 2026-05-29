import api from "./api";
import { ApiResponse, Notification, PagedResponse } from "@/types";

export const notificationService = {
  getAll(params: { page?: number; size?: number; type?: string } = {}) {
    return api.get<ApiResponse<PagedResponse<Notification>>>("/notifications", { params });
  },

  getUnreadCount() {
    return api.get<ApiResponse<{ count: number }>>("/notifications/unread-count");
  },

  markAsRead(id: number) {
    return api.patch<ApiResponse<Notification>>(`/notifications/${id}/read`);
  },

  markAllAsRead() {
    return api.patch<ApiResponse<{ updated: number }>>("/notifications/read-all");
  },
};
