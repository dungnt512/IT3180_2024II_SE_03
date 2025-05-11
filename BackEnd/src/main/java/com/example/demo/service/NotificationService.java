package com.example.demo.service;

import com.example.demo.entity.Notification;
import com.example.demo.entity.Resident;
import com.example.demo.entity.User;
import com.example.demo.repository.NotificationRepository;
import com.example.demo.repository.ResidentRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {
    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ResidentRepository residentRepository;

    public void createNotification(Long residentId, String message) {
        Resident resident = residentRepository.findById(residentId)
                .orElseThrow(() -> new RuntimeException("Resident not found with id: " + residentId));

        Notification notification = new Notification();
        notification.setResident(resident);
        notification.setMessage(message);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        notificationRepository.save(notification);
    }

    public List<Notification> getResidentNotifications(Resident resident) {
        return notificationRepository.findByResidentOrderByCreatedAtDesc(resident);
    }

    public int getUnreadCount(Resident resident) {
        return notificationRepository.countByResidentAndReadFalse(resident);
    }

    public void markAllAsRead(Resident resident) {
        notificationRepository.markAllAsRead(resident);
    }
    
    public void markAsReadById(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + notificationId));

        if (!notification.isRead()) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }
    }
    
    public void deleteNotificationById(Long notificationId) {
        if (!notificationRepository.existsById(notificationId)) {
            throw new RuntimeException("Notification not found with id: " + notificationId);
        }
        notificationRepository.deleteById(notificationId);
    }
}