package com.example.demo.service;

import com.example.demo.config.SepayConfig;
import com.example.demo.entity.Bill;
import com.example.demo.entity.Invoice;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class SepayQrService {
    
    @Autowired
    private SepayConfig sepayConfig;
    
    public String generateReferenceCode(Bill bill) {
        String randomPart = UUID.randomUUID().toString().substring(0, 8);
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String billId = (bill.getId() != null) ? bill.getId().toString() : "NEW";
        String referenceCode = String.format("RF-%s-%s-%s", billId, timestamp, randomPart);
        
        return referenceCode;
    }

    public String generateInvoiceReferenceCode(Invoice invoice) {
        String randomPart = UUID.randomUUID().toString().substring(0, 8);
        
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        
        String invoiceId = (invoice.getId() != null) ? invoice.getId().toString() : "NEW";
        
        String referenceCode = String.format("INV-%s-%s-%s", invoiceId, timestamp, randomPart);
        
        return referenceCode;
    }
    
    public String generateQrCodeUrl(Bill bill) {
        String accountNumber = sepayConfig.getAccountNumber();
        String bankName = sepayConfig.getAccountBank();
        Double amount = bill.getAmount();
        
        if (bill.getPaymentReferenceCode() == null || bill.getPaymentReferenceCode().isEmpty()) {
            bill.setPaymentReferenceCode(generateReferenceCode(bill));
        }
        
        String description = bill.getPaymentReferenceCode() + " " + bill.getDescription();
        
        String encodedDescription;
        try {
            encodedDescription = URLEncoder.encode(description, StandardCharsets.UTF_8.toString());
        } catch (UnsupportedEncodingException e) {
            encodedDescription = bill.getPaymentReferenceCode();
        }
        
        String qrCodeUrl = String.format(
            "https://qr.sepay.vn/img?acc=%s&bank=%s&amount=%s&des=%s",
            accountNumber,
            bankName,
            amount.toString(),
            encodedDescription
        );
        
        return qrCodeUrl;
    }

    public String generateQrCodeUrl(Invoice invoice) {
        String accountNumber = sepayConfig.getAccountNumber();
        String bankName = sepayConfig.getAccountBank();
        Double amount = invoice.getTotalAmount();
        
        if (invoice.getPaymentReferenceCode() == null || invoice.getPaymentReferenceCode().isEmpty()) {
            invoice.setPaymentReferenceCode(generateInvoiceReferenceCode(invoice));
        }
        
        String description = invoice.getPaymentReferenceCode() + " HoaDon-" + invoice.getInvoiceNumber();
        
        String encodedDescription;
        try {
            encodedDescription = URLEncoder.encode(description, StandardCharsets.UTF_8.toString());
        } catch (UnsupportedEncodingException e) {
            encodedDescription = invoice.getPaymentReferenceCode();
        }
        
        String qrCodeUrl = String.format(
            "https://qr.sepay.vn/img?acc=%s&bank=%s&amount=%s&des=%s",
            accountNumber,
            bankName,
            amount.toString(),
            encodedDescription
        );
        
        return qrCodeUrl;
    }
} 