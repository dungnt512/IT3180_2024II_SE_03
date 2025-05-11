package com.example.demo.controller;
import com.example.demo.entity.Complaint;
import com.example.demo.entity.Resident;
import com.example.demo.entity.User;
import com.example.demo.enums.ComplaintStatus;
import com.example.demo.service.ComplaintService;
import com.example.demo.service.ResidentService;
import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "*") // Cho phép ReactJS frontend truy cập API này
public class ComplaintController {

    @Autowired
    private ComplaintService complaintService;
    @Autowired
    private ResidentService residentService;
    @Autowired
    private UserService userService;

    // Gửi complaint (resident)
    @PostMapping("/send")
    public String submitComplaint(@RequestBody Complaint complaint, Principal principal) {
        try {
            String username = principal.getName();
            User user = userService.findByName(username);
            Resident resident = residentService.findById(user.getResidentId());

            complaint.setResident(resident);
            complaint.setCreatedAt(LocalDateTime.now());

            complaintService.createComplaint(complaint);
            return "success";
        } catch (Exception e) {
            return "error: " + e.getMessage();
        }
    }
    // Xem complaints của resident hiện tại
    @GetMapping("/my")
    public List<Complaint> getMyComplaints(Principal principal) {
        String username = principal.getName();
        User user = userService.findByName(username);
        Resident resident = residentService.findById(user.getResidentId());

        return complaintService.getResidentComplaints(resident);
    }

    // Xem tất cả complaints (admin)
    @GetMapping("/all")
    public List<Complaint> getAllComplaints() {
        List<Complaint> complaints = complaintService.getAllComplaints();
        complaints.sort(Comparator.comparing(c -> {
            switch (c.getStatus()) {
                case PENDING: return 0;
                case IN_PROGRESS: return 1;
                case RESOLVED: return 2;
                case REJECTED: return 3;
                default: return 4;
            }
        }));
        return complaints;
    }

    // Cập nhật trạng thái (admin)
    @PutMapping("/update-status")
    public void updateComplaintStatus(@RequestParam Long id, @RequestParam ComplaintStatus status) {
        complaintService.updateStatus(id, status);
    }
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteComplaint(@PathVariable Long id) {
        try {
            complaintService.deleteComplaintById(id);
            return ResponseEntity.ok("Complaint deleted successfully.");
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
