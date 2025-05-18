package com.example.demo.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

import com.example.demo.entity.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.BillDTO;
import com.example.demo.enums.BillStatus;
import com.example.demo.enums.BillType;
import com.example.demo.repository.ApartmentRepository;
import com.example.demo.repository.BillRepository;
import com.example.demo.repository.ResidentRepository;

@Service
public class BillService {
    @Autowired
    private BillRepository billRepository;
    @Autowired
    private ApartmentRepository apartmentRepository;
    @Autowired
    private NotificationService notificationService;
    @Autowired
    private ResidentRepository residentRepository;
    @Autowired
    private SepayQrService sepayQrService;
    @Autowired
    private ApartmentFeeUnitService apartmentFeeUnitService;

    public List<Bill> getAllBills() {
        return billRepository.findAll();
    }
    public Bill getBillById(Long id) {
        return billRepository.findById(id).orElse(null);
    }
    public Bill save(Bill bill) { return billRepository.save(bill); }
    public void deleteBillById(Long id) { billRepository.deleteById(id); }

    public List<Bill> filterBills(Map<String, Object> filterParams) {
        String filterLogic = (String) filterParams.getOrDefault("filterLogic", "AND");
        
        String apartmentNumber = (String) filterParams.get("apartmentNumber");
        String description = (String) filterParams.get("description");
        Double minAmount = (Double) filterParams.get("minAmount");
        Double maxAmount = (Double) filterParams.get("maxAmount");
        List<BillType> billTypes = (List<BillType>) filterParams.get("billType");
        LocalDate fromDueDate = (LocalDate) filterParams.get("fromDueDate");
        LocalDate toDueDate = (LocalDate) filterParams.get("toDueDate");
        List<BillStatus> statuses = (List<BillStatus>) filterParams.get("status");
        List<Integer> floors = (List<Integer>) filterParams.get("floors");

        if ("OR".equalsIgnoreCase(filterLogic)) {
            Set<Bill> results = new HashSet<>();
            
            if (apartmentNumber != null && !apartmentNumber.isEmpty()) {
                results.addAll(billRepository.findByApartmentNumberContainingIgnoreCase(apartmentNumber));
            }
            
            if (description != null && !description.isEmpty()) {
                results.addAll(billRepository.findByDescriptionContainingIgnoreCase(description));
            }
            
            if (minAmount != null) {
                results.addAll(billRepository.findByAmountGreaterThanEqual(minAmount));
            }
            
            if (maxAmount != null) {
                results.addAll(billRepository.findByAmountLessThanEqual(maxAmount));
            }
            
            if (billTypes != null && !billTypes.isEmpty()) {
                results.addAll(billRepository.findByBillTypeIn(billTypes));
            }
            
            if (fromDueDate != null) {
                results.addAll(billRepository.findByDueDateGreaterThanEqual(fromDueDate));
            }
            
            if (toDueDate != null) {
                results.addAll(billRepository.findByDueDateLessThanEqual(toDueDate));
            }
            
            if (statuses != null && !statuses.isEmpty()) {
                results.addAll(billRepository.findByStatusIn(statuses));
            }
            
            if (floors != null && !floors.isEmpty()) {
                List<String> apartmentNumbersByFloors = apartmentRepository.findByFloorIn(floors).stream()
                    .map(Apartment::getApartmentNumber)
                    .collect(Collectors.toList());
                
                if (!apartmentNumbersByFloors.isEmpty()) {
                    results.addAll(billRepository.findAll().stream()
                        .filter(bill -> apartmentNumbersByFloors.contains(bill.getApartmentNumber()))
                        .collect(Collectors.toList()));
                }
            }
            
            return new ArrayList<>(results);
        } else {
            Specification<Bill> spec = null;
            
            if (apartmentNumber != null && !apartmentNumber.isEmpty()) {
                Specification<Bill> apartmentNumberSpec = (root, query, cb) ->
                    cb.like(cb.lower(root.get("apartmentNumber")), "%" + apartmentNumber.toLowerCase() + "%");
                spec = spec == null ? apartmentNumberSpec : spec.and(apartmentNumberSpec);
            }
            
            if (description != null && !description.isEmpty()) {
                Specification<Bill> descriptionSpec = (root, query, cb) ->
                    cb.like(cb.lower(root.get("description")), "%" + description.toLowerCase() + "%");
                spec = spec == null ? descriptionSpec : spec.and(descriptionSpec);
            }
            
            if (minAmount != null) {
                Specification<Bill> minAmountSpec = (root, query, cb) ->
                    cb.greaterThanOrEqualTo(root.get("amount"), minAmount);
                spec = spec == null ? minAmountSpec : spec.and(minAmountSpec);
            }
            
            if (maxAmount != null) {
                Specification<Bill> maxAmountSpec = (root, query, cb) ->
                    cb.lessThanOrEqualTo(root.get("amount"), maxAmount);
                spec = spec == null ? maxAmountSpec : spec.and(maxAmountSpec);
            }
            
            if (billTypes != null && !billTypes.isEmpty()) {
                Specification<Bill> billTypeSpec = (root, query, cb) ->
                    root.get("billType").in(billTypes);
                spec = spec == null ? billTypeSpec : spec.and(billTypeSpec);
            }
            
            if (fromDueDate != null) {
                Specification<Bill> fromDueDateSpec = (root, query, cb) ->
                    cb.greaterThanOrEqualTo(root.get("dueDate"), fromDueDate);
                spec = spec == null ? fromDueDateSpec : spec.and(fromDueDateSpec);
            }
            
            if (toDueDate != null) {
                Specification<Bill> toDueDateSpec = (root, query, cb) ->
                    cb.lessThanOrEqualTo(root.get("dueDate"), toDueDate);
                spec = spec == null ? toDueDateSpec : spec.and(toDueDateSpec);
            }
            
            if (statuses != null && !statuses.isEmpty()) {
                Specification<Bill> statusSpec = (root, query, cb) ->
                    root.get("status").in(statuses);
                spec = spec == null ? statusSpec : spec.and(statusSpec);
            }
            
            if (floors != null && !floors.isEmpty()) {
                List<String> apartmentNumbersByFloors = apartmentRepository.findByFloorIn(floors).stream()
                    .map(Apartment::getApartmentNumber)
                    .collect(Collectors.toList());
                
                if (!apartmentNumbersByFloors.isEmpty()) {
                    Specification<Bill> floorSpec = (root, query, cb) ->
                        root.get("apartmentNumber").in(apartmentNumbersByFloors);
                    spec = spec == null ? floorSpec : spec.and(floorSpec);
                } else {
                    return new ArrayList<>();
                }
            }
            
            return spec == null ? billRepository.findAll() : billRepository.findAll(spec);
        }
    }

