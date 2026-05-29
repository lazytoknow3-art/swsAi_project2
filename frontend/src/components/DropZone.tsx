import { useCallback, useState } from "react";
import { Upload, FileX } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/useToast";

interface Props {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}

const MAX_SIZE = 50 * 1024 * 1024;

function validateFiles(files: File[]): { valid: File[]; errors: string[] } {
  const valid: File[] = [];
  const errors: string[] = [];
  files.forEach((f) => {
    if (f.type !== "application/pdf") {
      errors.push(`${f.name}: Only PDF files are allowed`);
    } else if (f.size > MAX_SIZE) {
      errors.push(`${f.name}: Exceeds 50MB limit`);
    } else if (f.size === 0) {
      errors.push(`${f.name}: File is empty`);
    } else {
      valid.push(f);
    }
  });
  return { valid, errors };
}

export function DropZone({ onFiles, disabled }: Props) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (disabled) return;
      const files = Array.from(e.dataTransfer.files);
      const { valid, errors } = validateFiles(files);
      errors.forEach((err) => toast({ title: "Invalid file", description: err, variant: "destructive" }));
      if (valid.length > 0) onFiles(valid);
    },
    [onFiles, disabled]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      const { valid, errors } = validateFiles(files);
      errors.forEach((err) => toast({ title: "Invalid file", description: err, variant: "destructive" }));
      if (valid.length > 0) onFiles(valid);
      e.target.value = "";
    },
    [onFiles]
  );

  return (
    <label
      className={cn(
        "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all",
        dragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-accent/50",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="application/pdf"
        multiple
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
      <div className="flex flex-col items-center gap-3 text-center px-4">
        {dragging ? (
          <Upload className="h-10 w-10 text-primary animate-bounce" />
        ) : (
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="h-5 w-5 text-primary" />
          </div>
        )}
        <div>
          <p className="text-sm font-medium">
            {dragging ? "Drop files here" : "Drag & drop PDFs or click to browse"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">PDF only · Max 50MB per file</p>
        </div>
      </div>
    </label>
  );
}
