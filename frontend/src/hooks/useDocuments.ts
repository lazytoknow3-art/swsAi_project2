import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { documentService, DocumentsParams } from "@/services/documentService";
import { toast } from "@/hooks/useToast";

export function useDocuments(params: DocumentsParams) {
  return useQuery({
    queryKey: ["documents", params],
    queryFn: () => documentService.getAll(params).then((r) => r.data.data),
    staleTime: 30000,
  });
}

export function useDocument(id: number) {
  return useQuery({
    queryKey: ["document", id],
    queryFn: () => documentService.getById(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => documentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast({ title: "Document deleted", variant: "default" });
    },
    onError: (err: Error) => {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    },
  });
}

export function useDownloadDocument() {
  return useMutation({
    mutationFn: ({ id, fileName }: { id: number; fileName: string }) =>
      documentService.download(id, fileName),
    onError: (err: Error) => {
      toast({ title: "Download failed", description: err.message, variant: "destructive" });
    },
  });
}
