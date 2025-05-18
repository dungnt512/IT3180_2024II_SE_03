package com.example.demo.controller;

import com.example.demo.entity.*;
import com.example.demo.enums.BillStatus;
import com.example.demo.enums.BillType;
import com.example.demo.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/utility-bills")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class UtilityBillBatchController {

    @Autowired
    private ApartmentService apartmentService;

    @Autowired
    private BillService billService;

    @Autowired
    private ApartmentFeeUnitService feeUnitService;

    @Autowired
    private NotificationService notificationService;
    @Autowired
    private SepayQrService sepayQrService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getUtilityBillsData() {
        List<Apartment> apartments = apartmentService.getAllApartments();
        
        apartments.removeIf(apartment -> apartment.getStatus() == null || apartment.getStatus().name().equals("VACANT"));

        ApartmentFeeUnit feeUnit = feeUnitService.getFeeUnit();

        LocalDate now = LocalDate.now();
        
        Map<String, Object> response = new HashMap<>();
        response.put("apartments", apartments);
        response.put("waterFeePerM3", feeUnit.getWaterFeePerM3());
        response.put("electricityFeePerKWh", feeUnit.getElectricityFeePerKWh());
        response.put("currentMonth", now.getMonthValue());
        response.put("currentYear", now.getYear());
        response.put("defaultDueDate", now.plusDays(5));

        return ResponseEntity.ok(response);
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateUtilityBills(
            @RequestBody Map<String, Object> requestData) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, String> formData = (Map<String, String>) requestData.get("formData");
            LocalDate dueDate = LocalDate.parse((String) requestData.get("dueDate"));

            ApartmentFeeUnit feeUnit = feeUnitService.getFeeUnit();
            
            Long waterFeePerM3 = feeUnit.getWaterFeePerM3();
            Long electricityFeePerKWh = feeUnit.getElectricityFeePerKWh();
            
            List<Bill> newBills = new ArrayList<>();
            
            for (String key : formData.keySet()) {
                if (key.startsWith("electricity_")) {
                    String apartmentNumber = key.replace("electricity_", "");
                    
                    String electricityStr = formData.get(key);
                    double electricity = !electricityStr.isEmpty() ? Double.parseDouble(electricityStr) : 0;
                    
                    String waterKey = "water_" + apartmentNumber;
                    String waterStr = formData.get(waterKey);
                    double water = !waterStr.isEmpty() ? Double.parseDouble(waterStr) : 0;

                    if (electricity > 0) {
                        Bill electricityBill = new Bill();
                        electricityBill.setApartmentNumber(apartmentNumber);
                        electricityBill.setBillType(BillType.ELECTRICITY);
                        electricityBill.setAmount(electricity * electricityFeePerKWh);
                        electricityBill.setStatus(BillStatus.UNPAID);
                        electricityBill.setDueDate(dueDate);
                        electricityBill.setDescription(String.format("Tiền điện tháng %d %d chung cư số %s", //: %.2f kWh x %,d VND = %.2f VND",
                                LocalDate.now().getMonthValue(),
                                LocalDate.now().getYear(),
                                apartmentNumber));
//                                electricity,
//                                electricityFeePerKWh,
//                                electricityBill.getAmount()));
                        electricityBill.setCreatedAt(LocalDateTime.now());
                        newBills.add(electricityBill);
                    }
                    
                    if (water > 0) {
                        Bill waterBill = new Bill();
                        waterBill.setApartmentNumber(apartmentNumber);
                        waterBill.setBillType(BillType.WATER);
                        waterBill.setAmount(water * waterFeePerM3);
                        waterBill.setStatus(BillStatus.UNPAID);
                        waterBill.setDueDate(dueDate);
                        waterBill.setDescription(String.format("Tiền nước tháng %d %d chung cư số %s", //: %.2f m³ x %,d VND = %.2f VND",
                                LocalDate.now().getMonthValue(),
                                LocalDate.now().getYear(),
                                apartmentNumber));
//                                water,
//                                waterFeePerM3,
//                                waterBill.getAmount()));
                        waterBill.setCreatedAt(LocalDateTime.now());
                        newBills.add(waterBill);
                    }
                }
            }
            
            newBills = billService.saveAll(newBills);
            for (Bill bill : newBills) {
                bill.setPaymentReferenceCode(sepayQrService.generateQrCodeUrl(bill, true));
                billService.save(bill);
            }

            for (Bill bill : newBills) {
                Apartment apartment = apartmentService.findByApartmentNumber(bill.getApartmentNumber());
                apartment.getBillIds().add(bill.getId());
                apartmentService.save(apartment);
                if (apartment != null && apartment.getResidentIds() != null) {
                    for (Long residentId : apartment.getResidentIds()) {
                        notificationService.createNotification(residentId, "Hoá đơn mới: " + bill.getDescription() + " - " + bill.getAmount() + " VND",
                                "Bill: " + bill.getDescription(),
                                "/bills/" + bill.getId() + "/payment");
                    }
                }
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", String.format("Đã tạo %d hóa đơn điện nước và gửi thông báo cho cư dân!", newBills.size()));
            response.put("status", "success");
            response.put("billsCount", newBills.size());
            response.put("bills", newBills);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Lỗi khi tạo hóa đơn: " + e.getMessage());
            error.put("status", "error");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
} 