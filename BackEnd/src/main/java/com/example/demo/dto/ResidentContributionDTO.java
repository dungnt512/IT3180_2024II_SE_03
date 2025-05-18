package com.example.demo.dto;

import com.example.demo.enums.PaymentStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ResidentContributionDTO {
    private Long id;
    
    @NotNull(message = "ID khoản đóng góp không được để trống")
    private Long contributionId;
    
    private Long residentId;
    
    private String apartmentNumber;
    
    @NotNull(message = "Số tiền không được để trống")
    @Min(value = 0, message = "Số tiền không được âm")
    private Long amount;
    
    private String note;
    private String qrCode;
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
    private Long invoiceId;
    
    private String contributionTitle;
    private String residentName;
} 