package com.dms.dto;

import com.dms.entity.Document;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class DocumentDTO {
    private Long id;
    private String originalFileName;
    private String storedFileName;
    private Long fileSize;
    private String fileType;
    private Document.UploadStatus uploadStatus;
    private LocalDateTime uploadedAt;
    private String storagePath;
    private String uploadedBy;
    private LocalDateTime processingCompletedAt;
    private String downloadUrl;

    public DocumentDTO() {}

    private DocumentDTO(Builder b) {
        this.id = b.id;
        this.originalFileName = b.originalFileName;
        this.storedFileName = b.storedFileName;
        this.fileSize = b.fileSize;
        this.fileType = b.fileType;
        this.uploadStatus = b.uploadStatus;
        this.uploadedAt = b.uploadedAt;
        this.storagePath = b.storagePath;
        this.uploadedBy = b.uploadedBy;
        this.processingCompletedAt = b.processingCompletedAt;
        this.downloadUrl = b.downloadUrl;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String originalFileName;
        private String storedFileName;
        private Long fileSize;
        private String fileType;
        private Document.UploadStatus uploadStatus;
        private LocalDateTime uploadedAt;
        private String storagePath;
        private String uploadedBy;
        private LocalDateTime processingCompletedAt;
        private String downloadUrl;

        public Builder id(Long v) { this.id = v; return this; }
        public Builder originalFileName(String v) { this.originalFileName = v; return this; }
        public Builder storedFileName(String v) { this.storedFileName = v; return this; }
        public Builder fileSize(Long v) { this.fileSize = v; return this; }
        public Builder fileType(String v) { this.fileType = v; return this; }
        public Builder uploadStatus(Document.UploadStatus v) { this.uploadStatus = v; return this; }
        public Builder uploadedAt(LocalDateTime v) { this.uploadedAt = v; return this; }
        public Builder storagePath(String v) { this.storagePath = v; return this; }
        public Builder uploadedBy(String v) { this.uploadedBy = v; return this; }
        public Builder processingCompletedAt(LocalDateTime v) { this.processingCompletedAt = v; return this; }
        public Builder downloadUrl(String v) { this.downloadUrl = v; return this; }
        public DocumentDTO build() { return new DocumentDTO(this); }
    }

    public Long getId() { return id; }
    public String getOriginalFileName() { return originalFileName; }
    public String getStoredFileName() { return storedFileName; }
    public Long getFileSize() { return fileSize; }
    public String getFileType() { return fileType; }
    public Document.UploadStatus getUploadStatus() { return uploadStatus; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public String getStoragePath() { return storagePath; }
    public String getUploadedBy() { return uploadedBy; }
    public LocalDateTime getProcessingCompletedAt() { return processingCompletedAt; }
    public String getDownloadUrl() { return downloadUrl; }
}
