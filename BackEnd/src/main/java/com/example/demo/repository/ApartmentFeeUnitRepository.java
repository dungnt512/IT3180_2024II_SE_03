package com.example.demo.repository;

import com.example.demo.entity.ApartmentFeeUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ApartmentFeeUnitRepository extends JpaRepository<ApartmentFeeUnit, Long> {
} 