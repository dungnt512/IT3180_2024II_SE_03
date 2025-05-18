package com.example.demo.controller;

import com.example.demo.dto.InvoiceDTO;
import com.example.demo.entity.Apartment;
import com.example.demo.entity.Bill;
import com.example.demo.entity.Invoice;
import com.example.demo.entity.Resident;
import com.example.demo.entity.User;
import com.example.demo.enums.BillStatus;
import com.example.demo.repository.ApartmentRepository;
import com.example.demo.repository.BillRepository;
import com.example.demo.repository.ResidentRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.*;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private BillService billService;

//    @Autowired
//    private BillRepository billRepository;
//
    @Autowired
    private ApartmentService apartmentService;
//    private ApartmentRepository apartmentRepository;
//
    @Autowired
    private ResidentService residentService;
//    private ResidentRepository residentRepository;
//
    @Autowired
    private UserService userService;
//    private UserRepository userRepository;

    @GetMapping("/admin")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<InvoiceDTO>> getAdminInvoices() {
        List<InvoiceDTO> invoiceDTOs = invoiceService.getAllInvoiceDTOs();
        return ResponseEntity.ok(invoiceDTOs);
    }

    @GetMapping("/godMode")
    public void resetAllBillsInvoicesReference() {

    }

    @GetMapping("/user")
    public ResponseEntity<?> getUserInvoices(@RequestParam(required = false) String apartmentNumber) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(HttpStatus.FOUND).header("Location", "/api/invoices/admin").build();
        }

        User user = userService.findByName(username);
        if (user == null || user.getResidentId() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không tìm thấy thông tin người dùng");
        }

        Resident resident;
        try {
            resident = residentService.findById(user.getResidentId());
            if (resident == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không tìm thấy thông tin cư dân");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không tìm thấy thông tin cư dân");
        }

        List<Apartment> apartments = apartmentService.findByResidentIdsContaining(resident.getId());
        if (apartments == null || apartments.isEmpty()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không tìm thấy thông tin căn hộ");
        }

        Apartment selectedApartment = null;
        if (apartmentNumber != null && !apartmentNumber.isEmpty()) {
            for (Apartment apt : apartments) {
                if (apt.getApartmentNumber().equals(apartmentNumber)) {
                    selectedApartment = apt;
                    break;
                }
            }
        }

        if (selectedApartment == null) {
            selectedApartment = apartments.get(0);
        }

        List<InvoiceDTO> invoices = invoiceService.getInvoicesByApartment(selectedApartment.getApartmentNumber());

        Map<String, Object> response = new HashMap<>();
        response.put("invoices", invoices);
        response.put("apartment", selectedApartment);
        response.put("allApartments", apartments);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin/form-data")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> getAdminFormData() {
        List<Apartment> apartments = apartmentService.getAllApartments();

        Map<String, Object> response = new HashMap<>();
        response.put("apartments", apartments);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/bills/{apartmentNumber}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> getUnpaidBills(@PathVariable String apartmentNumber) {
        Apartment apartment = apartmentService.findByApartmentNumber(apartmentNumber);
        if (apartment == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy thông tin căn hộ");
        }

        List<Bill> unpaidBills = billService.findByApartmentNumberAndStatus(apartmentNumber, BillStatus.UNPAID);

        Map<String, Object> response = new HashMap<>();
        response.put("apartment", apartment);
        response.put("bills", unpaidBills);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/create")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @ResponseBody
    public ResponseEntity<?> createInvoice(@RequestBody List<Long> billIds, @RequestParam String apartmentNumber) {
        try {
            Invoice invoice = invoiceService.createInvoice(apartmentNumber, billIds);
            return ResponseEntity.ok(invoice.getId());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/create-all-unpaid")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @ResponseBody
    public ResponseEntity<?> createInvoiceFromAllUnpaid(@RequestParam String apartmentNumber) {
        try {
            List<Bill> unpaidBills = billService.findByApartmentNumberAndStatus(apartmentNumber, BillStatus.UNPAID);
            List<Long> billIds = unpaidBills.stream().map(Bill::getId).collect(Collectors.toList());

            if (billIds.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Không có hóa đơn chưa thanh toán");
            }

            Invoice invoice = invoiceService.createInvoice(apartmentNumber, billIds);
            return ResponseEntity.ok(invoice.getId());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getInvoice(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

            InvoiceDTO invoice = invoiceService.getInvoiceById(id);

            if (!isAdmin) {
                User user = userService.findByName(username);
                if (user == null || user.getResidentId() == null) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không tìm thấy thông tin người dùng");
                }

                Resident resident;
                try {
                    resident = residentService.findById(user.getResidentId());
                    if (resident == null) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không tìm thấy thông tin cư dân");
                    }
                } catch (Exception e) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không tìm thấy thông tin cư dân");
                }

                List<Apartment> userApartments = apartmentService.findByResidentIdsContaining(resident.getId());
                boolean hasAccess = userApartments.stream()
                    .anyMatch(apt -> apt.getApartmentNumber().equals(invoice.getApartmentNumber()));

                if (!hasAccess) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Bạn không có quyền xem hóa đơn này");
                }
            }

            return ResponseEntity.ok(invoice);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable Long id) {
        try {
            Invoice invoice = invoiceService.getInvoiceEntityById(id);
            ByteArrayOutputStream document = invoiceService.generateInvoiceDocument(id);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document"));
            headers.setContentDispositionFormData("attachment", "invoice-" + invoice.getInvoiceNumber() + ".docx");
            headers.setContentLength(document.size());

            return new ResponseEntity<>(document.toByteArray(), headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}/downloadPdf")
    public ResponseEntity<byte[]> downloadInvoicePdf(@PathVariable Long id) {
        try {
            Invoice invoice = invoiceService.getInvoiceEntityById(id);
            ByteArrayOutputStream document = invoiceService.generateInvoicePdf(id);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "invoice-" + invoice.getInvoiceNumber() + ".pdf");
            headers.setContentLength(document.size());

            return new ResponseEntity<>(document.toByteArray(), headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}/viewPdf")
    public ResponseEntity<byte[]> viewInvoicePdf(@PathVariable Long id) {
        try {
            Invoice invoice = invoiceService.getInvoiceEntityById(id);
            ByteArrayOutputStream document = invoiceService.generateInvoicePdf(id);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.set(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=invoice-" + invoice.getInvoiceNumber() + ".pdf");
            headers.setContentLength(document.size());

            return new ResponseEntity<>(document.toByteArray(), headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/{id}/confirm-payment")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @ResponseBody
    public ResponseEntity<?> confirmPayment(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();

            InvoiceDTO invoice = invoiceService.confirmPayment(id, username, true);
            return ResponseEntity.ok(invoice);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/user/form-data")
    public ResponseEntity<?> getUserInvoiceFormData(@RequestParam(required = false) String apartmentNumber) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        User user = userService.findByName(username);
        if (user == null || user.getResidentId() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không tìm thấy thông tin người dùng");
        }

        Resident resident;
        try {
            resident = residentService.findById(user.getResidentId());
            if (resident == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không tìm thấy thông tin cư dân");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không tìm thấy thông tin cư dân");
        }

        List<Apartment> apartments = apartmentService.findByResidentIdsContaining(resident.getId());
        if (apartments == null || apartments.isEmpty()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không tìm thấy thông tin căn hộ");
        }

        Apartment selectedApartment = null;
        if (apartmentNumber != null && !apartmentNumber.isEmpty()) {
            for (Apartment apt : apartments) {
                if (apt.getApartmentNumber().equals(apartmentNumber)) {
                    selectedApartment = apt;
                    break;
                }
            }
        }

        if (selectedApartment == null) {
            selectedApartment = apartments.get(0);
        }

        List<Bill> unpaidBills = billService.findByApartmentNumberAndStatus(selectedApartment.getApartmentNumber(), BillStatus.UNPAID);

        Map<String, Object> response = new HashMap<>();
        response.put("apartment", selectedApartment);
        response.put("allApartments", apartments);
        response.put("bills", unpaidBills);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/user/create")
    @ResponseBody
    public ResponseEntity<?> userCreateInvoice(@RequestBody List<Long> billIds, @RequestParam(required = false) String apartmentNumber) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();

            User user = userService.findByName(username);
            if (user == null || user.getResidentId() == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không tìm thấy thông tin người dùng");
            }

            Resident resident;
            try {
                resident = residentService.findById(user.getResidentId());
                if (resident == null) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không tìm thấy thông tin cư dân");
                }
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không tìm thấy thông tin cư dân");
            }

            List<Apartment> apartments = apartmentService.findByResidentIdsContaining(resident.getId());
            if (apartments == null || apartments.isEmpty()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không tìm thấy thông tin căn hộ");
            }

            Apartment selectedApartment = null;
            if (apartmentNumber != null && !apartmentNumber.isEmpty()) {
                for (Apartment apt : apartments) {
                    if (apt.getApartmentNumber().equals(apartmentNumber)) {
                        selectedApartment = apt;
                        break;
                    }
                }
            }

            if (selectedApartment == null) {
                selectedApartment = apartments.get(0);
            }

            // Kiểm tra xem tất cả các bill có thuộc về căn hộ đã chọn không
            List<Bill> bills = billService.findAllById(billIds);
            for (Bill bill : bills) {
                if (!bill.getApartmentNumber().equals(selectedApartment.getApartmentNumber())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body("Không được phép tạo hóa đơn với các bill không thuộc về căn hộ của bạn");
                }
            }

            String payerName = resident.getFullName();
            Invoice invoice = invoiceService.createInvoice(selectedApartment.getApartmentNumber(), billIds, payerName);

            return ResponseEntity.ok(invoice.getId());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
} 
