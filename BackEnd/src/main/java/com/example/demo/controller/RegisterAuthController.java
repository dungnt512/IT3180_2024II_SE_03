package com.example.demo.controller;

import com.example.demo.dto.UserDTO;
import com.example.demo.service.OTPService;
import com.example.demo.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class RegisterAuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private OTPService otpService;

    @GetMapping("/send-otp")
    public ResponseEntity<?> sendOtp(HttpSession session) {
        UserDTO tempUser = (UserDTO) session.getAttribute("tempUser");
        String email = (String) session.getAttribute("email");

        if (tempUser == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Phiên đăng ký đã hết hạn!"));
        }

        otpService.sendGmailAuthentication(email);
        return ResponseEntity.ok(Map.of("message", "OTP đã được gửi đến email của bạn."));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOTP(@RequestBody Map<String, String> request, HttpSession session) {
        String otp = request.get("otp");
        UserDTO tempUser = (UserDTO) session.getAttribute("tempUser");
        String email = (String) session.getAttribute("email");

        if (tempUser == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Phiên đăng ký đã hết hạn!"));
        }

        if (!otpService.verifyOTPByEmail(email, otp)) {
            return ResponseEntity.badRequest().body(Map.of("message", "OTP không đúng. Vui lòng thử lại!"));
        }

        userService.addUser(tempUser);
        session.removeAttribute("tempUser");
        session.removeAttribute("email");

        return ResponseEntity.ok(Map.of("message", "Xác thực thành công!"));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOTP(HttpSession session) {
        System.out.println("🔥 Resend OTP - Session ID: " + session.getId());
        System.out.println("🔥 Email in session: " + session.getAttribute("email"));
    	System.out.println("=== Nhận request resend OTP ===");
        String email = (String) session.getAttribute("email");
        System.out.println("email" + email);

        if (email == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Không tìm thấy email trong session!"));
        }

        otpService.sendGmailAuthentication(email);
        return ResponseEntity.ok(Map.of("message", "OTP đã được gửi lại!"));
    }
}
