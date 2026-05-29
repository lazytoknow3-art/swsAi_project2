package com.dms.mapper;

import com.dms.dto.DocumentDTO;
import com.dms.entity.Document;
import org.springframework.stereotype.Component;

@Component
public class DocumentMapper {

    public DocumentDTO toDTO(Document document) {
        return DocumentDTO.builder()
                .id(document.getId())
                .originalFileName(document.getOriginalFileName())
                .storedFileName(document.getStoredFileName())
                .fileSize(document.getFileSize())
                .fileType(document.getFileType())
                .uploadStatus(document.getUploadStatus())
                .uploadedAt(document.getUploadedAt())
                .storagePath(document.getStoragePath())
                .uploadedBy(document.getUploadedBy())
                .processingCompletedAt(document.getProcessingCompletedAt())
                .downloadUrl("/api/documents/download/" + document.getId())
                .build();
    }
}
