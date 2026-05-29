import { useCallback, useState } from "react";
import { Upload, FileX, CloudUpload } from "lucide-react";
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
    if (f.type !== "application/pdf") errors.push(`${f.name}: Only PDF files are allowed`);
    else if (f.size > MAX_SIZE) errors.push(`${f.name}: Exceeds 50MB limit`);
    else if (f.size === 0) errors.push(`${f.name}: File is empty`);
    else valid.push(f);
  });
  return { valid, errors };
}

export function DropZone({ onFiles, disabled }: Props) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const files = Array.from(e.dataTransfer.files);
    const { valid, errors } = validateFiles(files);
    errors.forEach((err) => toast({ title: "Invalid file", description: err, variant: "destructive" }));
    if (valid.length > 0) onFiles(valid);
  }, [onFiles, disabled]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const { valid, errors } = validateFiles(files);
    errors.forEach((err) => toast({ title: "Invalid file", description: err, variant: "destructive" }));
    if (valid.length > 0) onFiles(valid);
    e.target.value = "";
  }, [onFiles]);

  return (
    <label
      className={cn(
        "relative flex flex-col items-center justify-center w-full h-52 rounded-2xl cursor-pointer transition-all duration-200 overflow-hidden",
        "border-2 border-dashed",
        dragging
          ? "border-primary bg-primary/5 scale-[1.01] shadow-lg shadow-primary/10"
          : "border-border hover:border-primary/50 hover:bg-accent/30",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none"
      )}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{ backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "24px 24px" }}
      />

      <input type="file" accept="application/pdf" multiple className="hidden" onChange={handleChange} disabled={disabled} />

      <div className="relative flex flex-col items-center gap-3 text-center px-6">
        <div className={cn(
          "h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-200",
          dragging
            ? "bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/30"
            : "bg-primary/10 text-primary"
        )}>
          {dragging
            ? <CloudUpload className="h-7 w-7 animate-bounce" />
            : <Upload className="h-7 w-7" />}
        </div>

        <div>
          <p className="font-semibold text-base">
            {dragging ? "Drop your files here" : "Drag & drop PDFs here"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            or <span className="text-primary font-medium underline underline-offset-2">browse files</span> from your computer
          </p>
        </div>
      </div>
    </label>
  );
}
