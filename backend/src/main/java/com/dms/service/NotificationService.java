package com.dms.service;

import com.dms.dto.NotificationDTO;
import com.dms.dto.PagedResponse;
import com.dms.entity.Notification;
import com.dms.mapper.NotificationMapper;
import com.dms.repository.NotificationRepository;
import com.dms.sse.SseService;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;
    private final SseService sseService;

    public NotificationService(NotificationRepository notificationRepository,
                                NotificationMapper notificationMapper,
                                SseService sseService) {
        this.notificationRepository = notificationRepository;
        this.notificationMapper = notificationMapper;
        this.sseService = sseService;
    }

    public NotificationDTO createAndBroadcast(String message, Notification.NotificationType type) {
        Notification notification = Notification.builder()
                .message(message)
                .type(type)
                .isRead(false)
                .build();
        Notification saved = notificationRepository.save(notification);
        NotificationDTO dto = notificationMapper.toDTO(saved);
        sseService.broadcastNotification(dto);
        log.info("Created and broadcasted notification: {}", message);
        return dto;
    }

    public PagedResponse<NotificationDTO> getAll(int page, int size, String type) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Notification> result;
        if (type != null && !type.isBlank()) {
            result = notificationRepository.findByType(
                    Notification.NotificationType.valueOf(type.toUpperCase()), pageable);
        } else {
            result = notificationRepository.findAll(pageable);
        }
        return PagedResponse.from(result.map(notificationMapper::toDTO));
    }

    public long getUnreadCount() {
        return notificationRepository.countByIsReadFalse();
    }

    @Transactional
    public NotificationDTO markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + id));
        notification.setRead(true);
        return notificationMapper.toDTO(notificationRepository.save(notification));
    }

    @Transactional
    public int markAllAsRead() {
        return notificationRepository.markAllAsRead();
    }
}
