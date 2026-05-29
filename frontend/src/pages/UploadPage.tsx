import { DropZone } from "@/components/DropZone";
import { FileUploadItem } from "@/components/FileUploadItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUpload } from "@/hooks/useUpload";
import { Trash2, Upload } from "lucide-react";

export function UploadPage() {
  const { files, upload, removeFile, clearCompleted, reset } = useUpload();

  const pendingCount = files.filter((f) => f.status === "pending" || f.status === "uploading").length;
  const completedCount = files.filter((f) => f.status === "completed").length;
  const failedCount = files.filter((f) => f.status === "failed").length;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Upload Center</h1>
        <p className="text-muted-foreground text-sm mt-1">Upload single or multiple PDF documents</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <DropZone onFiles={upload} disabled={pendingCount > 0} />
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Upload Queue
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {files.length} file{files.length !== 1 ? "s" : ""}
                  {completedCount > 0 && ` · ${completedCount} completed`}
                  {failedCount > 0 && ` · ${failedCount} failed`}
                </span>
              </CardTitle>
              <div className="flex gap-2">
                {completedCount > 0 && (
                  <Button variant="outline" size="sm" onClick={clearCompleted}>
                    Clear completed
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={reset}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear all
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {files.length > 3 && pendingCount > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-300">
                <Upload className="h-4 w-4 shrink-0" />
                Upload in progress — processing {files.length} files in background
              </div>
            )}
            {files.map((f) => (
              <FileUploadItem
                key={f.id}
                file={f}
                onRemove={removeFile}
                onRetry={(file) => upload([file])}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
