package com.dms.service;

import com.dms.entity.Document;
import com.dms.exception.InvalidFileException;
import com.dms.mapper.DocumentMapper;
import com.dms.repository.DocumentRepository;
import com.dms.sse.SseService;
import com.dms.storage.StorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DocumentServiceTest {

    @Mock private DocumentRepository documentRepository;
    @Mock private DocumentMapper documentMapper;
    @Mock private StorageService storageService;
    @Mock private NotificationService notificationService;
    @Mock private SseService sseService;

    @InjectMocks
    private DocumentService documentService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(documentService, "maxFileSizeBytes", 52428800L);
    }

    @Test
    void upload_validPdf_succeeds() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.pdf", "application/pdf", new byte[1024]);

        StorageService.StorageResult storageResult =
                new StorageService.StorageResult("stored.pdf", "/uploads/2024/01/01/stored.pdf", "2024/01/01");

        Document savedDoc = Document.builder()
                .id(1L).originalFileName("test.pdf").storedFileName("stored.pdf")
                .fileSize(1024L).fileType("application/pdf")
                .uploadStatus(Document.UploadStatus.PENDING)
                .storagePath("/uploads/2024/01/01/stored.pdf")
                .build();

        when(storageService.store(file)).thenReturn(storageResult);
        when(documentRepository.save(any())).thenReturn(savedDoc);
        when(documentMapper.toDTO(any())).thenReturn(null);

        assertDoesNotThrow(() -> documentService.uploadMultiple(List.of(file), "user1"));
        verify(documentRepository, atLeastOnce()).save(any());
    }

    @Test
    void upload_nonPdf_throwsInvalidFileException() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.txt", "text/plain", new byte[1024]);

        assertThrows(InvalidFileException.class,
                () -> documentService.uploadMultiple(List.of(file), "user1"));
        verifyNoInteractions(storageService);
    }

    @Test
    void upload_emptyFile_throwsInvalidFileException() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "empty.pdf", "application/pdf", new byte[0]);

        assertThrows(InvalidFileException.class,
                () -> documentService.uploadMultiple(List.of(file), "user1"));
    }

    @Test
    void upload_oversizedFile_throwsInvalidFileException() {
        byte[] largeContent = new byte[60 * 1024 * 1024];
        MockMultipartFile file = new MockMultipartFile(
                "file", "large.pdf", "application/pdf", largeContent);

        assertThrows(InvalidFileException.class,
                () -> documentService.uploadMultiple(List.of(file), "user1"));
    }
}
