package com.example.demo.controller;

import com.example.demo.entity.ApartmentFeeUnit;
import com.example.demo.service.ApartmentFeeUnitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/fee-units")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class ApartmentFeeUnitController {

    @Autowired
    private ApartmentFeeUnitService feeUnitService;

    @GetMapping
    public ResponseEntity<ApartmentFeeUnit> getFeeUnit() {
        ApartmentFeeUnit feeUnit = feeUnitService.getFeeUnit();
        return ResponseEntity.ok(feeUnit);
    }

    @PostMapping
    public ResponseEntity<?> saveFeeUnit(@RequestBody ApartmentFeeUnit feeUnit) {
        if (feeUnit.getApartmentPricePerM2() < 0 ||
            feeUnit.getServiceFeePerM2() < 0 ||
            feeUnit.getMotorbikeParkingFeeByMonth() < 0 ||
            feeUnit.getMotorbikeParkingFeeByHour() < 0 ||
            feeUnit.getCarParkingFeeByMonth() < 0 ||
            feeUnit.getCarParkingFeeByHour() < 0 ||
            feeUnit.getWaterFeePerM3() < 0 ||
            feeUnit.getElectricityFeePerKWh() < 0) {

            Map<String, String> error = new HashMap<>();
            error.put("message", "Giá trị phí không thể là số âm!");
            return ResponseEntity.badRequest().body(error);
        }

        feeUnit.setId(1L);
        ApartmentFeeUnit savedFeeUnit = feeUnitService.saveFeeUnit(feeUnit);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Cập nhật đơn giá thành công!");
        response.put("status", "success");

        return ResponseEntity.ok(savedFeeUnit);
    }
} 