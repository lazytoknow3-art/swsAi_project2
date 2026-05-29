package com.dms.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private LocalDateTime timestamp;

    public ApiResponse() {}

    private ApiResponse(Builder<T> b) {
        this.success = b.success;
        this.message = b.message;
        this.data = b.data;
        this.timestamp = b.timestamp;
    }

    public static <T> ApiResponse<T> success(T data) {
        return new Builder<T>().success(true).data(data).timestamp(LocalDateTime.now()).build();
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new Builder<T>().success(true).message(message).data(data).timestamp(LocalDateTime.now()).build();
    }

    public static <T> ApiResponse<T> error(String message) {
        return new Builder<T>().success(false).message(message).timestamp(LocalDateTime.now()).build();
    }

    public static <T> Builder<T> builder() { return new Builder<>(); }

    public static class Builder<T> {
        private boolean success;
        private String message;
        private T data;
        private LocalDateTime timestamp;

        public Builder<T> success(boolean v) { this.success = v; return this; }
        public Builder<T> message(String v) { this.message = v; return this; }
        public Builder<T> data(T v) { this.data = v; return this; }
        public Builder<T> timestamp(LocalDateTime v) { this.timestamp = v; return this; }
        public ApiResponse<T> build() { return new ApiResponse<>(this); }
    }

    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
    public T getData() { return data; }
    public LocalDateTime getTimestamp() { return timestamp; }
}
