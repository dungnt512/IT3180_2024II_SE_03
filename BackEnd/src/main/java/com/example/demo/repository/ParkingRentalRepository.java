package com.example.demo.repository;

import com.example.demo.entity.ParkingLot;
import com.example.demo.entity.ParkingRental;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

public interface ParkingRentalRepository extends JpaRepository<ParkingRental, Long> {
    // Truy vấn để lấy các giao dịch thuê chỗ đỗ xe có ngày hết hạn sau ngày hiện tại
    List<ParkingRental> findByEndDateAfter(LocalDate date);
    Set<ParkingRental> findByApartmentId(Long apartmentId);
    List<ParkingRental> findByParkingLotId(Long parkingLotId); 
}