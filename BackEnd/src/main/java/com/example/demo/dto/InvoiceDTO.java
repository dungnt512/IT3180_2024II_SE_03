package com.example.demo.dto;

import com.example.demo.entity.Bill;
import com.example.demo.enums.InvoiceStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceDTO {
    private Long id;
    private String invoiceNumber;
    private String apartmentNumber;
    private String residentName;
    private LocalDateTime createdAt;
    private Long totalAmount;
    private String qrCodeUrl;
    private String description;
    private String paymentReferenceCode;
    private InvoiceStatus status;
    private LocalDate dueDate;
    private List<Bill> bills;
} 