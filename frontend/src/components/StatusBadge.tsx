import { Badge } from "@/components/ui/badge";
import { UploadStatus } from "@/types";

const statusConfig: Record<UploadStatus, { label: string; variant: "success" | "warning" | "info" | "destructive" | "secondary" }> = {
  PENDING: { label: "Pending", variant: "secondary" },
  UPLOADING: { label: "Uploading", variant: "info" },
  PROCESSING: { label: "Processing", variant: "warning" },
  COMPLETED: { label: "Completed", variant: "success" },
  FAILED: { label: "Failed", variant: "destructive" },
};

export function StatusBadge({ status }: { status: UploadStatus }) {
  const config = statusConfig[status];
  return <Badge variant={config.variant as any}>{config.label}</Badge>;
}
