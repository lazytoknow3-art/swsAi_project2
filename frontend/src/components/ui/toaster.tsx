import * as React from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToastState } from "@/hooks/useToast";

export function Toaster() {
  const { toasts, setToasts, addListener, dismiss } = useToastState();

  React.useEffect(() => {
    const remove = addListener((t) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => dismiss(t.id), t.duration ?? 4500);
    });
    return remove;
  }, [addListener, setToasts, dismiss]);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 w-80 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-xl animate-slide-right",
            t.variant === "destructive"
              ? "bg-red-950 border-red-800 text-red-100"
              : "bg-card border-border text-card-foreground"
          )}
        >
          <div className={cn(
            "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
            t.variant === "destructive" ? "bg-red-800" : "bg-green-500/10"
          )}>
            {t.variant === "destructive"
              ? <AlertCircle className="h-4 w-4 text-red-300" />
              : <CheckCircle className="h-4 w-4 text-green-500" />}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-sm font-semibold leading-tight">{t.title}</p>
            {t.description && (
              <p className={cn("text-xs mt-0.5 leading-snug", t.variant === "destructive" ? "text-red-300" : "text-muted-foreground")}>
                {t.description}
              </p>
            )}
          </div>
          <button
            onClick={() => dismiss(t.id)}
            className={cn("shrink-0 rounded-md p-0.5 opacity-60 hover:opacity-100 transition-opacity mt-0.5",
              t.variant === "destructive" ? "hover:bg-red-800" : "hover:bg-muted"
            )}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
