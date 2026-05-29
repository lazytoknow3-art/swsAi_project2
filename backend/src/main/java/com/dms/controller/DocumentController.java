package com.dms.controller;

import com.dms.dto.ApiResponse;
import com.dms.dto.DocumentDTO;
import com.dms.dto.PagedResponse;
import com.dms.service.DocumentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.PathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private static final Logger log = LoggerFactory.getLogger(DocumentController.class);
    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<List<DocumentDTO>>> upload(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(value = "uploadedBy", defaultValue = "anonymous") String uploadedBy) throws IOException {

        log.info("Upload request: {} file(s) by {}", files.size(), uploadedBy);
        List<DocumentDTO> results = documentService.uploadMultiple(files, uploadedBy);
        return ResponseEntity.ok(ApiResponse.success("Upload initiated for " + files.size() + " file(s)", results));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<DocumentDTO>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "uploadedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        PagedResponse<DocumentDTO> response = documentService.getAll(page, size, search, status, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DocumentDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(documentService.getById(id)));
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> download(@PathVariable Long id) throws IOException {
        Path filePath = documentService.getFilePath(id);
        String originalName = documentService.getOriginalFileName(id);
        Resource resource = new PathResource(filePath);

        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        String encodedName = URLEncoder.encode(originalName, StandardCharsets.UTF_8).replace("+", "%20");
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encodedName)
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) throws IOException {
        documentService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Document deleted successfully", null));
    }
}
