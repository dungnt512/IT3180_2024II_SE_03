package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.entity.Notification;
import com.example.demo.entity.Resident;
import com.example.demo.entity.User;
import com.example.demo.repository.NotificationRepository;
import com.example.demo.repository.ResidentRepository;
import com.example.demo.repository.UserRepository;

@Service
public class NotificationService {
    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ResidentRepository residentRepository;
    
    @Autowired
    private UserRepository userRepository;

    public void createNotification(Long residentId, String message, String linkHeader, String linkAPI) {
        Resident resident = residentRepository.findById(residentId)
                .orElseThrow(() -> new RuntimeException("Resident not found with id: " + residentId));

        Notification notification = new Notification();
        notification.setResident(resident);
        notification.setMessage(message);
        notification.setRead(false);
        notification.setLinkHeader(linkHeader);
        notification.setLinkAPI(linkAPI);
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
    
    public boolean sendNotificationToUser(Long userId, String message) {
        try {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
            
            Long residentId = user.getResidentId();
            if (residentId == null) {
                return false;
            }
            
            createNotification(residentId, message, null, null);
            return true;
        } catch (Exception e) {
            System.err.println("Lỗi khi gửi thông báo: " + e.getMessage());
            return false;
        }
    }

    public List<Notification> findByResidentAndReadFalse(Resident resident) {
        return notificationRepository.findByResidentAndReadFalse(resident);
    }

    public void saveAll(List<Notification> unreadNotifications) {
        notificationRepository.saveAll(unreadNotifications);
    }
    public void deleteNotificationById(Long notificationId) {
        if (!notificationRepository.existsById(notificationId)) {
            throw new RuntimeException("Notification not found with id: " + notificationId);
        }
        notificationRepository.deleteById(notificationId);
    }
    public void markAsReadById(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + notificationId));

        if (!notification.isRead()) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }
    }
    
}