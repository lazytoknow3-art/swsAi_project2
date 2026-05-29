import api from "./api";
import { ApiResponse, Document, PagedResponse } from "@/types";

export interface DocumentsParams {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortDir?: string;
}

export const documentService = {
  upload(
    files: File[],
    uploadedBy: string,
    onProgress: (fileIndex: number, progress: number) => void
  ) {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    formData.append("uploadedBy", uploadedBy);

    return api.post<ApiResponse<Document[]>>("/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        const pct = e.total ? Math.round((e.loaded * 100) / e.total) : 0;
        files.forEach((_, i) => onProgress(i, pct));
      },
    });
  },

  getAll(params: DocumentsParams = {}) {
    return api.get<ApiResponse<PagedResponse<Document>>>("/documents", { params });
  },

  getById(id: number) {
    return api.get<ApiResponse<Document>>(`/documents/${id}`);
  },

  download(id: number, fileName: string) {
    return api
      .get(`/documents/download/${id}`, { responseType: "blob" })
      .then((res) => {
        const url = URL.createObjectURL(res.data);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      });
  },

  delete(id: number) {
    return api.delete<ApiResponse<void>>(`/documents/${id}`);
  },
};
