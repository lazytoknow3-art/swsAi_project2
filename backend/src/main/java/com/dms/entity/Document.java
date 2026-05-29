package com.dms.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "documents", indexes = {
    @Index(name = "idx_upload_status", columnList = "uploadStatus"),
    @Index(name = "idx_uploaded_at", columnList = "uploadedAt"),
    @Index(name = "idx_original_file_name", columnList = "originalFileName")
})
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String originalFileName;

    @Column(nullable = false, unique = true)
    private String storedFileName;

    @Column(nullable = false)
    private Long fileSize;

    @Column(nullable = false)
    private String fileType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UploadStatus uploadStatus;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

    @Column(nullable = false)
    private String storagePath;

    @Column
    private String uploadedBy;

    @Column
    private LocalDateTime processingCompletedAt;

    public enum UploadStatus {
        PENDING, UPLOADING, PROCESSING, COMPLETED, FAILED
    }

    public Document() {}

    private Document(Builder b) {
        this.id = b.id;
        this.originalFileName = b.originalFileName;
        this.storedFileName = b.storedFileName;
        this.fileSize = b.fileSize;
        this.fileType = b.fileType;
        this.uploadStatus = b.uploadStatus;
        this.storagePath = b.storagePath;
        this.uploadedBy = b.uploadedBy;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String originalFileName;
        private String storedFileName;
        private Long fileSize;
        private String fileType;
        private UploadStatus uploadStatus;
        private String storagePath;
        private String uploadedBy;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder originalFileName(String v) { this.originalFileName = v; return this; }
        public Builder storedFileName(String v) { this.storedFileName = v; return this; }
        public Builder fileSize(Long v) { this.fileSize = v; return this; }
        public Builder fileType(String v) { this.fileType = v; return this; }
        public Builder uploadStatus(UploadStatus v) { this.uploadStatus = v; return this; }
        public Builder storagePath(String v) { this.storagePath = v; return this; }
        public Builder uploadedBy(String v) { this.uploadedBy = v; return this; }
        public Document build() { return new Document(this); }
    }

    public Long getId() { return id; }
    public String getOriginalFileName() { return originalFileName; }
    public String getStoredFileName() { return storedFileName; }
    public Long getFileSize() { return fileSize; }
    public String getFileType() { return fileType; }
    public UploadStatus getUploadStatus() { return uploadStatus; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public String getStoragePath() { return storagePath; }
    public String getUploadedBy() { return uploadedBy; }
    public LocalDateTime getProcessingCompletedAt() { return processingCompletedAt; }

    public void setUploadStatus(UploadStatus uploadStatus) { this.uploadStatus = uploadStatus; }
    public void setProcessingCompletedAt(LocalDateTime processingCompletedAt) { this.processingCompletedAt = processingCompletedAt; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }
}
