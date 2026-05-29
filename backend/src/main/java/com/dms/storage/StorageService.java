package com.dms.storage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class StorageService {

    private static final Logger log = LoggerFactory.getLogger(StorageService.class);

    @Value("${app.upload.base-dir}")
    private String baseDir;

    public StorageResult store(MultipartFile file) throws IOException {
        String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        Path uploadDir = Paths.get(baseDir, datePath);
        Files.createDirectories(uploadDir);

        String originalName = sanitizeFileName(file.getOriginalFilename());
        String extension = getExtension(originalName);
        String storedName = UUID.randomUUID() + (extension.isEmpty() ? "" : "." + extension);

        Path targetPath = uploadDir.resolve(storedName);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        log.info("Stored file: {} -> {}", originalName, targetPath);
        return new StorageResult(storedName, targetPath.toString(), datePath);
    }

    public Path resolve(String storagePath, String storedFileName) {
        return Paths.get(storagePath, storedFileName);
    }

    public void delete(String storagePath) throws IOException {
        Path path = Paths.get(storagePath);
        Files.deleteIfExists(path);
        log.info("Deleted file: {}", storagePath);
    }

    private String sanitizeFileName(String fileName) {
        if (fileName == null || fileName.isBlank()) return "unnamed";
        return Paths.get(fileName).getFileName().toString()
                .replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    private String getExtension(String fileName) {
        int dot = fileName.lastIndexOf('.');
        return (dot >= 0) ? fileName.substring(dot + 1).toLowerCase() : "";
    }

    public record StorageResult(String storedFileName, String fullPath, String relativeDatePath) {}
}
