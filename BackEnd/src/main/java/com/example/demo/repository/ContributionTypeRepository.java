package com.example.demo.repository;

import com.example.demo.entity.ContributionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContributionTypeRepository extends JpaRepository<ContributionType, Long> {
    List<ContributionType> findByIsActive(Boolean isActive);
} 