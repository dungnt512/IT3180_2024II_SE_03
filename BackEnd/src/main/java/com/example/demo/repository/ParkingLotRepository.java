package com.example.demo.repository;

import com.example.demo.entity.ParkingLot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface ParkingLotRepository extends JpaRepository<ParkingLot, Long> {
    boolean existsByLotCode(String lotCode);
    Optional<ParkingLot> findByLotCode(String lotCode);
}
