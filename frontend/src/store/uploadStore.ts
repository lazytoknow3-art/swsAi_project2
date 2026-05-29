import { create } from "zustand";
import { UploadFileState } from "@/types";
import { v4 as uuidv4 } from "uuid";

interface UploadStore {
  files: UploadFileState[];
  addFiles: (files: File[]) => void;
  updateProgress: (id: string, progress: number) => void;
  updateStatus: (id: string, status: UploadFileState["status"], error?: string) => void;
  removeFile: (id: string) => void;
  clearCompleted: () => void;
  reset: () => void;
}

export const useUploadStore = create<UploadStore>((set) => ({
  files: [],

  addFiles: (files) =>
    set((s) => ({
      files: [
        ...s.files,
        ...files.map((f) => ({
          id: uuidv4(),
          file: f,
          progress: 0,
          status: "pending" as const,
        })),
      ],
    })),

  updateProgress: (id, progress) =>
    set((s) => ({
      files: s.files.map((f) => (f.id === id ? { ...f, progress } : f)),
    })),

  updateStatus: (id, status, error) =>
    set((s) => ({
      files: s.files.map((f) => (f.id === id ? { ...f, status, error } : f)),
    })),

  removeFile: (id) =>
    set((s) => ({ files: s.files.filter((f) => f.id !== id) })),

  clearCompleted: () =>
    set((s) => ({ files: s.files.filter((f) => f.status !== "completed") })),

  reset: () => set({ files: [] }),
}));
