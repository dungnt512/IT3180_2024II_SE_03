package com.example.demo.repository;

import com.example.demo.entity.Bill;
import com.example.demo.enums.BillStatus;
import com.example.demo.enums.BillType;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long>, JpaSpecificationExecutor<Bill> {
    Set<Bill> findByIdIn(Set<Long> billIds);
    
    List<Bill> findByStatus(BillStatus status);

    List<Bill> findByPaymentReferenceCode(String referenceCode);
    
    @Query("SELECT b FROM Bill b WHERE b.apartmentNumber = :apartmentNumber AND b.status = :status AND b.invoiceId IS NULL")
    List<Bill> findByApartmentNumberAndStatus(@Param("apartmentNumber") String apartmentNumber, @Param("status") BillStatus status);
    
    @Query("SELECT b FROM Bill b WHERE b.apartmentNumber = :apartmentNumber AND b.billType = :billType AND b.status = :status")
    List<Bill> findByApartmentNumberAndBillTypeAndStatus(
            @Param("apartmentNumber") String apartmentNumber,
            @Param("billType") String billType,
            @Param("status") BillStatus status);
    
    @Query("SELECT b FROM Bill b WHERE b.apartmentNumber = :apartmentNumber AND b.billType = :billType AND b.status = :status AND b.dueDate = :dueDate")
    List<Bill> findByApartmentNumberAndBillTypeAndStatusAndDueDate(
            @Param("apartmentNumber") String apartmentNumber,
            @Param("billType") String billType,
            @Param("status") BillStatus status,
            @Param("dueDate") LocalDate dueDate);
    
    @Query("SELECT b FROM Bill b WHERE b.apartmentNumber = :apartmentNumber AND b.billType = :billType AND b.status = :status AND b.dueDate = :dueDate AND b.amount = :amount")
    List<Bill> findByApartmentNumberAndBillTypeAndStatusAndDueDateAndAmount(
            @Param("apartmentNumber") String apartmentNumber,
            @Param("billType") String billType,
            @Param("status") BillStatus status,
            @Param("dueDate") LocalDate dueDate,
            @Param("amount") Double amount);
    
    @Query("SELECT b FROM Bill b WHERE b.apartmentNumber = :apartmentNumber AND b.billType = :billType AND b.status = :status AND b.dueDate = :dueDate AND b.amount = :amount AND b.description = :description")
    List<Bill> findByApartmentNumberAndBillTypeAndStatusAndDueDateAndAmountAndDescription(
            @Param("apartmentNumber") String apartmentNumber,
            @Param("billType") String billType,
            @Param("status") BillStatus status,
            @Param("dueDate") LocalDate dueDate,
            @Param("amount") Double amount,
            @Param("description") String description);

    @Modifying
    @Transactional
    @Query("UPDATE Bill b SET b.status = :status WHERE b.id = :id")
    void updateStatus(@Param("id") Long id,
                      @Param("status") String status);

    @Modifying
    @Transactional
    @Query("UPDATE Bill b SET b.apartmentNumber = :apartmentNumber, b.billType = :billType, b.amount = :amount, b.dueDate = :dueDate, b.description = :description, b.status = :status WHERE b.id = :id")
    void updateBill(@Param("id") Long id,
                    @Param("apartmentNumber") String apartmentNumber,
                    @Param("billType") BillType billType,
                    @Param("amount") Double amount,
                    @Param("dueDate") LocalDate dueDate,
                    @Param("description") String description,
                    @Param("status") BillStatus status);

    @Modifying
    @Transactional
    @Query("UPDATE Bill b SET b.status = :status WHERE b.id = :id")
    void updateBillStatus(@Param("id") Long id, @Param("status") BillStatus status);
    
    @Modifying
    @Transactional
    @Query("UPDATE Bill b SET b.status = :status WHERE b.id IN :ids")
    void updateBillStatusByIds(@Param("ids") Set<Long> ids, @Param("status") BillStatus status);

    List<Bill> findByApartmentNumberContainingIgnoreCase(String apartmentNumber);
    List<Bill> findByDescriptionContainingIgnoreCase(String description);
    List<Bill> findByAmountGreaterThanEqual(Double minAmount);
    List<Bill> findByAmountLessThanEqual(Double maxAmount);
    List<Bill> findByBillTypeIn(List<BillType> billTypes);
    List<Bill> findByDueDateGreaterThanEqual(LocalDate fromDueDate);
    List<Bill> findByDueDateLessThanEqual(LocalDate toDueDate);
    List<Bill> findByStatusIn(List<BillStatus> statuses);
    
    @Query("SELECT b FROM Bill b WHERE " +
           "(:apartmentNumber IS NULL OR LOWER(b.apartmentNumber) LIKE LOWER(CONCAT('%', :apartmentNumber, '%'))) AND " +
           "(:description IS NULL OR LOWER(b.description) LIKE LOWER(CONCAT('%', :description, '%'))) AND " +
           "(:minAmount IS NULL OR b.amount >= :minAmount) AND " +
           "(:maxAmount IS NULL OR b.amount <= :maxAmount) AND " +
           "(:fromDueDate IS NULL OR b.dueDate >= :fromDueDate) AND " +
           "(:toDueDate IS NULL OR b.dueDate <= :toDueDate)")
    List<Bill> findByFilters(
        @Param("apartmentNumber") String apartmentNumber,
        @Param("description") String description,
        @Param("minAmount") Double minAmount,
        @Param("maxAmount") Double maxAmount,
        @Param("fromDueDate") LocalDate fromDueDate,
        @Param("toDueDate") LocalDate toDueDate
    );
    
    @Query("SELECT b FROM Bill b WHERE b.dueDate < :dueDate AND b.status = :status")
    List<Bill> findBillsWithDueDateApproaching(@Param("dueDate") LocalDate dueDate, @Param("status") BillStatus status);
}