    @Transactional
    public void saveBill(BillDTO billDTO) {
        Bill bill = new Bill();
        bill.setApartmentNumber(billDTO.getApartmentNumber());
        bill.setAmount(billDTO.getAmount());
        bill.setBillType(billDTO.getBillType());
        bill.setDueDate(billDTO.getDueDate());
        bill.setDescription(billDTO.getDescription());
        bill.setStatus(BillStatus.UNPAID);
        
        billRepository.save(bill);
        
        bill.setPaymentReferenceCode(sepayQrService.generateReferenceCode(bill));
        
        try {
            String qrCodeUrl = sepayQrService.generateQrCodeUrl(bill, false);
            bill.setQrCodeUrl(qrCodeUrl);
            billRepository.save(bill);
        } catch (Exception e) {
            bill.setPaymentError("Lỗi tạo mã QR: " + e.getMessage());
            billRepository.save(bill);
        }
        
        sendBillNotification(bill);
        
        Apartment apartment = apartmentRepository.findByApartmentNumber(billDTO.getApartmentNumber());
        if (apartment != null) {
            Set<Long> billIds = apartment.getBillIds();
            if (billIds == null) {
                billIds = new HashSet<>();
            }
            billIds.add(bill.getId());
            apartment.setBillIds(billIds);
            apartmentRepository.save(apartment);
        }
    }

