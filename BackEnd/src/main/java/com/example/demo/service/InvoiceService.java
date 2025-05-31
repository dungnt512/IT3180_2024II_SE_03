package com.example.demo.service;

import com.example.demo.dto.InvoiceDTO;
import com.example.demo.entity.Apartment;
import com.example.demo.entity.Bill;
import com.example.demo.entity.Invoice;
import com.example.demo.entity.Resident;
import com.example.demo.entity.User;
import com.example.demo.entity.ResidentContribution;
import com.example.demo.enums.BillStatus;
import com.example.demo.enums.InvoiceStatus;
import com.example.demo.enums.PaymentStatus;
import com.example.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.time.LocalDate;
import java.util.Objects;
import java.util.HashSet;
import java.util.Map;
import java.util.function.Predicate;

@Service
public class InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepository;
    
    @Autowired
    private BillRepository billRepository;
    
    @Autowired
    private ApartmentRepository apartmentRepository;
    
    @Autowired
    private ResidentRepository residentRepository;
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private SepayQrService sepayQrService;
    
    @Autowired
    private WordDocumentService wordDocumentService;
    
    @Autowired
    private PdfDocumentService pdfDocumentService;
    
    @Autowired
    private ResidentContributionRepository residentContributionRepository;
    
    private static final DateTimeFormatter INVOICE_NUMBER_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss");

    public List<Invoice> findAll() {
        return invoiceRepository.findAll();
    }
    public Optional<Invoice> findById(Long id) {
        return invoiceRepository.findById(id);
    }
    public Invoice save(Invoice invoice) {
        return invoiceRepository.save(invoice);
    }
    public void deleteById(Long id) {
        invoiceRepository.deleteById(id);
    }

    @Transactional
    public Invoice createInvoice(String apartmentNumber, List<Long> billIds) {
        return createInvoice(apartmentNumber, billIds, null);
    }

    @Transactional
    public Invoice createInvoice(String apartmentNumber, List<Long> billIds, String createdByUsername) {
        List<Bill> bills = billRepository.findAllById(billIds);
        
        if (bills.isEmpty()) {
            throw new RuntimeException("Không tìm thấy hóa đơn nào");
        }
        
        Apartment apartment = apartmentRepository.findByApartmentNumber(apartmentNumber);
        if (apartment == null) {
            throw new RuntimeException("Không tìm thấy căn hộ: " + apartmentNumber);
        }
        
        String residentName;
        if (createdByUsername != null) {
            residentName = createdByUsername;
        } else {
            List<Resident> residents = residentRepository.findAllById(apartment.getResidentIds());
            residentName = residents.isEmpty() ? "Chủ căn hộ" : residents.get(0).getFullName();
        }
        
        List<Bill> unpaidBills = bills.stream()
                .filter(bill -> !bill.isPaid())
                .collect(Collectors.toList());
        // filter invoice_id = null
        unpaidBills = unpaidBills.stream()
                .filter(bill -> bill.getInvoiceId() == null)
                .collect(Collectors.toList());
                
        if (unpaidBills.size() != bills.size()) {
            throw new RuntimeException("Có " + (bills.size() - unpaidBills.size()) + 
                                      " hóa đơn đã được thanh toán trước đó hoặc đang nằm trong một hóa đơn tổng hợp");
        }

        // set invoice_id for bills


        Long totalAmount = (long)(bills.stream()
                .mapToDouble(Bill::getAmount)
                .sum());
        
        LocalDate earliestDueDate = bills.stream()
                .map(Bill::getDueDate)
                .filter(Objects::nonNull)
                .min(LocalDate::compareTo)
                .orElse(null);
        
        Invoice invoice = new Invoice();

        invoice.setInvoiceNumber(generateInvoiceNumber(apartmentNumber));
        invoice.setApartmentNumber(apartmentNumber);
        invoice.setResidentName(residentName);
        invoice.setCreatedAt(LocalDateTime.now());
        invoice.setTotalAmount(totalAmount);
        invoice.setStatus(InvoiceStatus.UNPAID);
        invoice.setBillIds(billIds);
        invoice.setDueDate(earliestDueDate);



        System.err.println(invoice.getId());
        invoice = invoiceRepository.save(invoice);
        System.err.println(invoice.getId());
        for (Bill bill : bills) {
            bill.setInvoiceId(invoice.getId());
            billRepository.save(bill);
        }
        invoice.setDescription("Hóa đơn " + apartmentNumber + " " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));
        invoice.setPaymentReferenceCode(sepayQrService.generateInvoiceReferenceCode(invoice));
        invoice.setQrCodeUrl(sepayQrService.generateQrCodeUrl(invoice, false));
