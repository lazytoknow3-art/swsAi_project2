import { FileText, X, RotateCcw, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { UploadFileState } from "@/types";
import { formatFileSize } from "@/utils/format";
import { cn } from "@/lib/utils";

interface Props {
  file: UploadFileState;
  onRemove: (id: string) => void;
  onRetry: (file: File) => void;
}

const statusConfig = {
  pending:   { icon: <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />, color: "text-muted-foreground", bg: "bg-muted/50" },
  uploading: { icon: <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />,         color: "text-blue-500",         bg: "bg-blue-500/10" },
  completed: { icon: <CheckCircle className="h-4 w-4 text-green-500" />,                  color: "text-green-500",        bg: "bg-green-500/10" },
  failed:    { icon: <AlertCircle className="h-4 w-4 text-red-500" />,                    color: "text-red-500",          bg: "bg-red-500/10" },
};

export function FileUploadItem({ file, onRemove, onRetry }: Props) {
  const cfg = statusConfig[file.status];

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 animate-fade-in",
      file.status === "completed" && "bg-green-500/5 border-green-500/20",
      file.status === "failed"    && "bg-red-500/5 border-red-500/20",
      file.status === "uploading" && "bg-blue-500/5 border-blue-500/20",
      file.status === "pending"   && "bg-card border-border",
    )}>
      {/* File icon */}
      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", cfg.bg)}>
        <FileText className={cn("h-5 w-5", cfg.color)} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium truncate">{file.file.name}</p>
          <div className="flex items-center gap-1.5 shrink-0">
            {cfg.icon}
            <span className={cn("text-xs capitalize font-medium", cfg.color)}>{file.status}</span>
            {file.status === "uploading" && (
              <span className="text-xs font-bold text-blue-500">{file.progress}%</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">{formatFileSize(file.file.size)}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">PDF</span>
        </div>

        {(file.status === "uploading" || file.status === "pending") && (
          <div className="mt-2">
            <Progress value={file.progress} className="h-1.5" />
          </div>
        )}

        {file.status === "failed" && file.error && (
          <p className="text-xs text-red-500 mt-1">{file.error}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {file.status === "failed" && (
          <Button
            variant="ghost" size="icon"
            className="h-7 w-7 hover:bg-blue-500/10 hover:text-blue-500"
            onClick={() => onRetry(file.file)}
            title="Retry"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          variant="ghost" size="icon"
          className="h-7 w-7 hover:bg-red-500/10 hover:text-red-500"
          onClick={() => onRemove(file.id)}
          title="Remove"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
