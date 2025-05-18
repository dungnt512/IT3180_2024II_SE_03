package com.example.demo.dto;

import com.example.demo.enums.ContributionStatus;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ContributionDTO {
    private Long id;
    
    @NotNull(message = "Loại đóng góp không được để trống")
    private Long contributionTypeId;
    
    @NotBlank(message = "Tiêu đề không được để trống")
    @Size(min = 5, max = 200, message = "Tiêu đề phải từ 5 đến 200 ký tự")
    private String title;
    
    @Size(max = 1000, message = "Mô tả không được vượt quá 1000 ký tự")
    private String description;
    
    @NotNull(message = "Ngày bắt đầu không được để trống")
    private LocalDate startDate;
    
    @NotNull(message = "Ngày kết thúc không được để trống")
    @Future(message = "Ngày kết thúc phải là ngày trong tương lai")
    private LocalDate endDate;
    
    private Double targetAmount;
    
    private LocalDateTime createdAt;
    private Long createdBy;
    private ContributionStatus status;
    private Boolean isNotified;
    private LocalDateTime notificationSentAt;
    
    private String contributionTypeName;
    private String createdByName;
    private Long totalContributions;
    private Double totalAmount;
    private Double totalPaidAmount;
} 