//        invoice = invoiceRepository.save(invoice);
        sendInvoiceNotification(invoice, new ArrayList<>(apartment.getResidentIds()));
        
        return invoice;
    }

    public void regenerateAllQrCode() {
        List<Invoice> invoices = invoiceRepository.findAll();
        for (Invoice invoice : invoices) {
            String qrCodeUrl = sepayQrService.generateQrCodeUrl(invoice, false);
            invoice.setQrCodeUrl(qrCodeUrl);
            invoiceRepository.save(invoice);
        }
    }
    
    public ByteArrayOutputStream generateInvoiceDocument(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn"));
        
        List<Long> billIds = invoice.getBillIds();
        List<Bill> bills = new ArrayList<>();
        if (billIds != null && !billIds.isEmpty()) {
            Set<Long> billIdSet = new HashSet<>(billIds);
            Set<Bill> billSet = billRepository.findByIdIn(billIdSet);
            bills = new ArrayList<>(billSet);
        }
        
        return wordDocumentService.createInvoiceDocument(invoice, bills);
    }
    
    public ByteArrayOutputStream generateInvoicePdf(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn"));
        
        List<Long> billIds = invoice.getBillIds();
        List<Bill> bills = new ArrayList<>();
        if (billIds != null && !billIds.isEmpty()) {
            Set<Long> billIdSet = new HashSet<>(billIds);
            Set<Bill> billSet = billRepository.findByIdIn(billIdSet);
            bills = new ArrayList<>(billSet);
        }
        
        return pdfDocumentService.createInvoicePdfDirectly(invoice, bills);
    }
    
    public ByteArrayOutputStream generateInvoicePdfFromWord(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn"));
        
        List<Long> billIds = invoice.getBillIds();
        List<Bill> bills = new ArrayList<>();
        if (billIds != null && !billIds.isEmpty()) {
            Set<Long> billIdSet = new HashSet<>(billIds);
            Set<Bill> billSet = billRepository.findByIdIn(billIdSet);
            bills = new ArrayList<>(billSet);
        }
        
        return pdfDocumentService.createPdfFromWord(invoice, bills);
    }
    
    public InvoiceDTO checkPaymentStatus(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn"));
        
        List<Long> billIds = invoice.getBillIds();
        List<Bill> bills = new ArrayList<>();
        if (billIds != null && !billIds.isEmpty()) {
            Set<Long> billIdSet = new HashSet<>(billIds);
            Set<Bill> billSet = billRepository.findByIdIn(billIdSet);
            bills = new ArrayList<>(billSet);
        }
        
        return convertToDTO(invoice, bills);
    }
    
    @Transactional
    public InvoiceDTO confirmPayment(Long invoiceId, String username, boolean isAdmin) {
        if (!isAdmin) {
            throw new RuntimeException("Chỉ admin mới có quyền xác nhận thanh toán");
        }
        
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn"));
        
        if (invoice.isPaid()) {
            throw new RuntimeException("Hóa đơn đã được thanh toán trước đó");
        }
        
        List<Long> billIds = invoice.getBillIds();
        List<Bill> bills = new ArrayList<>();
        if (billIds != null && !billIds.isEmpty()) {
            Set<Long> billIdSet = new HashSet<>(billIds);
            Set<Bill> billSet = billRepository.findByIdIn(billIdSet);
            bills = new ArrayList<>(billSet);
        }
        
        invoice.setStatus(InvoiceStatus.PAID);
        invoice.setLastCheckTime(LocalDateTime.now());
        invoice = invoiceRepository.save(invoice);
        
        for (Bill bill : bills) {
            bill.setStatus(BillStatus.PAID);
            bill.setLastCheckTime(LocalDateTime.now());
        }
        billRepository.saveAll(bills);
        
        residentContributionRepository.findByInvoiceId(invoiceId).ifPresent(contribution -> {
            contribution.setPaymentStatus(PaymentStatus.PAID);
            contribution.setPaidAt(LocalDateTime.now());
            residentContributionRepository.save(contribution);
        });
        
        System.out.println("Admin " + username + " đã xác nhận thanh toán cho hóa đơn ID: " + invoiceId);
        
        Apartment apartment = apartmentRepository.findByApartmentNumber(invoice.getApartmentNumber());
        if (apartment != null) {
            sendPaymentConfirmation(invoice, new ArrayList<>(apartment.getResidentIds()));
        }
        
        return convertToDTO(invoice, bills);
    }
    
    @Transactional
    public boolean processPaymentWebhook(String referenceCode, Double amount, String transactionId) {
        Optional<Invoice> optInvoice = invoiceRepository.findByPaymentReferenceCode(referenceCode);
        
        if (optInvoice.isPresent()) {
            Invoice invoice = optInvoice.get();
            
            if (invoice.isPaid()) {
                return true;
            }
            
            if (Math.abs(invoice.getTotalAmount() - amount) < 0.01) {
                invoice.setStatus(InvoiceStatus.PAID);
                invoice.setLastCheckTime(LocalDateTime.now());
                invoiceRepository.save(invoice);
                
                List<Long> billIds = invoice.getBillIds();
                List<Bill> bills = new ArrayList<>();
                if (billIds != null && !billIds.isEmpty()) {
                    Set<Long> billIdSet = new HashSet<>(billIds);
                    Set<Bill> billSet = billRepository.findByIdIn(billIdSet);
                    bills = new ArrayList<>(billSet);
                }
                
                for (Bill bill : bills) {
                    bill.setStatus(BillStatus.PAID);
                    bill.setLastCheckTime(LocalDateTime.now());
                }
                billRepository.saveAll(bills);
                
                residentContributionRepository.findByInvoiceId(invoice.getId()).ifPresent(contribution -> {
                    contribution.setPaymentStatus(PaymentStatus.PAID);
                    contribution.setPaidAt(LocalDateTime.now());
                    contribution.setTransactionId(transactionId);
                    residentContributionRepository.save(contribution);
                });
                
                Apartment apartment = apartmentRepository.findByApartmentNumber(invoice.getApartmentNumber());
                if (apartment != null) {
                    sendPaymentConfirmation(invoice, new ArrayList<>(apartment.getResidentIds()));
                }
                
                return true;
            }
        }
        
        return false;
    }
    
    private void sendInvoiceNotification(Invoice invoice, List<Long> residentIds) {
        List<Resident> residents = residentRepository.findAllById(residentIds);
        
        String notificationMessage = String.format(
                "Hóa đơn tổng hợp mới cho căn hộ %s. Số tiền: %,.0f VNĐ. Vui lòng thanh toán.",
                invoice.getApartmentNumber(),
                invoice.getTotalAmount()
        );
        
        for (Resident resident : residents) {
            notificationService.createNotification(resident.getId(), notificationMessage,
                    "Invoice: " + invoice.getInvoiceNumber(),
                    "/invoices/" + invoice.getId());
        }
    }
    
    private void sendPaymentConfirmation(Invoice invoice, List<Long> residentIds) {
        List<Resident> residents = residentRepository.findAllById(residentIds);
        
        String notificationMessage = String.format(
                "Thanh toán thành công! Hóa đơn tổng hợp %s cho căn hộ %s đã được thanh toán. Số tiền: %,.0f VNĐ.",
                invoice.getInvoiceNumber(),
                invoice.getApartmentNumber(),
                invoice.getTotalAmount()
        );

        List<User> admins = userRepository.findByRole("ADMIN");
        for (User admin : admins) {
            notificationService.sendNotificationToUser(admin.getId(), notificationMessage);
        }
        for (Resident resident : residents) {
            notificationService.createNotification(resident.getId(), notificationMessage,
                    "Invoice: " + invoice.getInvoiceNumber(),
                    "/invoices/" + invoice.getId());
        }
    }
    
    private String generateInvoiceNumber(String apartmentNumber) {
        String datePart = LocalDateTime.now().format(INVOICE_NUMBER_FORMAT);
        return "INV-" + apartmentNumber.replace(" ", "") + "-" + datePart;
    }
    
    private InvoiceDTO convertToDTO(Invoice invoice, List<Bill> bills) {
        InvoiceDTO dto = new InvoiceDTO();
        dto.setId(invoice.getId());
        dto.setInvoiceNumber(invoice.getInvoiceNumber());
        dto.setApartmentNumber(invoice.getApartmentNumber());
        dto.setResidentName(invoice.getResidentName());
        dto.setCreatedAt(invoice.getCreatedAt());
        dto.setTotalAmount(invoice.getTotalAmount());
        dto.setDescription(invoice.getDescription());
        dto.setQrCodeUrl(invoice.getQrCodeUrl());
        dto.setPaymentReferenceCode(invoice.getPaymentReferenceCode());
        dto.setStatus(invoice.getStatus());
        dto.setDueDate(invoice.getDueDate());
        dto.setBills(bills != null ? bills : new ArrayList<>());
        return dto;
    }
    
    public List<InvoiceDTO> getInvoicesByApartment(String apartmentNumber) {
        List<Invoice> invoices = invoiceRepository.findByApartmentNumber(apartmentNumber);
        
        return invoices.stream().map(invoice -> {
            List<Long> billIds = invoice.getBillIds();
            List<Bill> bills = new ArrayList<>();
            if (billIds != null && !billIds.isEmpty()) {
                Set<Long> billIdSet = new HashSet<>(billIds);
                Set<Bill> billSet = billRepository.findByIdIn(billIdSet);
                bills = new ArrayList<>(billSet);
                
                // Sắp xếp bills theo thứ tự của billIds
                if (!bills.isEmpty()) {
                    Map<Long, Bill> billMap = bills.stream()
                        .collect(Collectors.toMap(Bill::getId, bill -> bill));
                    
                    List<Bill> orderedBills = new ArrayList<>();
                    for (Long billId : billIds) {
                        Bill bill = billMap.get(billId);
                        if (bill != null) {
                            orderedBills.add(bill);
                        }
                    }
                    bills = orderedBills;
                }
            }
            return convertToDTO(invoice, bills);
        }).collect(Collectors.toList());
    }
    
    public InvoiceDTO getInvoiceById(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn"));
        
        List<Long> billIds = invoice.getBillIds();
        System.out.println("BillIds for invoice " + id + ": " + billIds);
        
        List<Bill> bills = new ArrayList<>();
        if (billIds != null && !billIds.isEmpty()) {
            Set<Long> billIdSet = new HashSet<>(billIds);
            Set<Bill> billSet = billRepository.findByIdIn(billIdSet);
            bills = new ArrayList<>(billSet);
            
            System.out.println("Found " + bills.size() + " bills out of " + billIds.size() + " bill IDs");
            
            if (!bills.isEmpty()) {
                Map<Long, Bill> billMap = bills.stream()
                    .collect(Collectors.toMap(Bill::getId, bill -> bill));
                
                List<Bill> orderedBills = new ArrayList<>();
                for (Long billId : billIds) {
                    Bill bill = billMap.get(billId);
                    if (bill != null) {
                        orderedBills.add(bill);
                    }
                }
                bills = orderedBills;
            }
        }
        
        InvoiceDTO dto = convertToDTO(invoice, bills);
        System.out.println("DTO bills size: " + dto.getBills().size());
        return dto;
    }
    
    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }
    
    public List<Invoice> filterInvoices(Map<String, Object> filterParams) {
        String invoiceNumber = (String) filterParams.get("invoiceNumber");
        String apartmentNumber = (String) filterParams.get("apartmentNumber");
        String residentName = (String) filterParams.get("residentName");
        String description = (String) filterParams.get("description");
        Double minAmount = (Double) filterParams.get("minAmount");
        Double maxAmount = (Double) filterParams.get("maxAmount");
        LocalDate fromDueDate = (LocalDate) filterParams.get("fromDueDate");
        LocalDate toDueDate = (LocalDate) filterParams.get("toDueDate");
        List<InvoiceStatus> statuses = (List<InvoiceStatus>) filterParams.get("status");
        String filterLogic = (String) filterParams.get("filterLogic");
        List<Integer> floors = (List<Integer>) filterParams.get("floors");

        if ("OR".equalsIgnoreCase(filterLogic)) {
            // Xử lý logic OR - cần nhiều truy vấn riêng biệt và gộp kết quả
            Set<Invoice> results = new HashSet<>();
            
            if (invoiceNumber != null && !invoiceNumber.isEmpty()) {
                results.addAll(invoiceRepository.findByInvoiceNumberContainingIgnoreCase(invoiceNumber));
            }
            
            if (apartmentNumber != null && !apartmentNumber.isEmpty()) {
                results.addAll(invoiceRepository.findByApartmentNumberContainingIgnoreCase(apartmentNumber));
            }
            
            if (residentName != null && !residentName.isEmpty()) {
                results.addAll(invoiceRepository.findByResidentNameContainingIgnoreCase(residentName));
            }
            
            if (description != null && !description.isEmpty()) {
                results.addAll(invoiceRepository.findByDescriptionContainingIgnoreCase(description));
            }
            
            if (minAmount != null) {
                results.addAll(invoiceRepository.findByTotalAmountGreaterThanEqual(minAmount));
            }
            
            if (maxAmount != null) {
                results.addAll(invoiceRepository.findByTotalAmountLessThanEqual(maxAmount));
            }
            
            if (fromDueDate != null) {
                results.addAll(invoiceRepository.findByDueDateGreaterThanEqual(fromDueDate));
            }
            
            if (toDueDate != null) {
                results.addAll(invoiceRepository.findByDueDateLessThanEqual(toDueDate));
            }
            
            if (statuses != null && !statuses.isEmpty()) {
                results.addAll(invoiceRepository.findByStatusIn(statuses));
            }
            
            if (floors != null && !floors.isEmpty()) {
                List<String> apartmentNumbersByFloors = apartmentRepository.findByFloorIn(floors).stream()
                    .map(Apartment::getApartmentNumber)
                    .collect(Collectors.toList());
                
                if (!apartmentNumbersByFloors.isEmpty()) {
                    results.addAll(invoiceRepository.findAll().stream()
                        .filter(invoice -> apartmentNumbersByFloors.contains(invoice.getApartmentNumber()))
                        .collect(Collectors.toList()));
                }
            }
            
            return new ArrayList<>(results);
        } else {
            // Xử lý logic AND - sử dụng truy vấn phức tạp với Repository
            List<Invoice> result = invoiceRepository.findByFilters(
                invoiceNumber,
                apartmentNumber,
                residentName,
                description,
                minAmount,
                maxAmount,
                fromDueDate,
                toDueDate
            );
            
            if (statuses != null && !statuses.isEmpty()) {
                result = result.stream()
                    .filter(invoice -> invoice.getStatus() != null && statuses.contains(invoice.getStatus()))
                    .collect(Collectors.toList());
            }
            
            if (floors != null && !floors.isEmpty()) {
                List<String> apartmentNumbersByFloors = apartmentRepository.findByFloorIn(floors).stream()
                    .map(Apartment::getApartmentNumber)
                    .collect(Collectors.toList());
                
                if (!apartmentNumbersByFloors.isEmpty()) {
                    result = result.stream()
                        .filter(invoice -> apartmentNumbersByFloors.contains(invoice.getApartmentNumber()))
                        .collect(Collectors.toList());
                } else {
                    return new ArrayList<>();
                }
            }
            
            return result;
        }
    }
    
    public Invoice getInvoiceEntityById(Long id) {
        return invoiceRepository.findById(id).orElse(null);
    }
    
    public List<InvoiceDTO> getAllInvoiceDTOs() {
        List<Invoice> invoices = getAllInvoices();
        
        return invoices.stream().map(invoice -> {
            List<Long> billIds = invoice.getBillIds();
            List<Bill> bills = new ArrayList<>();
            if (billIds != null && !billIds.isEmpty()) {
                Set<Long> billIdSet = new HashSet<>(billIds);
                Set<Bill> billSet = billRepository.findByIdIn(billIdSet);
                bills = new ArrayList<>(billSet);
                
                if (!bills.isEmpty()) {
                    Map<Long, Bill> billMap = bills.stream()
                        .collect(Collectors.toMap(Bill::getId, bill -> bill));
                    
                    List<Bill> orderedBills = new ArrayList<>();
                    for (Long billId : billIds) {
                        Bill bill = billMap.get(billId);
                        if (bill != null) {
                            orderedBills.add(bill);
                        }
                    }
                    bills = orderedBills;
                }
            }
            return convertToDTO(invoice, bills);
        }).collect(Collectors.toList());
    }
    
    @Scheduled(cron = "0 0 9 * * ?") // Chạy lúc 9 giờ sáng mỗi ngày
    @Transactional
    public void sendInvoicePaymentReminders() {
        LocalDate today = LocalDate.now();
        
        LocalDate reminderDate = today.plusDays(5);
        
        List<Invoice> invoicesWithDueDateApproaching = invoiceRepository.findInvoicesWithDueDateApproaching(reminderDate, InvoiceStatus.UNPAID);
        
        System.out.println("Đang gửi nhắc nhở thanh toán cho " + invoicesWithDueDateApproaching.size() + " hóa đơn tổng hợp có hạn thanh toán vào " + reminderDate);
        
        for (Invoice invoice : invoicesWithDueDateApproaching) {
            Apartment apartment = apartmentRepository.findByApartmentNumber(invoice.getApartmentNumber());
            if (apartment == null || apartment.getResidentIds() == null || apartment.getResidentIds().isEmpty()) {
                continue;
            }
            
            List<Long> residentIds = new ArrayList<>(apartment.getResidentIds());
            if (!residentIds.isEmpty()) {
                String reminderMessage = String.format(
                        "NHẮC NHỞ THANH TOÁN: Hóa đơn tổng hợp %s cho căn hộ %s sắp đến hạn. " +
                        "Số tiền: %,.0f VNĐ. Hạn thanh toán: %s. Vui lòng thanh toán đúng hạn!",
                        invoice.getInvoiceNumber(),
                        invoice.getApartmentNumber(),
                        invoice.getTotalAmount(),
                        invoice.getDueDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                );
                
                sendInvoiceNotification(invoice, residentIds);
                
                for (Long residentId : residentIds) {
                    notificationService.createNotification(
                            residentId,
                            reminderMessage,
                            "Invoice: " + invoice.getInvoiceNumber(),
                            "/invoices/" + invoice.getId()
                    );
                }
                
                System.out.println("Đã gửi nhắc nhở thanh toán cho hóa đơn tổng hợp ID: " + invoice.getId());
            }
        }
    }
} 