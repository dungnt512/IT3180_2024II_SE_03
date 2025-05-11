package com.example.demo.controller;

import com.example.demo.entity.Resident;
import com.example.demo.entity.User;
import com.example.demo.service.UserService;

import java.util.Collections;

import com.example.demo.service.ResidentService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.demo.entity.ChangePasswordRequest;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user") 
@CrossOrigin
public class UserController {
    @Autowired
    private UserService userService;

    @Autowired
    private ResidentService residentService;

    @GetMapping("/home")
    public Map<String, Object> home(Principal principal) {
        String username = principal.getName();
        User user = userService.findByName(username);
        Resident resident = residentService.findById(user.getResidentId());

        Map<String, Object> response = new HashMap<>();
        response.put("username", user.getName());
        response.put("resident", resident);

        return response;
    }
    
    @GetMapping("/change-password")
    public ResponseEntity<?> getUserId(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        User user = userService.findByName(principal.getName());
        return ResponseEntity.ok(Collections.singletonMap("userId", user.getId()));
    }
    
    
    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(@RequestBody ChangePasswordRequest request) {
        String result = userService.changePassword(request.getUserId(), request.getOldPassword(), request.getNewPassword());
        Map<String, String> response = new HashMap<>();

        if ("success".equals(result)) {
            response.put("message", result);
            return ResponseEntity.ok(response);
        } else {
            response.put("error", result);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    // Định nghĩa class DTO để nhận request body
    public static class ChangePasswordRequest {
        private Long userId;
        private String oldPassword;
        private String newPassword;

        // Getters và Setters
        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public String getOldPassword() {
            return oldPassword;
        }

        public void setOldPassword(String oldPassword) {
            this.oldPassword = oldPassword;
        }

        public String getNewPassword() {
            return newPassword;
        }

        public void setNewPassword(String newPassword) {
            this.newPassword = newPassword;
        }
    }



}