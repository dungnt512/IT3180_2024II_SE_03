package com.example.demo.controller;

import com.example.demo.entity.Bill;
import com.example.demo.enums.BillStatus;
import com.example.demo.enums.BillType;
import com.example.demo.repository.BillRepository;
import com.example.demo.service.BillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Arrays;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bills")
public class BillAPIController {

//    @Autowired
//    private BillRepository billRepository;
    
    @Autowired
    private BillService billService;

    @GetMapping("/list")
    public List<Map<String, Object>> getAllBills() {
        List<Bill> bills = billService.getAllBills();
        return bills.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/filter")
    public List<Map<String, Object>> filterBills(
            @RequestParam(value = "apartmentNumber", required = false) String apartmentNumber,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "minAmount", required = false) Double minAmount,
            @RequestParam(value = "maxAmount", required = false) Double maxAmount,
            @RequestParam(value = "billType", required = false) String billType,
            @RequestParam(value = "fromDueDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDueDate,
            @RequestParam(value = "toDueDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDueDate,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "floors", required = false) String floors,
            @RequestParam(value = "filterLogic", defaultValue = "AND") String filterLogic) {

        Map<String, Object> filterParams = new HashMap<>();
        
        if (apartmentNumber != null && !apartmentNumber.isEmpty()) {
            filterParams.put("apartmentNumber", apartmentNumber);
        }
        
        if (description != null && !description.isEmpty()) {
            filterParams.put("description", description);
        }
        
        if (minAmount != null) {
            filterParams.put("minAmount", minAmount);
        }
        
        if (maxAmount != null) {
            filterParams.put("maxAmount", maxAmount);
        }
        
        if (billType != null && !billType.isEmpty()) {
            List<BillType> billTypes = parseBillTypeValues(billType);
            if (!billTypes.isEmpty()) {
                filterParams.put("billType", billTypes);
            }
        }
        
        if (fromDueDate != null) {
            filterParams.put("fromDueDate", fromDueDate);
        }
        
        if (toDueDate != null) {
            filterParams.put("toDueDate", toDueDate);
        }
        
        if (status != null && !status.isEmpty()) {
            List<BillStatus> statusList = parseStatusValues(status);
            if (!statusList.isEmpty()) {
                filterParams.put("status", statusList);
            }
        }
        
        if (floors != null && !floors.isEmpty()) {
            List<Integer> floorList = parseFloorValues(floors);
            if (!floorList.isEmpty()) {
                filterParams.put("floors", floorList);
            }
        }
        
        filterParams.put("filterLogic", filterLogic);
        
        List<Bill> bills = billService.filterBills(filterParams);
        
        return bills.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    private List<BillType> parseBillTypeValues(String billType) {
        if (billType == null || billType.isEmpty()) {
            return new ArrayList<>();
        }
        
        return Arrays.stream(billType.split("\\|"))
                .filter(s -> !s.isEmpty())
                .map(s -> {
                    try {
                        return BillType.valueOf(s.trim());
                    } catch (IllegalArgumentException e) {
                        return null;
                    }
                })
                .filter(value -> value != null)
                .collect(Collectors.toList());
    }
    
    private List<BillStatus> parseStatusValues(String status) {
        if (status == null || status.isEmpty()) {
            return new ArrayList<>();
        }
        
        return Arrays.stream(status.split("\\|"))
                .filter(s -> !s.isEmpty())
                .map(s -> {
                    try {
                        return BillStatus.valueOf(s.trim());
                    } catch (IllegalArgumentException e) {
                        return null;
                    }
                })
                .filter(value -> value != null)
                .collect(Collectors.toList());
    }

    private List<Integer> parseFloorValues(String floors) {
        if (floors == null || floors.isEmpty()) {
            return new ArrayList<>();
        }
        
        return Arrays.stream(floors.split(","))
                .filter(s -> !s.isEmpty())
                .map(s -> {
                    try {
                        return Integer.parseInt(s.trim());
                    } catch (NumberFormatException e) {
                        return null;
                    }
                })
                .filter(value -> value != null)
                .collect(Collectors.toList());
    }

    @PostMapping("/{id}/mark-paid")
    public Map<String, String> markBillAsPaid(@PathVariable Long id) {
        Bill bill = billService.getBillById(id);
        if (bill == null) {
            throw new IllegalArgumentException("Bill not found with ID: " + id);
        }

        bill.setStatus(BillStatus.PAID);
        billService.save(bill);
        
        return Map.of("status", "success", "message", "Bill marked as paid successfully");
    }
    
    @DeleteMapping("/{id}")
    public Map<String, String> deleteBill(@PathVariable Long id) {
        billService.deleteBillById(id);
        return Map.of("status", "success", "message", "Bill deleted successfully");
    }
    
    private Map<String, Object> convertToDto(Bill bill) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", bill.getId());
        dto.put("apartmentNumber", bill.getApartmentNumber());
        dto.put("billType", bill.getBillType());
        dto.put("amount", bill.getAmount());
        dto.put("dueDate", bill.getDueDate());
        dto.put("description", bill.getDescription() != null ? bill.getDescription() : "");
        dto.put("status", bill.getStatus().name());
        
        return dto;
    }
    // Lấy chi tiết một hóa đơn theo ID
    @GetMapping("/{id}")
    public ResponseEntity<Bill> getBill(@PathVariable Long id) {
        Bill bill = billService.getBillById(id);
        return bill != null ? ResponseEntity.ok(bill) : ResponseEntity.notFound().build();
    }
    
} 