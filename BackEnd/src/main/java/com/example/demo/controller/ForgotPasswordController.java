package com.example.demo.controller;

import com.example.demo.service.OTPService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth") // Định nghĩa prefix API
@CrossOrigin
public class ForgotPasswordController {
    
    @Autowired
    private OTPService otpService;

    @PostMapping("/forgot-password")
    public ResponseEntity<?> sendOTP(@RequestBody ForgotPasswordRequest request) {
        try {
            boolean sent = otpService.sendResetPasswordOTP(request.getUsername());
            return ResponseEntity.ok(new ApiResponse("OTP sent successfully", sent));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage(), false));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        boolean success = otpService.verifyOTPAndChangePassword(
                request.getUsername(),
                request.getEmail(),
                request.getOtp(),
                request.getNewPassword()
        );
        return success ? ResponseEntity.ok(new ApiResponse("Password changed successfully", true)) 
                       : ResponseEntity.badRequest().body(new ApiResponse("Invalid OTP!", false));
    }
}

// DTO classes
class ForgotPasswordRequest {
    private String username;
    public String getUsername() { return username; }
}

class ResetPasswordRequest {
    private String username;
    private String email;
    private String otp;
    private String newPassword;

    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getOtp() { return otp; }
    public String getNewPassword() { return newPassword; }
}

class ApiResponse {
    private String message;
    private boolean success;

    public ApiResponse(String message, boolean success) {
        this.message = message;
        this.success = success;
    }

    public String getMessage() { return message; }
    public boolean isSuccess() { return success; }
}
