package com.example.demo.controller;

import com.example.demo.dto.UserDTO;
import com.example.demo.service.MailService;
import com.example.demo.service.OTPService;
import com.example.demo.service.UserService;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class RegisterController {
    @Autowired
    private UserService userService;
    @Autowired
    private MailService mailService;
    @Autowired
    private OTPService otpService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserDTO request, 
                                          BindingResult result, 
                                          HttpSession session) {
        if (result.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            for (FieldError error : result.getFieldErrors()) {
                errors.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(Map.of("errors", errors));
        }

        // Lưu user vào session
        session.setAttribute("tempUser", request);
        session.setAttribute("email", request.getEmail());

        // Lấy SESSION ID
        String sessionId = session.getId();

        Map<String, String> response = new HashMap<>();
        response.put("message", "User saved to session successfully!");
        response.put("email", request.getEmail());

        return ResponseEntity.ok(response);
    }
}
