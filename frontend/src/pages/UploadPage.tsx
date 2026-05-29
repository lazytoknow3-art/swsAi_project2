import { DropZone } from "@/components/DropZone";
import { FileUploadItem } from "@/components/FileUploadItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUpload } from "@/hooks/useUpload";
import { Trash2, Upload, CheckCircle, XCircle, Loader2 } from "lucide-react";

export function UploadPage() {
  const { files, upload, removeFile, clearCompleted, reset } = useUpload();

  const pendingCount  = files.filter((f) => f.status === "pending" || f.status === "uploading").length;
  const completedCount = files.filter((f) => f.status === "completed").length;
  const failedCount   = files.filter((f) => f.status === "failed").length;
  const totalCount    = files.length;

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Upload Center</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Upload single or multiple PDF documents</p>
      </div>

      {/* Drop zone card */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardContent className="p-6">
          <DropZone onFiles={upload} disabled={pendingCount > 0} />

          <div className="mt-4 flex items-center gap-6 text-xs text-muted-foreground justify-center">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              PDF files only
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              Max 50MB per file
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
              Multiple files supported
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Upload queue */}
      {files.length > 0 && (
        <Card className="border-0 shadow-sm animate-fade-in">
          <CardHeader className="pb-3 border-b bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle className="text-base">Upload Queue</CardTitle>
                {/* Progress summary pills */}
                <div className="flex items-center gap-1.5">
                  {pendingCount > 0 && (
                    <span className="flex items-center gap-1 text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      {pendingCount} uploading
                    </span>
                  )}
                  {completedCount > 0 && (
                    <span className="flex items-center gap-1 text-xs bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
                      <CheckCircle className="h-3 w-3" />
                      {completedCount} done
                    </span>
                  )}
                  {failedCount > 0 && (
                    <span className="flex items-center gap-1 text-xs bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">
                      <XCircle className="h-3 w-3" />
                      {failedCount} failed
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {completedCount > 0 && (
                  <Button variant="outline" size="sm" onClick={clearCompleted} className="h-7 text-xs">
                    Clear done
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={reset} className="h-7 text-xs text-muted-foreground">
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Clear all
                </Button>
              </div>
            </div>

            {/* Overall progress bar */}
            {totalCount > 0 && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{totalCount} file{totalCount !== 1 ? "s" : ""}</span>
                  <span>{completedCount}/{totalCount} completed</span>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="p-4 space-y-2">
            {/* Bulk upload banner */}
            {files.length > 3 && pendingCount > 0 && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 text-sm text-blue-700 dark:text-blue-300 animate-fade-in">
                <div className="h-7 w-7 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                  <Upload className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="font-medium">Bulk upload in progress</p>
                  <p className="text-xs opacity-80">Processing {files.length} files in background — you'll be notified when complete</p>
                </div>
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
