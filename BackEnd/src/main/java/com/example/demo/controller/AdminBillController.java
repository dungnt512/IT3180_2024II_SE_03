package com.example.demo.controller;

import com.example.demo.dto.BillDTO;
import com.example.demo.entity.Bill;
import com.example.demo.service.BillService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/bills")  // API RESTful
@CrossOrigin
public class AdminBillController {

    @Autowired
    private BillService billService;

    // Lấy danh sách tất cả hóa đơn
    @GetMapping
    public ResponseEntity<List<Bill>> getAllBills() {
        List<Bill> bills = billService.getAllBills();
        return ResponseEntity.ok(bills);
    }

    // Thêm hóa đơn mới
    @PostMapping
    public ResponseEntity<String> addBill(@Valid @RequestBody BillDTO billDTO) {
    	
        billService.saveBill(billDTO);
        return ResponseEntity.ok("Bill added successfully");
    }

    // Lấy chi tiết một hóa đơn theo ID
    @GetMapping("/{id}")
    public ResponseEntity<Bill> getBill(@PathVariable Long id) {
        Bill bill = billService.getBillById(id);
        return bill != null ? ResponseEntity.ok(bill) : ResponseEntity.notFound().build();
    }

    // Chỉnh sửa hóa đơn
    @PutMapping("/edit/{id}")
    public ResponseEntity<String> editBill(@PathVariable Long id, @Valid @RequestBody BillDTO billDTO) {
        Bill bill = billService.getBillById(id);
        if (bill == null) {
            return ResponseEntity.notFound().build();
        }
        bill.setApartmentNumber(billDTO.getApartmentNumber());
        bill.setBillType(billDTO.getBillType());
        bill.setDescription(billDTO.getDescription());
        bill.setAmount(billDTO.getAmount());
        bill.setDueDate(billDTO.getDueDate());

        billService.updateBill(bill);
        return ResponseEntity.ok("Bill updated successfully");
    }

    // Xóa hóa đơn
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBill(@PathVariable Long id) {
        billService.deleteBill(id);
        return ResponseEntity.noContent().build();
    }
}
