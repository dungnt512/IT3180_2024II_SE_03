package com.example.demo.controller;

import com.example.demo.dto.NotificationRequestDTO;
import com.example.demo.entity.ManualNotification;
import com.example.demo.entity.Resident;
import com.example.demo.entity.User;
import com.example.demo.service.ManualNotificationService;
import com.example.demo.service.NotificationService;
import com.example.demo.service.ResidentService;
import com.example.demo.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
public class AdminNotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private ResidentService residentService;

    @Autowired
    private ManualNotificationService manualNotificationService;

    @Autowired
    private UserService userService;

    // Gửi thông báo thủ công cho danh sách resident
    @PostMapping("/send-noti")
    public ResponseEntity<?> sendNotification(@RequestBody NotificationRequestDTO request) {
        List<Long> residentIds = request.getResidentIds();
        String message = request.getMessage();

        if (residentIds == null || residentIds.isEmpty()) {
            return ResponseEntity.badRequest().body("Vui lòng chọn ít nhất một cư dân");
        }

        for (Long residentId : residentIds) {
            notificationService.createNotification(residentId, message, null, null);
        }

        manualNotificationService.createManualNotification(residentIds, message);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Đã gửi thông báo đến " + residentIds.size() + " cư dân");
        return ResponseEntity.ok(response);
    }

    // API xem toàn bộ thông báo thủ công đã gửi
    @GetMapping("/notifications/manual")
    public ResponseEntity<?> getAllManualNotifications() {
        List<ManualNotification> notifications = manualNotificationService.getAllManualNotifications();
        return ResponseEntity.ok(notifications);
    }

    // API chuẩn bị gửi thông báo theo userId (lưu vào session tạm)
    @PostMapping("/notifications/prepare-batch")
    public ResponseEntity<?> prepareBatchNotification(@RequestBody List<Long> userIds, @SessionAttribute Map<String, Object> session) {
        if (userIds != null && !userIds.isEmpty()) {
            session.put("batchNotificationUserIds", userIds);
            return ResponseEntity.ok("success");
        }
        return ResponseEntity.badRequest().body("error");
    }

    // API gửi hàng loạt thông báo theo userId (lấy từ session)
    @PostMapping("/notifications/batch/send")
    public ResponseEntity<?> sendBatchNotification(
            @RequestBody NotificationRequestDTO request,
            @SessionAttribute Map<String, Object> session) {

        List<Long> userIds = (List<Long>) session.get("batchNotificationUserIds");
        String message = request.getMessage();

        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Vui lòng nhập nội dung thông báo");
        }

        if (userIds == null || userIds.isEmpty()) {
            return ResponseEntity.badRequest().body("Không có người dùng nào được chọn");
        }

        List<Long> residentIds = new ArrayList<>();
        Map<Long, String> failedUsers = new HashMap<>();

        for (Long userId : userIds) {
            User user = userService.findById(userId);
            if (user != null && user.getResidentId() != null) {
                residentIds.add(user.getResidentId());
            } else {
                failedUsers.put(userId, user != null ? user.getName() : "User ID: " + userId);
            }
        }

        int successCount = 0;
        List<Long> successIds = new ArrayList<>();

        for (Long residentId : residentIds) {
            try {
                notificationService.createNotification(residentId, message, null, null);
                successIds.add(residentId);
                successCount++;
            } catch (Exception e) {
                // Log error nếu cần
            }
        }

        if (!successIds.isEmpty()) {
            manualNotificationService.createManualNotification(successIds, message);
        }

        session.remove("batchNotificationUserIds");

        Map<String, Object> result = new HashMap<>();
        result.put("successCount", successCount);
        result.put("failedCount", failedUsers.size());
        result.put("message", "Gửi thông báo hoàn tất");

        return ResponseEntity.ok(result);
    }
}
