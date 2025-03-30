package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.demo.entity.Resident;
import com.example.demo.service.ResidentService;
import com.example.demo.service.ApartmentService;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@CrossOrigin// Cho phép React truy cập API
public class AdminController {
    @Autowired
    private UserService userService;
    
    @Autowired
    private ResidentService residentService;

    @Autowired
    private ApartmentService apartmentService;


    @GetMapping("/home")
    public List<User> getAllUsers() {
        return userService.allUsers();
    }

    @GetMapping("/change-password")
    public Map<String, Object> getUserId(Principal principal) {
        User user = userService.findByName(principal.getName());
        return Map.of("userId", user.getId());
    }

    @PostMapping("/change-password")
    public Map<String, String> changePassword(@RequestBody Map<String, String> payload) {
        Long userId = Long.parseLong(payload.get("userId"));
        String oldPassword = payload.get("oldPassword");
        String newPassword = payload.get("newPassword");
        String result = userService.changePassword(userId, oldPassword, newPassword);
        return Map.of("message", result);
    }
}