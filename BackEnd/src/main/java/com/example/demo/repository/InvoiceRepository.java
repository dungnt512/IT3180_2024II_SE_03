package com.example.demo.repository;

import com.example.demo.entity.Invoice;
import com.example.demo.enums.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
    List<Invoice> findByApartmentNumber(String apartmentNumber);
    List<Invoice> findByStatus(InvoiceStatus status);
    Optional<Invoice> findByPaymentReferenceCode(String paymentReferenceCode);
    List<Invoice> findByInvoiceNumberContainingIgnoreCase(String invoiceNumber);
    List<Invoice> findByApartmentNumberContainingIgnoreCase(String apartmentNumber);
    List<Invoice> findByResidentNameContainingIgnoreCase(String residentName);
    List<Invoice> findByDescriptionContainingIgnoreCase(String description);
    List<Invoice> findByTotalAmountGreaterThanEqual(Double minAmount);
    List<Invoice> findByTotalAmountLessThanEqual(Double maxAmount);
    List<Invoice> findByDueDateGreaterThanEqual(LocalDate fromDueDate);
    List<Invoice> findByDueDateLessThanEqual(LocalDate toDueDate);
    List<Invoice> findByStatusIn(List<InvoiceStatus> statuses);
    
    @Query("SELECT i FROM Invoice i WHERE i.dueDate = :dueDate AND i.status = :status")
    List<Invoice> findByDueDateAndStatus(@Param("dueDate") LocalDate dueDate, @Param("status") InvoiceStatus status);
    
    @Query("SELECT i FROM Invoice i WHERE i.dueDate < :dueDate AND i.status = :status")
    List<Invoice> findInvoicesWithDueDateApproaching(@Param("dueDate") LocalDate dueDate, @Param("status") InvoiceStatus status);
    
    @Query("SELECT i FROM Invoice i WHERE " +
           "(:invoiceNumber IS NULL OR LOWER(i.invoiceNumber) LIKE LOWER(CONCAT('%', :invoiceNumber, '%'))) AND " +
           "(:apartmentNumber IS NULL OR LOWER(i.apartmentNumber) LIKE LOWER(CONCAT('%', :apartmentNumber, '%'))) AND " +
           "(:residentName IS NULL OR LOWER(i.residentName) LIKE LOWER(CONCAT('%', :residentName, '%'))) AND " +
           "(:description IS NULL OR LOWER(i.description) LIKE LOWER(CONCAT('%', :description, '%'))) AND " +
           "(:minAmount IS NULL OR i.totalAmount >= :minAmount) AND " +
           "(:maxAmount IS NULL OR i.totalAmount <= :maxAmount) AND " +
           "(:fromDueDate IS NULL OR i.dueDate >= :fromDueDate) AND " +
           "(:toDueDate IS NULL OR i.dueDate <= :toDueDate)")
    List<Invoice> findByFilters(
        @Param("invoiceNumber") String invoiceNumber,
        @Param("apartmentNumber") String apartmentNumber,
        @Param("residentName") String residentName,
        @Param("description") String description,
        @Param("minAmount") Double minAmount,
        @Param("maxAmount") Double maxAmount,
        @Param("fromDueDate") LocalDate fromDueDate,
        @Param("toDueDate") LocalDate toDueDate
    );
} 