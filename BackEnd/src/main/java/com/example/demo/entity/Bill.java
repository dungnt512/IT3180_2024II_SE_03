package com.example.demo.entity;

import com.example.demo.enums.BillStatus;
import com.example.demo.enums.BillType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bills")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Bill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "apartment_number", nullable = false)
    private String apartmentNumber;

    @Column(name = "bill_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private BillType billType;

    @Column(name = "amount", nullable = false)
    private Double amount;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "description")
    private String description;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private BillStatus status;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "qr_code_url")
    private String qrCodeUrl;
    
    @Column(name = "transaction_id")
    private String transactionId;
    
    @Column(name = "last_check_time")
    private LocalDateTime lastCheckTime;
    
    @Column(name = "payment_error")
    private String paymentError;

    @Column(name = "payment_reference_code")
    private String paymentReferenceCode;

    public boolean isPaid() {
        return this.status == BillStatus.PAID;
    }

    @Column(name = "invoice_id")
    private Long invoiceId;

    public void markAsPaid() {
        this.status = BillStatus.PAID;
    }
}
