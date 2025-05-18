package com.example.demo.service;

import com.example.demo.dto.ContributionDTO;
import com.example.demo.entity.Apartment;
import com.example.demo.entity.Bill;
import com.example.demo.entity.Contribution;
import com.example.demo.entity.ContributionType;
import com.example.demo.entity.Invoice;
import com.example.demo.entity.Resident;
import com.example.demo.entity.ResidentContribution;
import com.example.demo.entity.User;
import com.example.demo.enums.BillStatus;
import com.example.demo.enums.BillType;
import com.example.demo.enums.ContributionStatus;
import com.example.demo.enums.InvoiceStatus;
import com.example.demo.enums.PaymentStatus;
import com.example.demo.repository.ApartmentRepository;
import com.example.demo.repository.BillRepository;
import com.example.demo.repository.ContributionRepository;
import com.example.demo.repository.ContributionTypeRepository;
import com.example.demo.repository.InvoiceRepository;
import com.example.demo.repository.ResidentRepository;
import com.example.demo.repository.ResidentContributionRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ContributionService {

    @Autowired
    private ContributionRepository contributionRepository;

    @Autowired
    private ContributionTypeRepository contributionTypeRepository;

    @Autowired
    private ResidentContributionRepository residentContributionRepository;

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private ResidentRepository residentRepository;

    @Autowired
    private ApartmentRepository apartmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private SepayQrService sepayQrService;

    public List<ContributionDTO> getAllContributions() {
        List<Contribution> contributions = contributionRepository.findAll();
        return contributions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ContributionDTO> getActiveContributions() {
        updateExpiredContributions();
        
        List<Contribution> contributions = contributionRepository.findByStatus(ContributionStatus.ACTIVE);
        return contributions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ContributionDTO> getClosedContributions() {
        List<Contribution> contributions = contributionRepository.findByStatusIn(Arrays.asList(ContributionStatus.CLOSED, ContributionStatus.CANCELED));
        return contributions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateExpiredContributions() {
        LocalDate today = LocalDate.now();
        List<Contribution> activeContributions = contributionRepository.findByStatus(ContributionStatus.ACTIVE);
        
        for (Contribution contribution : activeContributions) {
            if (contribution.getEndDate().isBefore(today)) {
                contribution.setStatus(ContributionStatus.CLOSED);
                contributionRepository.save(contribution);
            }
        }
    }

    public List<ContributionDTO> getContributionsByType(Long typeId) {
        List<Contribution> contributions = contributionRepository.findByContributionTypeId(typeId);
        return contributions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ContributionDTO> getContributionsByApartment(String apartmentNumber) {
        List<ResidentContribution> residentContributions = residentContributionRepository.findByApartmentNumber(apartmentNumber);
        
        List<Long> contributionIds = residentContributions.stream()
                .map(ResidentContribution::getContributionId)
                .distinct()
                .collect(Collectors.toList());
        
        List<Contribution> contributions = contributionRepository.findAllById(contributionIds);
        
        return contributions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ContributionDTO> getContributionsByResident(Long residentId) {
        List<ResidentContribution> residentContributions = residentContributionRepository.findByResidentId(residentId);
        
        List<Long> contributionIds = residentContributions.stream()
                .map(ResidentContribution::getContributionId)
                .distinct()
                .collect(Collectors.toList());
        
        List<Contribution> contributions = contributionRepository.findAllById(contributionIds);
        
        return contributions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ContributionDTO getContributionById(Long id) {
        Contribution contribution = contributionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khoản đóng góp"));
        return convertToDTO(contribution);
    }

    @Transactional
    public Contribution createContribution(ContributionDTO dto, Long currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người dùng"));

        ContributionType type = contributionTypeRepository.findById(dto.getContributionTypeId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy loại đóng góp"));

        if (!type.getIsActive()) {
            throw new RuntimeException("Loại đóng góp không còn hoạt động");
        }

        Contribution contribution = new Contribution();
        contribution.setContributionTypeId(dto.getContributionTypeId());
        contribution.setTitle(dto.getTitle());
        contribution.setDescription(dto.getDescription());
        contribution.setStartDate(dto.getStartDate());
        contribution.setEndDate(dto.getEndDate());
        contribution.setTargetAmount(dto.getTargetAmount());
        contribution.setCreatedBy(currentUserId);
        contribution.setStatus(ContributionStatus.ACTIVE);
        contribution.setIsNotified(false);

        return contributionRepository.save(contribution);
    }

    @Transactional
    public ContributionDTO updateContribution(Long id, ContributionDTO dto) {
        Contribution contribution = contributionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khoản đóng góp"));

        contribution.setTitle(dto.getTitle());
        contribution.setDescription(dto.getDescription());
        contribution.setStartDate(dto.getStartDate());
        contribution.setEndDate(dto.getEndDate());
        contribution.setStatus(dto.getStatus());

        Contribution savedContribution = contributionRepository.save(contribution);
        return convertToDTO(savedContribution);
    }
    public Contribution updateContribution(Long id, Contribution contribution) {
        contribution.setId(id);
        return contributionRepository.save(contribution);
    }
    @Transactional
    public void closeContribution(Long id) {
        Contribution contribution = contributionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khoản đóng góp"));

        contribution.setStatus(ContributionStatus.CLOSED);
        contributionRepository.save(contribution);
    }

    @Transactional
    public void cancelContribution(Long id) {
        Contribution contribution = contributionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khoản đóng góp"));

        contribution.setStatus(ContributionStatus.CANCELED);
        contributionRepository.save(contribution);
    }

    @Transactional
    public void reactivateContribution(Long id) {
        Contribution contribution = contributionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khoản đóng góp"));
                
        if (contribution.getStatus() == ContributionStatus.CANCELED) {
            throw new RuntimeException("Không thể mở lại khoản đóng góp đã hủy");
        }

        if (contribution.getEndDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Không thể mở lại khoản đóng góp đã hết hạn. Vui lòng cập nhật ngày kết thúc trước.");
        }

        contribution.setStatus(ContributionStatus.ACTIVE);
        contributionRepository.save(contribution);
    }

    @Transactional
    public void sendNotification(Long id) {
        Contribution contribution = contributionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khoản đóng góp"));

        if (contribution.getIsNotified()) {
            throw new RuntimeException("Đã gửi thông báo cho khoản đóng góp này");
        }

        String message = "Có khoản đóng góp mới: " + contribution.getTitle() + 
                ". Thời gian đóng góp từ " + contribution.getStartDate() + 
                " đến " + contribution.getEndDate();
        
        contribution.setIsNotified(true);
        contribution.setNotificationSentAt(LocalDateTime.now());
        contributionRepository.save(contribution);
    }

    @Transactional
    public void createResidentContributionsForAll(Long contributionId, Double amount) {
        Contribution contribution = contributionRepository.findById(contributionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khoản đóng góp"));

        if (contribution.getStatus() != ContributionStatus.ACTIVE) {
            throw new RuntimeException("Chỉ có thể tạo đóng góp cho khoản đóng góp đang mở");
        }

        List<Apartment> apartments = apartmentRepository.findAll();
        
        for (Apartment apartment : apartments) {
            createContributionForApartment(contribution, apartment, amount);
        }
    }
    
    public List<ContributionDTO> filterContributions(Map<String, Object> filterParams) {
        String title = (String) filterParams.get("title");
        Long typeId = (Long) filterParams.get("typeId");
        LocalDate startDate = (LocalDate) filterParams.get("startDate");
        LocalDate endDate = (LocalDate) filterParams.get("endDate");
        Double minAmount = (Double) filterParams.get("minAmount");
        Double maxAmount = (Double) filterParams.get("maxAmount");
        ContributionStatus status = (ContributionStatus) filterParams.get("status");
        String filterLogic = (String) filterParams.get("filterLogic");
        
        List<Contribution> result;
        
        if ("OR".equalsIgnoreCase(filterLogic)) {
            // Xử lý logic OR - cần nhiều truy vấn riêng biệt và gộp kết quả
            List<Contribution> allContributions = contributionRepository.findAll();
            List<Contribution> filteredContributions = new ArrayList<>();
            
            for (Contribution contribution : allContributions) {
                boolean matches = false;
                
                if (title != null && !title.isEmpty() && 
                    (contribution.getTitle() != null && 
                     contribution.getTitle().toLowerCase().contains(title.toLowerCase()))) {
                    matches = true;
                }
                
                if (!matches && typeId != null && 
                    (contribution.getContributionTypeId() != null && 
                     contribution.getContributionTypeId().equals(typeId))) {
                    matches = true;
                }
                
                if (!matches && startDate != null && 
                    (contribution.getStartDate() != null && 
                     !contribution.getStartDate().isBefore(startDate))) {
                    matches = true;
                }
                
                if (!matches && endDate != null && 
                    (contribution.getEndDate() != null && 
                     !contribution.getEndDate().isAfter(endDate))) {
                    matches = true;
                }
                
                if (!matches && minAmount != null) {
                    // Tính tổng số tiền đã đóng góp
                    Double totalAmount = calculateTotalAmount(contribution.getId());
                    if (totalAmount >= minAmount) {
                        matches = true;
                    }
                }
                
                if (!matches && maxAmount != null) {
                    // Tính tổng số tiền đã đóng góp
                    Double totalAmount = calculateTotalAmount(contribution.getId());
                    if (totalAmount <= maxAmount) {
                        matches = true;
                    }
                }
                
                if (!matches && status != null && 
                    contribution.getStatus() == status) {
                    matches = true;
                }
                
                if (matches) {
                    filteredContributions.add(contribution);
                }
            }
            
            result = filteredContributions;
        } else {
            // Xử lý logic AND
            List<Contribution> allContributions = contributionRepository.findAll();
            List<Contribution> filteredContributions = new ArrayList<>(allContributions);
            
            if (title != null && !title.isEmpty()) {
                filteredContributions.removeIf(c -> c.getTitle() == null || 
                                             !c.getTitle().toLowerCase().contains(title.toLowerCase()));
            }
            
            if (typeId != null) {
                filteredContributions.removeIf(c -> c.getContributionTypeId() == null || 
                                             !c.getContributionTypeId().equals(typeId));
            }
            
            if (startDate != null) {
                filteredContributions.removeIf(c -> c.getStartDate() == null || 
                                             c.getStartDate().isBefore(startDate));
            }
            
            if (endDate != null) {
                filteredContributions.removeIf(c -> c.getEndDate() == null || 
                                             c.getEndDate().isAfter(endDate));
            }
            
            if (minAmount != null) {
                filteredContributions.removeIf(c -> calculateTotalAmount(c.getId()) < minAmount);
            }
            
            if (maxAmount != null) {
                filteredContributions.removeIf(c -> calculateTotalAmount(c.getId()) > maxAmount);
            }
            
            if (status != null) {
                filteredContributions.removeIf(c -> c.getStatus() != status);
            }
            
            result = filteredContributions;
        }
        
        return result.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    private Double calculateTotalAmount(Long contributionId) {
        List<ResidentContribution> contributions = residentContributionRepository.findByContributionId(contributionId);
        return contributions.stream()
                .filter(rc -> rc.getPaymentStatus() == PaymentStatus.PAID)
                .mapToDouble(ResidentContribution::getAmount)
                .sum();
    }

    private void createContributionForApartment(Contribution contribution, Apartment apartment, Double amount) {
        List<Resident> residents = residentRepository.findByApartmentNumber(apartment.getApartmentNumber());
        if (residents.isEmpty()) {
            return; 
        }
        
        Resident resident = residents.get(0);
        
        ResidentContribution residentContribution = new ResidentContribution();
        residentContribution.setContributionId(contribution.getId());
        residentContribution.setResidentId(resident.getId());
        residentContribution.setApartmentNumber(apartment.getApartmentNumber());
        residentContribution.setAmount(amount.longValue());
        residentContribution.setNote("Khoản đóng góp: " + contribution.getTitle());
        residentContribution.setPaymentStatus(PaymentStatus.UNPAID);
        residentContribution.setCreatedAt(LocalDateTime.now());
        
        ResidentContribution savedContribution = residentContributionRepository.save(residentContribution);
        
        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber("INV-" + UUID.randomUUID().toString().substring(0, 8));
        invoice.setApartmentNumber(apartment.getApartmentNumber());
        invoice.setResidentName(resident.getFullName());
        invoice.setTotalAmount(amount.longValue());
        invoice.setDescription("Đóng góp: " + contribution.getTitle());
        invoice.setStatus(InvoiceStatus.UNPAID);
        invoice.setCreatedAt(LocalDateTime.now());
        invoice.setDueDate(LocalDate.now().plusDays(30));
        invoice.setBillIds(new ArrayList<>()); 
        
        Invoice savedInvoice = invoiceRepository.save(invoice);
        
        String qrCodeUrl = sepayQrService.generateQrCodeUrl(savedInvoice, false);
        savedInvoice.setQrCodeUrl(qrCodeUrl);
        invoiceRepository.save(savedInvoice);
        
        savedContribution.setInvoiceId(savedInvoice.getId());
        savedContribution.setQrCode(qrCodeUrl);
        residentContributionRepository.save(savedContribution);
        
        notificationService.createNotification(
            resident.getId(), 
            "Khoản đóng góp mới: " + contribution.getTitle() + 
            " với số tiền " + amount + " VNĐ đã được tạo cho căn hộ của bạn.",
                "Contribution: " + contribution.getTitle(),
                "/users/" + contribution.getId() + "/contribute"
        );
    }

    private ContributionDTO convertToDTO(Contribution contribution) {
        ContributionDTO dto = new ContributionDTO();
        dto.setId(contribution.getId());
        dto.setContributionTypeId(contribution.getContributionTypeId());
        dto.setTitle(contribution.getTitle());
        dto.setDescription(contribution.getDescription());
        dto.setStartDate(contribution.getStartDate());
        dto.setEndDate(contribution.getEndDate());
        dto.setTargetAmount(contribution.getTargetAmount());
        dto.setCreatedAt(contribution.getCreatedAt());
        dto.setCreatedBy(contribution.getCreatedBy());
        dto.setStatus(contribution.getStatus());
        dto.setIsNotified(contribution.getIsNotified());
        dto.setNotificationSentAt(contribution.getNotificationSentAt());

        contributionTypeRepository.findById(contribution.getContributionTypeId())
                .ifPresent(type -> dto.setContributionTypeName(type.getName()));

        if (contribution.getCreatedBy() != null) {
            userRepository.findById(contribution.getCreatedBy())
                    .ifPresent(user -> dto.setCreatedByName(user.getName()));
        }

        List<ResidentContribution> residentContributions = residentContributionRepository.findByContributionId(contribution.getId());
        dto.setTotalContributions((long) residentContributions.size());
        dto.setTotalAmount(residentContributions.stream()
                .mapToDouble(ResidentContribution::getAmount)
                .sum());
        
        dto.setTotalPaidAmount(residentContributions.stream()
                .filter(rc -> rc.getPaymentStatus() == PaymentStatus.PAID)
                .mapToDouble(ResidentContribution::getAmount)
                .sum());

        return dto;
    }

    private boolean userHasAdminRole(User user) {
        return "ROLE_ADMIN".equals(user.getRole());
    }
} 