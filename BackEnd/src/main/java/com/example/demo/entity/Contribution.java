package com.example.demo.entity;

import com.example.demo.enums.ContributionStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "contributions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Contribution {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "contribution_type_id", nullable = false)
    private Long contributionTypeId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "target_amount")
    private Double targetAmount;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "created_by", nullable = false)
    private Long createdBy;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private ContributionStatus status = ContributionStatus.ACTIVE;

    @Column(name = "is_notified")
    private Boolean isNotified = false;

    @Column(name = "notification_sent_at")
    private LocalDateTime notificationSentAt;
} 