    public void saveParkingBill(ParkingRental rental) {
        Bill bill = new Bill();
        bill.setApartmentNumber(rental.getApartment().getApartmentNumber());
        bill.setBillType(BillType.SERVICE_COST);
        bill.setDueDate(rental.getEndDate());
        bill.setDescription("Phí thuê bãi đỗ xe từ " + rental.getStartDate() + " đến " + rental.getEndDate());
        bill.setStatus(BillStatus.UNPAID);

        // Tính số ngày thuê
        long days = ChronoUnit.DAYS.between(rental.getStartDate(), rental.getEndDate());

        // Tính phí
        ApartmentFeeUnit apartmentFeeUnit = apartmentFeeUnitService.getFeeUnit();
        long dailyRate = switch (rental.getParkingLot().getType()) {
            case CAR -> apartmentFeeUnit.getCarParkingFeeByHour();
            case MOTORBIKE -> apartmentFeeUnit.getMotorbikeParkingFeeByHour();
            default -> throw new IllegalArgumentException("Loại phương tiện không hợp lệ");
        };

        double fee = dailyRate * days;
        bill.setAmount(fee);

        // Lưu tạm trước để lấy ID
        billRepository.save(bill);

        // Gán mã tham chiếu và tạo mã QR
        bill.setPaymentReferenceCode(sepayQrService.generateReferenceCode(bill));
        try {
            String qrCodeUrl = sepayQrService.generateQrCodeUrl(bill, false);
            bill.setQrCodeUrl(qrCodeUrl);
            billRepository.save(bill);
        } catch (Exception e) {
            bill.setPaymentError("Lỗi tạo mã QR: " + e.getMessage());
            billRepository.save(bill);
        }

        sendBillNotification(bill);

        // Gán bill vào căn hộ
        Apartment apartment = apartmentRepository.findByApartmentNumber(rental.getApartment().getApartmentNumber());
        if (apartment != null) {
            Set<Long> billIds = apartment.getBillIds();
            if (billIds == null) {
                billIds = new HashSet<>();
            }
            billIds.add(bill.getId());
            apartment.setBillIds(billIds);
            apartmentRepository.save(apartment);
        }
    }

    public void saveApartmentBill(Apartment apartment, String message, Long fee) {
        Bill bill = new Bill();

        bill.setApartmentNumber(apartment.getApartmentNumber());
        bill.setBillType(BillType.FIXED_COST);

        LocalDate thisday = LocalDate.now();
        LocalDate dueDate = thisday.plusDays(10);
        bill.setDueDate(dueDate);

        bill.setDescription(message + apartment.getApartmentNumber());
        bill.setStatus(BillStatus.UNPAID);
        bill.setAmount((double) apartment.getArea() * fee);
        billRepository.save(bill);

        // Gán mã tham chiếu và tạo mã QR
        bill.setPaymentReferenceCode(sepayQrService.generateReferenceCode(bill));
        try {
            String qrCodeUrl = sepayQrService.generateQrCodeUrl(bill, false);
            bill.setQrCodeUrl(qrCodeUrl);
            billRepository.save(bill);
        } catch (Exception e) {
            bill.setPaymentError("Lỗi tạo mã QR: " + e.getMessage());
            billRepository.save(bill);
        }

        sendBillNotification(bill);

        // Gán bill vào căn hộ
        if (apartment != null) {
            Set<Long> billIds = apartment.getBillIds();
            if (billIds == null) {
                billIds = new HashSet<>();
            }
            billIds.add(bill.getId());
            apartment.setBillIds(billIds);
            apartmentRepository.save(apartment);
        }
    }

    @Transactional
    public void updateBill(Bill bill) {
        billRepository.updateBill(bill.getId(), bill.getApartmentNumber(), bill.getBillType(), bill.getAmount(), bill.getDueDate(), bill.getDescription(), bill.getStatus());
    }

    @Transactional
    public void deleteBill(Long id) {
        Bill bill = billRepository.findById(id).orElse(null);
        if (bill != null) {
            Apartment apartment = apartmentRepository.findByApartmentNumber(bill.getApartmentNumber());
            if (apartment != null) {
                Set<Long> billIds = apartment.getBillIds();
                if (billIds != null) {
                    billIds.remove(bill.getId());
                    apartment.setBillIds(billIds);
                    apartmentRepository.save(apartment);
                }
            }
            billRepository.deleteById(id);
        }
    }

    public Set<Bill> findByIdIn(Set<Long> billIds) {
        return billRepository.findByIdIn(billIds);
    }
    public Optional<Bill> findById(Long id) {
        return billRepository.findById(id);
    }

