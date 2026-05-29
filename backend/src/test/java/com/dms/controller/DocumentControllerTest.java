package com.dms.controller;

import com.dms.dto.ApiResponse;
import com.dms.dto.DocumentDTO;
import com.dms.dto.PagedResponse;
import com.dms.entity.Document;
import com.dms.service.DocumentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DocumentController.class)
@Import(com.dms.config.SecurityConfig.class)
class DocumentControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @MockBean private DocumentService documentService;

    @Test
    void upload_validPdf_returns200() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "files", "test.pdf", "application/pdf", "PDF content".getBytes());

        DocumentDTO dto = DocumentDTO.builder()
                .id(1L).originalFileName("test.pdf").fileSize(11L)
                .uploadStatus(Document.UploadStatus.PENDING)
                .uploadedAt(LocalDateTime.now())
                .build();

        when(documentService.uploadMultiple(anyList(), anyString())).thenReturn(List.of(dto));

        mockMvc.perform(multipart("/api/documents/upload").file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].id").value(1));
    }

    @Test
    void getAll_returnsPagedResponse() throws Exception {
        PagedResponse<DocumentDTO> paged = PagedResponse.<DocumentDTO>builder()
                .content(List.of()).page(0).size(10).totalElements(0).totalPages(0).last(true).build();

        when(documentService.getAll(anyInt(), anyInt(), any(), any(), anyString(), anyString()))
                .thenReturn(paged);

        mockMvc.perform(get("/api/documents"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void getById_notFound_returns404() throws Exception {
        when(documentService.getById(999L))
                .thenThrow(new com.dms.exception.DocumentNotFoundException(999L));

        mockMvc.perform(get("/api/documents/999"))
                .andExpect(status().isNotFound());
    }
}
