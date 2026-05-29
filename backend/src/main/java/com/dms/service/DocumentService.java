package com.dms.service;

import com.dms.dto.DocumentDTO;
import com.dms.dto.PagedResponse;
import com.dms.entity.Document;
import com.dms.entity.Notification;
import com.dms.exception.DocumentNotFoundException;
import com.dms.exception.InvalidFileException;
import com.dms.mapper.DocumentMapper;
import com.dms.repository.DocumentRepository;
import com.dms.sse.SseService;
import com.dms.storage.StorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class DocumentService {

    private static final Logger log = LoggerFactory.getLogger(DocumentService.class);

    private final DocumentRepository documentRepository;
    private final DocumentMapper documentMapper;
    private final StorageService storageService;
    private final NotificationService notificationService;
    private final SseService sseService;

    @Value("${app.upload.max-file-size-bytes}")
    private long maxFileSizeBytes;

    public DocumentService(DocumentRepository documentRepository,
                           DocumentMapper documentMapper,
                           StorageService storageService,
                           NotificationService notificationService,
                           SseService sseService) {
        this.documentRepository = documentRepository;
        this.documentMapper = documentMapper;
        this.storageService = storageService;
        this.notificationService = notificationService;
        this.sseService = sseService;
    }

    public List<DocumentDTO> uploadMultiple(List<MultipartFile> files, String uploadedBy) throws IOException {
        List<DocumentDTO> results = new ArrayList<>();
        for (MultipartFile file : files) {
            validateFile(file);
            Document document = saveDocument(file, uploadedBy);
            results.add(documentMapper.toDTO(document));
        }

        if (files.size() > 3) {
            processMultipleAsync(results.stream().map(DocumentDTO::getId).toList(), files.size());
        } else {
            for (DocumentDTO dto : results) {
                processDocumentAsync(dto.getId());
            }
        }

        return results;
    }

    private Document saveDocument(MultipartFile file, String uploadedBy) throws IOException {
        StorageService.StorageResult stored = storageService.store(file);
        Document document = Document.builder()
                .originalFileName(file.getOriginalFilename())
                .storedFileName(stored.storedFileName())
                .fileSize(file.getSize())
                .fileType(file.getContentType())
                .uploadStatus(Document.UploadStatus.PENDING)
                .storagePath(stored.fullPath())
                .uploadedBy(uploadedBy)
                .build();
        Document saved = documentRepository.save(document);
        sseService.broadcastDocumentUpdate(documentMapper.toDTO(saved));
        return saved;
    }

    @Async
    public void processDocumentAsync(Long documentId) {
        try {
            Document document = documentRepository.findById(documentId).orElseThrow();
            String fileName = document.getOriginalFileName();

            document.setUploadStatus(Document.UploadStatus.PROCESSING);
            documentRepository.save(document);
            sseService.broadcastDocumentUpdate(documentMapper.toDTO(document));

            document.setUploadStatus(Document.UploadStatus.COMPLETED);
            document.setProcessingCompletedAt(LocalDateTime.now());
            documentRepository.save(document);
            sseService.broadcastDocumentUpdate(documentMapper.toDTO(document));

            // Create notification for every completed upload
            notificationService.createAndBroadcast(
                "\"" + fileName + "\" uploaded successfully",
                Notification.NotificationType.SUCCESS
            );

            log.info("Document {} processed successfully", documentId);
        } catch (Exception e) {
            log.error("Failed to process document {}: {}", documentId, e.getMessage());
            documentRepository.findById(documentId).ifPresent(doc -> {
                String fileName = doc.getOriginalFileName();
                doc.setUploadStatus(Document.UploadStatus.FAILED);
                documentRepository.save(doc);
                sseService.broadcastDocumentUpdate(documentMapper.toDTO(doc));
                notificationService.createAndBroadcast(
                    "Failed to process \"" + fileName + "\"",
                    Notification.NotificationType.ERROR
                );
            });
        }
    }

    @Async
    public void processMultipleAsync(List<Long> documentIds, int totalCount) {
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failCount = new AtomicInteger(0);

        List<CompletableFuture<Void>> futures = documentIds.stream()
                .map(id -> CompletableFuture.runAsync(() -> {
                    try {
                        Document document = documentRepository.findById(id).orElseThrow();
                        document.setUploadStatus(Document.UploadStatus.PROCESSING);
                        documentRepository.save(document);
                        sseService.broadcastDocumentUpdate(documentMapper.toDTO(document));

                        document.setUploadStatus(Document.UploadStatus.COMPLETED);
                        document.setProcessingCompletedAt(LocalDateTime.now());
                        documentRepository.save(document);
                        sseService.broadcastDocumentUpdate(documentMapper.toDTO(document));
                        successCount.incrementAndGet();
                    } catch (Exception e) {
                        log.error("Failed processing document {}: {}", id, e.getMessage());
                        documentRepository.findById(id).ifPresent(doc -> {
                            doc.setUploadStatus(Document.UploadStatus.FAILED);
                            documentRepository.save(doc);
                            sseService.broadcastDocumentUpdate(documentMapper.toDTO(doc));
                        });
                        failCount.incrementAndGet();
                    }
                }))
                .toList();

        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

        String message = failCount.get() == 0
                ? successCount.get() + " files uploaded successfully"
                : successCount.get() + " files uploaded, " + failCount.get() + " failed";

        Notification.NotificationType type = failCount.get() == 0
                ? Notification.NotificationType.SUCCESS
                : Notification.NotificationType.ERROR;

        notificationService.createAndBroadcast(message, type);
    }

    public PagedResponse<DocumentDTO> getAll(int page, int size, String search, String status, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Document> result;
        boolean hasSearch = search != null && !search.isBlank();
        boolean hasStatus = status != null && !status.isBlank();

        if (hasSearch && hasStatus) {
            result = documentRepository.findByOriginalFileNameContainingIgnoreCaseAndUploadStatus(
                    search, Document.UploadStatus.valueOf(status.toUpperCase()), pageable);
        } else if (hasSearch) {
            result = documentRepository.findByOriginalFileNameContainingIgnoreCase(search, pageable);
        } else if (hasStatus) {
            result = documentRepository.findByUploadStatus(
                    Document.UploadStatus.valueOf(status.toUpperCase()), pageable);
        } else {
            result = documentRepository.findAll(pageable);
        }

        return PagedResponse.from(result.map(documentMapper::toDTO));
    }

    public DocumentDTO getById(Long id) {
        return documentRepository.findById(id)
                .map(documentMapper::toDTO)
                .orElseThrow(() -> new DocumentNotFoundException(id));
    }

    public Path getFilePath(Long id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new DocumentNotFoundException(id));
        return Path.of(document.getStoragePath());
    }

    public String getOriginalFileName(Long id) {
        return documentRepository.findById(id)
                .map(Document::getOriginalFileName)
                .orElseThrow(() -> new DocumentNotFoundException(id));
    }

    public void delete(Long id) throws IOException {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new DocumentNotFoundException(id));
        storageService.delete(document.getStoragePath());
        documentRepository.delete(document);
        log.info("Deleted document {}", id);
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) throw new InvalidFileException("File is empty");
        if (file.getSize() > maxFileSizeBytes)
            throw new InvalidFileException("File exceeds maximum size of " + (maxFileSizeBytes / 1024 / 1024) + "MB");
        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals("application/pdf"))
            throw new InvalidFileException("Only PDF files are allowed");
    }
}