    private void sendBillNotification(BillDTO billDTO) {
        Apartment apartment = apartmentRepository.findByApartmentNumber(billDTO.getApartmentNumber());
        if (apartment == null || apartment.getResidentIds() == null || apartment.getResidentIds().isEmpty()) {
            return;
        }

        List<Resident> residents = residentRepository.findAllById(apartment.getResidentIds());

        String notificationMessage = String.format(
                "Hóa đơn %s mới cho căn hộ %s: %s. Số tiền: %,.0f VNĐ. Hạn thanh toán: %s",
                billDTO.getBillType(),
                billDTO.getApartmentNumber(),
                billDTO.getDescription(),
                billDTO.getAmount(),
                billDTO.getDueDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
        );

        for (Resident resident : residents) {
            notificationService.createNotification(
                    resident.getId(),
                    notificationMessage,
                    "Bill: " + billDTO.getDescription(),
                    "/user/apartment-detail"
            );
        }
    }

    private void sendBillNotification(Bill bill) {
        Apartment apartment = apartmentRepository.findByApartmentNumber(bill.getApartmentNumber());
        if (apartment == null || apartment.getResidentIds() == null || apartment.getResidentIds().isEmpty()) {
            return;
        }

        List<Resident> residents = residentRepository.findAllById(apartment.getResidentIds());

        String notificationMessage = String.format(
                "Hóa đơn %s mới cho căn hộ %s. Số tiền: %,.0f VNĐ. Hạn thanh toán: %s",
                bill.getBillType(),
                bill.getApartmentNumber(),
                bill.getAmount(),
                bill.getDueDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
        );

        for (Resident resident : residents) {
            notificationService.createNotification(
                    resident.getId(),
                    notificationMessage,
                    "Bill: " + bill.getDescription(),
                    "/bills/" + bill.getId() + "/payment"
            );
        }
    }

