package com.example.demo.repository;

import com.example.demo.entity.ResidentContribution;
import com.example.demo.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResidentContributionRepository extends JpaRepository<ResidentContribution, Long> {
    List<ResidentContribution> findByContributionId(Long contributionId);
    List<ResidentContribution> findByResidentId(Long residentId);
    List<ResidentContribution> findByApartmentNumber(String apartmentNumber);
    List<ResidentContribution> findByPaymentStatus(PaymentStatus paymentStatus);
    List<ResidentContribution> findByContributionIdAndPaymentStatus(Long contributionId, PaymentStatus paymentStatus);
    Optional<ResidentContribution> findByInvoiceId(Long invoiceId);
} 