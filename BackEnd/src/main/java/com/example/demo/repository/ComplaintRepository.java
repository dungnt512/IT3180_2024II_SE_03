package com.example.demo.repository;

import com.example.demo.entity.Complaint;
import com.example.demo.enums.ComplaintStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByResident_IdOrderByCreatedAtDesc(Long residentId);
    List<Complaint> findAllByOrderByCreatedAtDesc();
    List<Complaint> findByStatusNotOrderByCreatedAtDesc(ComplaintStatus status);
}
