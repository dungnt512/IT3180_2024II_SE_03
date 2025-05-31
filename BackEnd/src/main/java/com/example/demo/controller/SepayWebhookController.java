package com.example.demo.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.config.SepayConfig;
import com.example.demo.entity.Bill;
import com.example.demo.enums.BillStatus;
import com.example.demo.repository.BillRepository;
import com.example.demo.service.BillService;
import com.example.demo.service.InvoiceService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/webhook")
public class SepayWebhookController {
    
    @Autowired
    private BillService billService;
    
//    @Autowired
//    private BillRepository billRepository;
    
    @Autowired
    private InvoiceService invoiceService;
    
    @Autowired
    private SepayConfig sepayConfig;
    
    private static final Pattern REFERENCE_CODE_PATTERN_BILL = Pattern.compile("(RF\\w+)");
    private static final Pattern REFERENCE_CODE_PATTERN_INVOICE = Pattern.compile("(INV\\w+)");
    
    @PostMapping("/sepay")
    public ResponseEntity<?> handleSepayWebhook(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody String payload,
            HttpServletRequest request) {
        
        try {
            String clientIp = request.getRemoteAddr();

//             if (!"103.255.238.9".equals(clientIp)) {
//            if (!sepayConfig.getIpAllow().equals(clientIp)) {
//                // if (!"127.0.0.1".equals(clientIp) && !"0:0:0:0:0:0:0:1".equals(clientIp)) {
//                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("success", false, "message", "Unauthorized IP"));
//                // }
//            }
//            System.err.println(authHeader);
            if (authHeader != null && authHeader.startsWith("Apikey ")) {
                String apiKey = authHeader.substring(7);
                if (!apiKey.equals(sepayConfig.getApiToken())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("success", false, "message", "Invalid API Key"));
                }
            }
            else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("success", false, "message", "Invalid API Key"));
            }
            
            ObjectMapper mapper = new ObjectMapper();
            JsonNode webhookData = mapper.readTree(payload);
            
            String transactionId = webhookData.path("id").asText();
            String content = webhookData.path("content").asText();
            String description = webhookData.path("description").asText();
            String transferType = webhookData.path("transferType").asText();
            double transferAmount = webhookData.path("transferAmount").asDouble();

            if (!"in".equals(transferType)) {
                return ResponseEntity.status(HttpStatus.OK).body(Map.of(
                    "success", true, 
                    "message", "Not an incoming transaction"
                ));
            }
            
            String billReferenceCode = extractBillReferenceCode(content);
            if (billReferenceCode == null) {
                billReferenceCode = extractBillReferenceCode(description);
            }
            
            if (billReferenceCode != null) {
                List<Bill> bills = billService.findByPaymentReferenceCode(billReferenceCode);
                
                if (bills != null && !bills.isEmpty()) {
                    Bill bill = bills.get(0);

                    if (bill.getAmount() != transferAmount) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                            "success", false,
                            "message", "Payment amount does not match the bill amount"
                        ));
                    }
                    
                    bill.setStatus(BillStatus.PAID);
                    bill.setPaymentError(null);
                    bill.setTransactionId(transactionId);
                    billService.save(bill);
                    
                    billService.sendPaymentConfirmation(bill);
                    
                    return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                        "success", true, 
                        "message", "Bill payment processed successfully"
                    ));
                }
            }
            
            String invoiceReferenceCode = extractInvoiceReferenceCode(content);
            if (invoiceReferenceCode == null) {
                invoiceReferenceCode = extractInvoiceReferenceCode(description);
            }
            
            if (invoiceReferenceCode != null) {
                boolean processed = invoiceService.processPaymentWebhook(invoiceReferenceCode, transferAmount, transactionId);
                
                if (processed) {
                    return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                        "success", true, 
                        "message", "Invoice payment processed successfully"
                    ));
                }
            }
            
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Webhook received but no matching payment found"
            ));
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "success", false,
                "message", "Error processing webhook: " + e.getMessage()
            ));
        }
    }
    
    private String extractBillReferenceCode(String description) {
        if (description == null || description.isEmpty()) {
            return null;
        }
        
        Matcher matcher = REFERENCE_CODE_PATTERN_BILL.matcher(description);
        if (matcher.find()) {
            return matcher.group(1);
        }
        
        if (description.contains("RF")) {
            int startIndex = description.indexOf("RF");
            int endIndex = description.indexOf(" ", startIndex);
            if (endIndex == -1) {
                endIndex = description.length();
            }
            return description.substring(startIndex, endIndex);
        }
        
        return null;
    }
    
    private String extractInvoiceReferenceCode(String description) {
        if (description == null || description.isEmpty()) {
            return null;
        }
        
        Matcher matcher = REFERENCE_CODE_PATTERN_INVOICE.matcher(description);
        if (matcher.find()) {
            return matcher.group(1);
        }
        
        if (description.contains("INV")) {
            int startIndex = description.indexOf("INV");
            int endIndex = description.indexOf(" ", startIndex);
            if (endIndex == -1) {
                endIndex = description.length();
            }
            return description.substring(startIndex, endIndex);
        }
        
        return null;
    }
} 