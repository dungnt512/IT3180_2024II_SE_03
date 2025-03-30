package com.example.demo.repository;

import com.example.demo.entity.Bill;
import com.example.demo.enums.BillStatus;
import com.example.demo.enums.BillType;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    Set<Bill> findByIdIn(Set<Long> billIds);

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
}
