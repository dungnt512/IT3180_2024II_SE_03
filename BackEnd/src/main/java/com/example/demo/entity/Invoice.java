package com.example.demo.entity;

import com.example.demo.enums.InvoiceStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "invoices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "invoice_number", unique = true)
    private String invoiceNumber;

    @Column(name = "apartment_number", nullable = false)
    private String apartmentNumber;
    
    @Column(name = "resident_name")
    private String residentName;

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "last_check_time")
    private LocalDateTime lastCheckTime;
    
    @Column(name = "due_date")
    private LocalDate dueDate;
    
    @Column(name = "payment_reference_code")
    private String paymentReferenceCode;
    
    @Column(name = "qr_code_url", length = 1000)
    private String qrCodeUrl;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private InvoiceStatus status = InvoiceStatus.UNPAID;
    
    @ElementCollection
    @CollectionTable(name = "invoice_bill_mapping",
                    joinColumns = @JoinColumn(name = "invoice_id"))
    @Column(name = "bill_id")
    private List<Long> billIds;
    
    public boolean isPaid() {
        return status == InvoiceStatus.PAID;
    }
    
    public List<Long> getBillIds() {
        if (billIds == null) {
            billIds = new ArrayList<>();
        }
        return billIds;
    }
} 