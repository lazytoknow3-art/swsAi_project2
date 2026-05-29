import * as React from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToastState } from "@/hooks/useToast";

export function Toaster() {
  const { toasts, setToasts, addListener, dismiss } = useToastState();

  React.useEffect(() => {
    const remove = addListener((t) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => dismiss(t.id), t.duration ?? 4000);
    });
    return remove;
  }, [addListener, setToasts, dismiss]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex items-start gap-3 rounded-lg border p-4 shadow-lg animate-fade-in",
            t.variant === "destructive"
              ? "bg-destructive text-destructive-foreground border-destructive"
              : "bg-card text-card-foreground"
          )}
        >
          {t.variant === "destructive" ? (
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle className="h-5 w-5 shrink-0 mt-0.5 text-green-500" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{t.title}</p>
            {t.description && <p className="text-xs opacity-80 mt-0.5">{t.description}</p>}
          </div>
          <button onClick={() => dismiss(t.id)} className="shrink-0 opacity-70 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
