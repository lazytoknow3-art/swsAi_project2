import { useState, useCallback } from "react";

export interface ToastProps {
  id?: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
}

type ToastState = ToastProps & { id: string };

let toastListeners: ((toast: ToastState) => void)[] = [];

export function toast(props: ToastProps) {
  const id = Math.random().toString(36).slice(2);
  const t: ToastState = { ...props, id };
  toastListeners.forEach((l) => l(t));
}

export function useToastState() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const addListener = useCallback((listener: (t: ToastState) => void) => {
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, setToasts, addListener, dismiss };
}
