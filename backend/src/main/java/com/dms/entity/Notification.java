package com.dms.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_is_read", columnList = "isRead"),
    @Index(name = "idx_created_at", columnList = "createdAt")
})
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false)
    private boolean isRead;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum NotificationType {
        SUCCESS, ERROR, INFO
    }

    public Notification() {}

    private Notification(Builder b) {
        this.message = b.message;
        this.type = b.type;
        this.isRead = b.isRead;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String message;
        private NotificationType type;
        private boolean isRead;

        public Builder message(String v) { this.message = v; return this; }
        public Builder type(NotificationType v) { this.type = v; return this; }
        public Builder isRead(boolean v) { this.isRead = v; return this; }
        public Notification build() { return new Notification(this); }
    }

    public Long getId() { return id; }
    public String getMessage() { return message; }
    public NotificationType getType() { return type; }
    public boolean isRead() { return isRead; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setRead(boolean read) { this.isRead = read; }
    public void setMessage(String message) { this.message = message; }
    public void setType(NotificationType type) { this.type = type; }
}
