import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUploadStore } from "@/store/uploadStore";
import { documentService } from "@/services/documentService";
import { toast } from "@/hooks/useToast";

export function useUpload() {
  const { files, addFiles, updateProgress, updateStatus, removeFile, clearCompleted, reset } =
    useUploadStore();
  const queryClient = useQueryClient();

  const upload = useCallback(
    async (newFiles: File[]) => {
      if (newFiles.length === 0) return;

      addFiles(newFiles);
      const storeFiles = useUploadStore.getState().files;
      const addedIds = storeFiles.slice(-newFiles.length).map((f) => f.id);

      if (newFiles.length > 3) {
        toast({
          title: "Upload in progress",
          description: `Processing ${newFiles.length} files in background`,
        });
      }

      addedIds.forEach((id) => updateStatus(id, "uploading"));

      try {
        await documentService.upload(newFiles, "anonymous", (fileIndex, progress) => {
          updateProgress(addedIds[fileIndex], progress);
        });

        addedIds.forEach((id) => updateStatus(id, "completed"));
        queryClient.invalidateQueries({ queryKey: ["documents"] });

        if (newFiles.length <= 3) {
          toast({ title: `${newFiles.length} file(s) uploaded successfully` });
        }
      } catch (err) {
        addedIds.forEach((id) => updateStatus(id, "failed", (err as Error).message));
        toast({
          title: "Upload failed",
          description: (err as Error).message,
          variant: "destructive",
        });
      }
    },
    [addFiles, updateProgress, updateStatus, queryClient]
  );

  return { files, upload, removeFile, clearCompleted, reset };
}
