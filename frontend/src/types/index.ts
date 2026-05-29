export type UploadStatus = "PENDING" | "UPLOADING" | "PROCESSING" | "COMPLETED" | "FAILED";
export type NotificationType = "SUCCESS" | "ERROR" | "INFO";

export interface Document {
  id: number;
  originalFileName: string;
  storedFileName: string;
  fileSize: number;
  fileType: string;
  uploadStatus: UploadStatus;
  uploadedAt: string;
  storagePath: string;
  uploadedBy?: string;
  processingCompletedAt?: string;
  downloadUrl: string;
}

export interface Notification {
  id: number;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

export interface UploadFileState {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "failed";
  error?: string;
  documentId?: number;
}
