package com.example.demo.controller;

import com.example.demo.entity.Invoice;
import com.example.demo.enums.InvoiceStatus;
import com.example.demo.repository.InvoiceRepository;
import com.example.demo.service.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Arrays;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceAPIController {

//    @Autowired
//    private InvoiceRepository invoiceRepository;
    
    @Autowired
    private InvoiceService invoiceService;

    @GetMapping("/list")
    public List<Map<String, Object>> getAllInvoices() {
        List<Invoice> invoices = invoiceService.findAll();
        return invoices.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/filter")
    public List<Map<String, Object>> filterInvoices(
            @RequestParam(value = "invoiceNumber", required = false) String invoiceNumber,
            @RequestParam(value = "apartmentNumber", required = false) String apartmentNumber,
            @RequestParam(value = "residentName", required = false) String residentName,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "minAmount", required = false) Double minAmount,
            @RequestParam(value = "maxAmount", required = false) Double maxAmount,
            @RequestParam(value = "fromDueDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDueDate,
            @RequestParam(value = "toDueDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDueDate,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "floors", required = false) String floors,
            @RequestParam(value = "filterLogic", defaultValue = "AND") String filterLogic) {

        Map<String, Object> filterParams = new HashMap<>();
        
        if (invoiceNumber != null && !invoiceNumber.isEmpty()) {
            filterParams.put("invoiceNumber", invoiceNumber);
        }
        
        if (apartmentNumber != null && !apartmentNumber.isEmpty()) {
            filterParams.put("apartmentNumber", apartmentNumber);
        }
        
        if (residentName != null && !residentName.isEmpty()) {
            filterParams.put("residentName", residentName);
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
        
        if (fromDueDate != null) {
            filterParams.put("fromDueDate", fromDueDate);
        }
        
        if (toDueDate != null) {
            filterParams.put("toDueDate", toDueDate);
        }
        
        if (status != null && !status.isEmpty()) {
            List<InvoiceStatus> statusList = parseStatusValues(status);
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
        
        List<Invoice> invoices = invoiceService.filterInvoices(filterParams);
        
        return invoices.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    private List<InvoiceStatus> parseStatusValues(String status) {
        if (status == null || status.isEmpty()) {
            return new ArrayList<>();
        }
        
        return Arrays.stream(status.split("\\|"))
                .filter(s -> !s.isEmpty())
                .map(s -> {
                    try {
                        return InvoiceStatus.valueOf(s.trim());
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
    public Map<String, String> markInvoiceAsPaid(@PathVariable Long id) {
        Invoice invoice = invoiceService.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Invoice not found with ID: " + id));
        
        invoice.setStatus(InvoiceStatus.PAID);
        invoiceService.save(invoice);
        
        return Map.of("status", "success", "message", "Invoice marked as paid successfully");
    }
    
    @DeleteMapping("/{id}")
    public Map<String, String> deleteInvoice(@PathVariable Long id) {
        invoiceService.deleteById(id);
        return Map.of("status", "success", "message", "Invoice deleted successfully");
    }
    
    private Map<String, Object> convertToDto(Invoice invoice) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", invoice.getId());
        dto.put("invoiceNumber", invoice.getInvoiceNumber());
        dto.put("apartmentNumber", invoice.getApartmentNumber());
        dto.put("residentName", invoice.getResidentName());
        dto.put("totalAmount", invoice.getTotalAmount());
        dto.put("dueDate", invoice.getDueDate());
        dto.put("description", invoice.getDescription() != null ? invoice.getDescription() : "");
        dto.put("status", invoice.getStatus().name());
        dto.put("createdAt", invoice.getCreatedAt());
        dto.put("billIds", invoice.getBillIds());
        
        return dto;
    }
} 