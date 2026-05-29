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

const statusIcon = {
  pending: <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />,
  uploading: <Loader2 className="h-4 w-4 text-primary animate-spin" />,
  completed: <CheckCircle className="h-4 w-4 text-green-500" />,
  failed: <AlertCircle className="h-4 w-4 text-destructive" />,
};

export function FileUploadItem({ file, onRemove, onRetry }: Props) {
  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg border bg-card animate-fade-in",
      file.status === "failed" && "border-destructive/50 bg-destructive/5"
    )}>
      <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
        <FileText className="h-5 w-5 text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium truncate">{file.file.name}</p>
          <div className="flex items-center gap-1 shrink-0">
            {statusIcon[file.status]}
            <span className="text-xs text-muted-foreground capitalize">{file.status}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">{formatFileSize(file.file.size)}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">PDF</span>
          {file.status === "uploading" && (
            <>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-primary font-medium">{file.progress}%</span>
            </>
          )}
        </div>

        {(file.status === "uploading" || file.status === "pending") && (
          <Progress value={file.progress} className="mt-2 h-1.5" />
        )}

        {file.status === "failed" && file.error && (
          <p className="text-xs text-destructive mt-1">{file.error}</p>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {file.status === "failed" && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onRetry(file.file)}>
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onRemove(file.id)}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
