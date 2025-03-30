package com.example.demo.authentication.repository;

import com.example.demo.authentication.entity.Resident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ResidentRepository extends JpaRepository<Resident, Long> {
    Resident findByFullName(String fullName);
    boolean existsByFullName(String fullName);
}