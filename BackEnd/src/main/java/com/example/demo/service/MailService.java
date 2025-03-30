package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;

@Service
public class MailService {
    @Autowired
    private JavaMailSender mailSender;

    private static final int OTP_LENGTH = 6;
    private final SecureRandom secureRandom = new SecureRandom();

    public void sendOTP(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Mã xác nhận");
        message.setText("Mã OTP của bạn là: " + otp + "\nMã này chỉ có hiệu lực trong 5 phút.");
        mailSender.send(message);
    }

    public String generateOTP() {
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(secureRandom.nextInt(10)); // Sinh số từ 0-9
        }
        return otp.toString();
    }
}
