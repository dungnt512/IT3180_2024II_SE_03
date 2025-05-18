package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ContributionTypeDTO {
    private Long id;
    
    @NotBlank(message = "Tên loại đóng góp không được để trống")
    @Size(min = 5, max = 200, message = "Tên loại đóng góp phải từ 5 đến 200 ký tự")
    private String name;
    
    @Size(max = 1000, message = "Mô tả không được vượt quá 1000 ký tự")
    private String description;
    
    private LocalDateTime createdAt;
    private Long createdBy;
    private Boolean isActive;
    private String createdByName;
} 