    @Transactional
    public Bill regenerateQrCode(Long billId) {
        Bill bill = billRepository.findById(billId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn"));
        
        if (bill.isPaid()) {
            throw new RuntimeException("Hóa đơn đã được thanh toán, không thể tạo lại mã QR");
        }
        
        try {
            bill.setPaymentReferenceCode(sepayQrService.generateReferenceCode(bill));
            
            String qrCodeUrl = sepayQrService.generateQrCodeUrl(bill, false);
            bill.setQrCodeUrl(qrCodeUrl);
            bill.setPaymentError(null);
            billRepository.save(bill);
        } catch (Exception e) {
            bill.setPaymentError("Lỗi tạo mã QR: " + e.getMessage());
            billRepository.save(bill);
            throw new RuntimeException("Không thể tạo mã QR: " + e.getMessage());
        }
        
        return bill;
    }

    public void regenerateAllQrCode() {
        List<Bill> bills = billRepository.findAll();
        for (Bill bill : bills) {
            String qrCode = sepayQrService.generateQrCodeUrl(bill, true);
            bill.setQrCodeUrl(qrCode);
            billRepository.save(bill);
        }
    }

    public void sendPaymentConfirmation(Bill bill) {
        Apartment apartment = apartmentRepository.findByApartmentNumber(bill.getApartmentNumber());
        if (apartment == null || apartment.getResidentIds() == null || apartment.getResidentIds().isEmpty()) {
            return;
        }
        
        List<Resident> residents = residentRepository.findAllById(apartment.getResidentIds());
        
        String notificationMessage = String.format(
                "Thanh toán thành công! Hóa đơn %s cho căn hộ %s đã được thanh toán. Số tiền: %,.0f VNĐ.",
                bill.getBillType(),
                bill.getApartmentNumber(),
                bill.getAmount()
        );
        
        for (Resident resident : residents) {
            notificationService.createNotification(
                    resident.getId(),
                    notificationMessage,
                    "Bill: " + bill.getDescription(),
                    "/user/apartment-detail"
            );
        }
    }

    @Transactional
    public Bill confirmPayment(Long billId, String username, boolean isAdmin) {
        if (!isAdmin) {
            throw new RuntimeException("Chỉ admin mới có quyền xác nhận thanh toán thủ công");
        }
        
        Bill bill = billRepository.findById(billId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn"));
        
        if (bill.isPaid()) {
            throw new RuntimeException("Hóa đơn đã được thanh toán");
        }
        
        // Kiểm tra trạng thái thanh toán thực tế trên SePay (maybe ko can thiet :))
        // try {
        //     boolean isPaid = checkPaymentStatusOnSepay(bill);
        //     if (!isPaid) {
        //         throw new RuntimeException("Không tìm thấy giao dịch thanh toán cho hóa đơn này trên SePay");
        //     }
        // } catch (Exception e) {
        //     throw new RuntimeException("Lỗi khi kiểm tra thanh toán: " + e.getMessage());
        // }

        bill.setStatus(BillStatus.PAID);
        bill.setPaymentError(null);
        bill.setLastCheckTime(LocalDateTime.now());
        billRepository.save(bill);
        
        System.out.println("Admin " + username + " đã xác nhận thanh toán cho hóa đơn ID: " + billId);
        
        sendPaymentConfirmation(bill);
        
        return bill;
    }
    
    private boolean checkPaymentStatusOnSepay(Bill bill) {
        // TODO: Gọi API SePay để kiểm tra trạng thái thanh toán
        
        String referenceCode = bill.getPaymentReferenceCode();
        double amount = bill.getAmount();
        
        try {
            // Ví dụ gọi API SePay
            /*
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(sepayConfig.getApiUrl() + "/transactions/status"))
                .header("Authorization", "Bearer " + sepayConfig.getApiToken())
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(
                    "{\"reference_code\":\"" + referenceCode + "\",\"amount\":" + amount + "}"
                ))
                .build();
            
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            
            if (response.statusCode() == 200) {
                ObjectMapper mapper = new ObjectMapper();
                JsonNode data = mapper.readTree(response.body());
                return data.path("status").asText().equals("success");
            }
            */
            return true;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi kiểm tra thanh toán trên SePay: " + e.getMessage());
        }
    }

    @Scheduled(cron = "0 0 8 * * ?") // Chạy lúc 8 giờ sáng mỗi ngày
    @Transactional
    public void sendPaymentReminders() {
        LocalDate today = LocalDate.now();
        LocalDate reminderDate = today.plusDays(5);
        
        List<Bill> billsWithDueDateApproaching = billRepository.findBillsWithDueDateApproaching(reminderDate, BillStatus.UNPAID);
        
        System.out.println("Đang gửi nhắc nhở thanh toán cho " + billsWithDueDateApproaching.size() + " hóa đơn có hạn thanh toán vào " + reminderDate);
        
        for (Bill bill : billsWithDueDateApproaching) {
            Apartment apartment = apartmentRepository.findByApartmentNumber(bill.getApartmentNumber());
            if (apartment == null || apartment.getResidentIds() == null || apartment.getResidentIds().isEmpty()) {
                continue;
            }
            
            Set<Long> residentIds = apartment.getResidentIds();
            if (residentIds != null && !residentIds.isEmpty()) {
                String reminderMessage = String.format(
                        "NHẮC NHỞ THANH TOÁN: Hóa đơn %s cho căn hộ %s sắp đến hạn. " +
                        "Số tiền: %,.0f VNĐ. Hạn thanh toán: %s. Vui lòng thanh toán đúng hạn!",
                        bill.getBillType(),
                        bill.getApartmentNumber(),
                        bill.getAmount(),
                        bill.getDueDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                );
                
                for (Long residentId : residentIds) {
                    notificationService.createNotification(residentId, reminderMessage,
                            "Bill: " + bill.getDescription(), "/bills/" + bill.getId() + "/payment");
                }
                
                System.out.println("Đã gửi nhắc nhở thanh toán cho hóa đơn ID: " + bill.getId());
            }
        }
    }

    public List<Bill> findByApartmentNumberAndStatus(String apartmentNumber, BillStatus billStatus) {
        return billRepository.findByApartmentNumberAndStatus(apartmentNumber, billStatus);
    }

    public List<Bill> findAllById(List<Long> billIds) {
        return billRepository.findAllById(billIds);
    }

    public List<Bill> findByPaymentReferenceCode(String billReferenceCode) {
        return billRepository.findByPaymentReferenceCode(billReferenceCode);
    }

    public List<Bill> saveAll(List<Bill> bills) {
        return billRepository.saveAll(bills);
    }
}