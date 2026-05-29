package com.dms.dto;

import com.dms.entity.Notification;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class NotificationDTO {
    private Long id;
    private String message;
    private Notification.NotificationType type;
    private boolean isRead;
    private LocalDateTime createdAt;

    public NotificationDTO() {}

    private NotificationDTO(Builder b) {
        this.id = b.id;
        this.message = b.message;
        this.type = b.type;
        this.isRead = b.isRead;
        this.createdAt = b.createdAt;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String message;
        private Notification.NotificationType type;
        private boolean isRead;
        private LocalDateTime createdAt;

        public Builder id(Long v) { this.id = v; return this; }
        public Builder message(String v) { this.message = v; return this; }
        public Builder type(Notification.NotificationType v) { this.type = v; return this; }
        public Builder isRead(boolean v) { this.isRead = v; return this; }
        public Builder createdAt(LocalDateTime v) { this.createdAt = v; return this; }
        public NotificationDTO build() { return new NotificationDTO(this); }
    }

    public Long getId() { return id; }
    public String getMessage() { return message; }
    public Notification.NotificationType getType() { return type; }
    public boolean isRead() { return isRead; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
