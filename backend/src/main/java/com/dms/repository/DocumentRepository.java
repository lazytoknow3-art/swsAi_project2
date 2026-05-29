package com.dms.repository;

import com.dms.entity.Document;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    Page<Document> findByOriginalFileNameContainingIgnoreCase(String fileName, Pageable pageable);

    Page<Document> findByUploadStatus(Document.UploadStatus status, Pageable pageable);

    Page<Document> findByOriginalFileNameContainingIgnoreCaseAndUploadStatus(
            String fileName, Document.UploadStatus status, Pageable pageable);

    Optional<Document> findByStoredFileName(String storedFileName);

    boolean existsByStoredFileName(String storedFileName);
}
