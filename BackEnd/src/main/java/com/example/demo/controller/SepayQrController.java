package com.example.demo.controller;

import com.example.demo.service.BillService;
import com.example.demo.service.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.repository.BillRepository;
import com.example.demo.service.SepayQrService;

@RestController
@RequestMapping("/api/qrcode")
public class SepayQrController {

    @Autowired
    private SepayQrService sepayQrService;

    @Autowired
    private BillRepository billRepository;
    @Autowired
    private BillService billService;
    @Autowired
    private InvoiceService invoiceService;

    @GetMapping("/{billId}")
    public ResponseEntity<?> getQrCodeUrl(@PathVariable Long billId) {
        return billService.findById(billId)
            .map(bill -> {
                String qrCodeUrl = sepayQrService.generateQrCodeUrl(bill, false);
                return ResponseEntity.ok().body(new QrCodeResponse(qrCodeUrl, bill.getPaymentReferenceCode()));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/regenerate/{billId}")
    public ResponseEntity<?> regenerateQrCode(@PathVariable Long billId) {
        return billService.findById(billId)
            .map(bill -> {
                String qrCodeUrl = sepayQrService.generateQrCodeUrl(bill, true);
                return ResponseEntity.ok().body(new QrCodeResponse(qrCodeUrl, bill.getPaymentReferenceCode()));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/invoice/regenerate/{invoiceId}")
    public ResponseEntity<?> regenerateInvoiceQrCode(@PathVariable Long invoiceId) {
        return invoiceService.findById(invoiceId)
            .map(invoice -> {
                String qrCodeUrl = sepayQrService.generateQrCodeUrl(invoice, true);
                return ResponseEntity.ok().body(new QrCodeResponse(qrCodeUrl, invoice.getPaymentReferenceCode()));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/invoice/{invoiceId}")
    public ResponseEntity<?> getInvoiceQrCodeUrl(@PathVariable Long invoiceId) {
        return invoiceService.findById(invoiceId)
            .map(invoice -> {
                String qrCodeUrl = sepayQrService.generateQrCodeUrl(invoice, false);
                return ResponseEntity.ok().body(new QrCodeResponse(qrCodeUrl, invoice.getPaymentReferenceCode()));
            })
            .orElse(ResponseEntity.notFound().build());
    }

//
//    @GetMapping("/regenerate/godMode")
//    public void regenerateQrAllCode() {
//        billService.regenerateAllQrCode();
//        invoiceService.regenerateAllQrCode();
//    }

    // Cập nhật response class:
    public static class QrCodeResponse {
        private String qrCodeUrl;
        private String referenceCode;

        public QrCodeResponse(String qrCodeUrl, String referenceCode) {
            this.qrCodeUrl = qrCodeUrl;
            this.referenceCode = referenceCode;
        }

        public String getQrCodeUrl() {
            return qrCodeUrl;
        }

        public void setQrCodeUrl(String qrCodeUrl) {
            this.qrCodeUrl = qrCodeUrl;
        }

        public String getReferenceCode() {
            return referenceCode;
        }

        public void setReferenceCode(String referenceCode) {
            this.referenceCode = referenceCode;
        }
    }
}