package com.example.demo.service;

import com.example.demo.dto.BillDTO;
import com.example.demo.entity.Apartment;
import com.example.demo.entity.Bill;
import com.example.demo.entity.ParkingRental;
import com.example.demo.entity.Resident;
import com.example.demo.enums.BillStatus;
import com.example.demo.enums.BillType;
import com.example.demo.repository.ApartmentRepository;
import com.example.demo.repository.BillRepository;
import com.example.demo.repository.ResidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;

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

    public List<Bill> getAllBills() {
        return billRepository.findAll();
    }
    public Bill getBillById(Long id) {
        return billRepository.findById(id).orElse(null);
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
            String qrCodeUrl = sepayQrService.generateQrCodeUrl(bill);
            bill.setQrCodeUrl(qrCodeUrl);
            billRepository.save(bill);
        } catch (Exception e) {
            bill.setPaymentError("Lỗi tạo mã QR: " + e.getMessage());
            billRepository.save(bill);
        }
        
        sendBillNotification(billDTO);
        
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
        long dailyRate = switch (rental.getParkingLot().getType()) {
            case CAR -> 100_000L;
            case MOTORBIKE -> 20_000L;
            default -> throw new IllegalArgumentException("Loại phương tiện không hợp lệ");
        };

        double fee = dailyRate * days;
        bill.setAmount(fee);

        // Lưu tạm trước để lấy ID
        billRepository.save(bill);

        // Gán mã tham chiếu và tạo mã QR
        bill.setPaymentReferenceCode(sepayQrService.generateReferenceCode(bill));
        try {
            String qrCodeUrl = sepayQrService.generateQrCodeUrl(bill);
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
            String qrCodeUrl = sepayQrService.generateQrCodeUrl(bill);
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

    private void sendBillNotification(BillDTO billDTO) {
        Apartment apartment = apartmentRepository.findByApartmentNumber(billDTO.getApartmentNumber());
        if (apartment == null || apartment.getResidentIds() == null || apartment.getResidentIds().isEmpty()) {
            return;
        }

        List<Resident> residents = residentRepository.findAllById(apartment.getResidentIds());

        String notificationMessage = String.format(
                "Hóa đơn %s mới cho căn hộ %s. Số tiền: %,.0f VNĐ. Hạn thanh toán: %s",
                billDTO.getBillType(),
                billDTO.getApartmentNumber(),
                billDTO.getAmount(),
                billDTO.getDueDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
        );

        for (Resident resident : residents) {
            notificationService.createNotification(
                    resident.getId(),
                    notificationMessage
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
                    notificationMessage
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
            
            String qrCodeUrl = sepayQrService.generateQrCodeUrl(bill);
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
                    notificationMessage
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
}