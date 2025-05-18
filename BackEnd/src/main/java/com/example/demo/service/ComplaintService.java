package com.example.demo.service;

import com.example.demo.dto.BillDTO;
import com.example.demo.entity.Apartment;
import com.example.demo.entity.Complaint;
import com.example.demo.entity.Resident;
import com.example.demo.entity.User;
import com.example.demo.enums.ComplaintStatus;
import com.example.demo.repository.ComplaintRepository;
import com.example.demo.repository.ResidentRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class ComplaintService {

    @Autowired
    private  ComplaintRepository complaintRepository;
    @Autowired
    private UserRepository userRepository;

    @Autowired
    public ComplaintService(ComplaintRepository complaintRepository) {
        this.complaintRepository = complaintRepository;
    }

    @Autowired
    private ResidentRepository residentRepository;
    @Autowired
    private NotificationService notificationService;

    public void createComplaint(Complaint complaint) {
        complaintRepository.save(complaint);
        sendComplaintNotification(complaint);
    }

    public List<Complaint> getResidentComplaints(Resident resident) {
        return complaintRepository.findByResident_IdOrderByCreatedAtDesc(resident.getId());
    }

    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Complaint> getPendingComplaints() {
        return complaintRepository.findByStatusNotOrderByCreatedAtDesc(ComplaintStatus.RESOLVED);
    }

    public Complaint updateComplaintStatus(Long complaintId, ComplaintStatus status) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        complaint.setStatus(status);
        return complaintRepository.save(complaint);
    }

    private void sendComplaintNotification(Complaint complaint) {

        Resident complainant = complaint.getResident();

        // Tạo nội dung thông báo
        String notificationMessage = String.format(
                "Có khiếu nại mới từ %s [phòng số %s]: %s",
                complainant.getFullName(),
                complainant.getApartmentNumbers(),
                complaint.getTitle()
        );

        List<User> adminAccounts = userRepository.findByRole("ADMIN");
        List<Long> adminResidentIds = adminAccounts.stream()
                .map(User::getResidentId)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        List<Resident> admins = residentRepository.findAllById(adminResidentIds);

        for (Resident admin : admins) {
            notificationService.createNotification(
                    admin.getId(),
                    notificationMessage,
                    "Complaint: " + complaint.getTitle(),
                    "/admin/complaints/"
            );
        }
    }

    public void updateStatus(Long id, ComplaintStatus status) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khiếu nại với ID: " + id));
        complaint.setStatus(status);
        complaintRepository.save(complaint);
        Resident complainant = complaint.getResident();

        String notificationMessage = String.format(
                "Khiếu nại của bạn %s ",
                status.getDisplayName()
        );

        notificationService.createNotification(
                complainant.getId(),
                notificationMessage,
                "Complaint: " + complaint.getTitle(),
                "/users/my-complaints/"
        );
    }
    public void deleteComplaintById(Long id) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint with ID " + id + " not found."));

        if (complaint.getStatus() != ComplaintStatus.PENDING) {
            throw new IllegalStateException("Cannot delete a complaint that is currently IN_PROGRESS.");
        }

        complaintRepository.deleteById(id);
    }
}