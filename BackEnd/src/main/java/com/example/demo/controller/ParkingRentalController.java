package com.example.demo.controller;

import com.example.demo.dto.ParkingRentalFormDto;
import com.example.demo.entity.Apartment;
import com.example.demo.entity.ParkingLot;
import com.example.demo.entity.ParkingRental;
import com.example.demo.enums.ParkingLotStatus;
import com.example.demo.service.ApartmentService;
import com.example.demo.service.ParkingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/parking-rentals")
@RequiredArgsConstructor
public class ParkingRentalController {

    @Autowired
    private ApartmentService apartmentService;
    @Autowired
    private ParkingService parkingService;

    // API để lấy thông tin căn hộ và danh sách bãi đỗ còn trống
    @GetMapping("/form")
    public ResponseEntity<?> getRentalFormData(@RequestParam("apartmentId") Long apartmentId) {
        Apartment apartment = apartmentService.findById(apartmentId);
        List<ParkingLot> availableLots = parkingService.getAvailableParkingLots();

        Map<String, Object> response = new HashMap<>();
        response.put("apartment", apartment);
        response.put("availableLots", availableLots);

        return ResponseEntity.ok(response);
    }
    @GetMapping("/available-parking-lots")
    public ResponseEntity<List<ParkingLot>> getAvailableParkingLots() {
        List<ParkingLot> availableLots = parkingService.getAvailableParkingLots();
        return ResponseEntity.ok(availableLots);
    }

    // API để xử lý form thuê chỗ đỗ xe
    @PostMapping("/new")
    public ResponseEntity<?> createRental(@RequestParam("apartmentNumber") String apartmentNumber,
                                          @Valid @RequestBody ParkingRentalFormDto form) {

        if (form.getEndDate() != null && !form.getEndDate().isAfter(LocalDate.now())) {
            return ResponseEntity.badRequest().body("Ngày đến hạn phải sau ngày hôm nay");
        }

        Apartment apartment = apartmentService.getApartmentByNumber(apartmentNumber);
        ParkingLot selectedLot = parkingService.getParkingLotByLotCode(form.getParkingLotCode());

        if (selectedLot == null || selectedLot.getStatus() != ParkingLotStatus.AVAILABLE) {
            return ResponseEntity.badRequest().body("Chỗ đỗ xe không hợp lệ hoặc đã được thuê");
        }

        ParkingRental rental = new ParkingRental();
        rental.setApartment(apartment);
        rental.setParkingLot(selectedLot);
        rental.setStartDate(LocalDate.now());
        rental.setEndDate(form.getEndDate());
        rental.getParkingLot().setStatus(ParkingLotStatus.RENTED);
        rental.getParkingLot().setPlate(form.getPlate());

        parkingService.save(rental);

        return ResponseEntity.ok("Thuê chỗ đỗ xe thành công");
    }
}
