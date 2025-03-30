package com.example.demo.service;

import com.example.demo.entity.Resident;
import com.example.demo.entity.User;
import com.example.demo.repository.ResidentRepository;
import com.example.demo.repository.UserRepository;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
public class OTPService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ResidentRepository residentRepository;

    @Autowired
    private MailService mailService;

    @Autowired
    private StringRedisTemplate redisTemplate;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

//    private final Map<String, String> otpStorage = new HashMap<>();

    private String generateOtp() {
        return String.format("%06d", new Random().nextInt(999999));
    }

    private final Cache<String, String> otpCache = Caffeine.newBuilder()
            .expireAfterWrite(5, TimeUnit.MINUTES)
            .maximumSize(1000)
            .build();
    private final Cache<String, Integer> attemptOtpCache = Caffeine.newBuilder()
            .expireAfterWrite(5, TimeUnit.MINUTES)
            .maximumSize(1000)
            .build();

    public boolean sendGmailAuthentication(String email) {
        String attemptKey = "ATTEMPT_" + email;
        Integer attempts = attemptOtpCache.getIfPresent(attemptKey);
        if (attempts == null) {
            attempts = 0;
        }
        if (attempts != null && attempts >= 3) {
            throw new RuntimeException("Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau 15 phút.");
        }

        String otp = generateOtp();
        otpCache.put(email, passwordEncoder.encode(otp));
        attemptOtpCache.put(email, attempts + 1);

        mailService.sendOTP(email, otp);
        return true;
    }
    // Gửi OTP nếu username & email hợp lệ
    public boolean sendResetPasswordOTP(String username) {

//        String attemptKey = "ATTEMPT_" + username;
//        Integer attempts = redisTemplate.opsForValue().get(attemptKey) != null
//                ? Integer.parseInt(redisTemplate.opsForValue().get(attemptKey))
//                : 0;
//
//        if (attempts >= 3) {
//            throw new RuntimeException("Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau 15 phút.");
//        }
        String attemptKey = "ATTEMPT_" + username;
        Integer attempts = attemptOtpCache.getIfPresent(attemptKey);
        if (attempts == null) {
            attempts = 0;
        }
        if (attempts != null && attempts >= 3) {
            throw new RuntimeException("Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau 15 phút.");
        }

        Optional<User> userOpt = Optional.ofNullable(userRepository.findByName(username));
        if (userOpt.isEmpty()) return false;

        User user = userOpt.get();
        Resident resident = residentRepository.findById(user.getResidentId()).orElse(null);
        if (resident == null) {
            return false;
        }
//        if (resident == null || !resident.getEmail().equals(email)) {
//            return false;
//        }
        String email = resident.getEmail();
        // Tạo mã OTP 6 số
        String otp = generateOtp();
        otpCache.put(email, passwordEncoder.encode(otp));
        attemptOtpCache.put(email, attempts + 1);
//        otpStorage.put(email, otp);
//        String hashOtp = passwordEncoder.encode(otp);
//        redisTemplate.opsForValue().set("OTP_" + email, hashOtp, 5, TimeUnit.MINUTES);
//        redisTemplate.opsForValue().increment(attemptKey, 1);
//        redisTemplate.expire(attemptKey, 15, TimeUnit.MINUTES);

        // Gửi email OTP
        mailService.sendOTP(email, otp);

        return true;
    }

    // Xác thực OTP và đổi mật khẩu
    public boolean verifyOTPAndChangePassword(String username, String email, String otp, String newPassword) {
//        String storedOtp = redisTemplate.opsForValue().get("OTP_" + email);
        String storedOtp = otpCache.getIfPresent(email);
        if (storedOtp == null || !passwordEncoder.matches(otp, storedOtp)) {
            return false; // OTP không hợp lệ
        }

        User user = userRepository.findByName(username);
        user.setPassword(new BCryptPasswordEncoder().encode(newPassword));
        userRepository.save(user);

        return true;
    }
    public boolean verifyOTPByEmail(String email, String otp) {
//        String storedOtp = redisTemplate.opsForValue().get("OTP_" + email);
        String storedOtp = otpCache.getIfPresent(email);
        if (storedOtp == null || !passwordEncoder.matches(otp, storedOtp)) {
            return false; // OTP không hợp lệ
        }
        return true;
    }
}
