import { create } from "zustand";
import { Notification } from "@/types";

interface NotificationStore {
  unreadCount: number;
  recentNotifications: Notification[];
  setUnreadCount: (count: number) => void;
  incrementUnread: () => void;
  addNotification: (n: Notification) => void;
  markRead: (id: number) => void;
  markAllRead: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  unreadCount: 0,
  recentNotifications: [],

  setUnreadCount: (count) => set({ unreadCount: count }),

  incrementUnread: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),

  addNotification: (n) =>
    set((s) => ({
      recentNotifications: [n, ...s.recentNotifications].slice(0, 10),
      unreadCount: s.unreadCount + (n.isRead ? 0 : 1),
    })),

  markRead: (id) =>
    set((s) => ({
      recentNotifications: s.recentNotifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, s.unreadCount - 1),
    })),

  markAllRead: () =>
    set((s) => ({
      recentNotifications: s.recentNotifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),
}));
