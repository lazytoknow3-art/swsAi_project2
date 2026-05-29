import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/StatusBadge";
import { Document } from "@/types";
import { formatFileSize, formatDate } from "@/utils/format";
import { FileText } from "lucide-react";

interface Props {
  document: Document | null;
  open: boolean;
  onClose: () => void;
}

export function DocumentMetadataDialog({ document, open, onClose }: Props) {
  if (!document) return null;

  const rows = [
    { label: "File Name", value: document.originalFileName },
    { label: "File Size", value: formatFileSize(document.fileSize) },
    { label: "File Type", value: document.fileType },
    { label: "Status", value: <StatusBadge status={document.uploadStatus} /> },
    { label: "Uploaded At", value: formatDate(document.uploadedAt) },
    { label: "Uploaded By", value: document.uploadedBy || "Anonymous" },
    { label: "Stored As", value: document.storedFileName },
    {
      label: "Processing Completed",
      value: document.processingCompletedAt ? formatDate(document.processingCompletedAt) : "—",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Document Details
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          {rows.map((row) => (
            <div key={row.label} className="flex justify-between items-center py-1.5 border-b last:border-0">
              <span className="text-sm text-muted-foreground">{row.label}</span>
              <span className="text-sm font-medium text-right max-w-[60%] truncate">{row.value}</span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
