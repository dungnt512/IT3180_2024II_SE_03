package com.example.demo.controller;

import com.example.demo.entity.Notification;
import com.example.demo.entity.Resident;
import com.example.demo.entity.User;
import com.example.demo.repository.NotificationRepository;
import com.example.demo.service.NotificationService;
import com.example.demo.service.ResidentService;
import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin
public class NotificationApiController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private ResidentService residentService;

    @Autowired
    private UserService userService;

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping("/check")
    public ResponseEntity<Map<String, Object>> checkNewNotifications(Principal principal) {
        String username = principal.getName();
        User user = userService.findByName(username);
        Resident resident = residentService.findById(user.getResidentId());

        List<Notification> notifications = notificationService.getResidentNotifications(resident);
        List<Map<String, Object>> unreadList = new ArrayList<>();
        List<Map<String, Object>> readList = new ArrayList<>();

        for (Notification n : notifications) {
            Map<String, Object> notiData = new HashMap<>();
            notiData.put("id", n.getId());
            notiData.put("message", n.getMessage());
            notiData.put("createdAt", n.getCreatedAt());
            notiData.put("read", n.isRead());

            if (n.isRead()) {
                readList.add(notiData);
            } else {
                unreadList.add(notiData);
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("unreadCount", unreadList.size());
        response.put("unreadNotifications", unreadList);
        response.put("readNotifications", readList);

        return ResponseEntity.ok(response);
    }
    @PostMapping("/mark-as-read")
    public ResponseEntity<?> markAsRead(Principal principal) {
        try {
            String username = principal.getName();
            User user = userService.findByName(username);
            Resident resident = residentService.findById(user.getResidentId());

            List<Notification> unreadNotifications = notificationRepository.findByResidentAndReadFalse(resident);
            unreadNotifications.forEach(n -> n.setRead(true));
            notificationRepository.saveAll(unreadNotifications);

            return ResponseEntity.ok(Map.of("message", "Marked all as read"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Internal Server Error"));
        }
    }
    
    @PutMapping("/mark-as-read/{id}")
    public ResponseEntity<?> markOneAsRead(@PathVariable Long id, Principal principal) {
        try {
            // (Tuỳ chọn) kiểm tra xem thông báo có thuộc về user hiện tại không
            String username = principal.getName();
            User user = userService.findByName(username);
            Resident resident = residentService.findById(user.getResidentId());

            Notification notification = notificationRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Notification not found"));

            if (!notification.getResident().getId().equals(resident.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "You do not have permission to update this notification"));
            }

            notificationService.markAsReadById(id);
            return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Internal Server Error"));
        }
    }
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id, Principal principal) {
        try {
            String username = principal.getName();
            User user = userService.findByName(username);
            Resident resident = residentService.findById(user.getResidentId());

            Notification notification = notificationRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Notification not found"));

            // Đảm bảo người dùng chỉ được xóa notification của mình
            if (!notification.getResident().getId().equals(resident.getId())) {
                return ResponseEntity.status(403).body("You are not authorized to delete this notification");
            }

            notificationService.deleteNotificationById(id);
            return ResponseEntity.ok().body("Notification deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error deleting notification: " + e.getMessage());
        }
    }
}
