package com.example.demo.service;

import com.example.demo.entity.Apartment;
import com.example.demo.entity.ParkingLot;
import com.example.demo.entity.ParkingRental;
import com.example.demo.entity.Resident;
import com.example.demo.repository.ApartmentRepository;
import com.example.demo.repository.ParkingLotRepository;
import com.example.demo.repository.ParkingRentalRepository;

import com.example.demo.repository.ResidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ParkingService {
    @Autowired
    private ParkingLotRepository parkingLotRepository;
    @Autowired
    private ParkingRentalRepository parkingRentalRepository;
    @Autowired
    private NotificationService notificationService;
    @Autowired
    private ResidentRepository residentRepository;
    @Autowired
    private BillService billService;

    // Lấy danh sách các chỗ đỗ xe có sẵn (chưa bị thuê hoặc hết hạn)
    public List<ParkingLot> getAvailableParkingLots() {
        // Lấy tất cả các chỗ đỗ xe
        List<ParkingLot> allParkingLots = parkingLotRepository.findAll();

        // Lấy danh sách các giao dịch thuê chỗ đỗ xe có ngày hết hạn sau ngày hiện tại
        List<ParkingRental> activeRentals = parkingRentalRepository.findByEndDateAfter(LocalDate.now());

        // Lấy danh sách các ParkingLot đã được thuê và chưa hết hạn
        Set<Long> rentedLotIds = activeRentals.stream()
                .map(rental -> rental.getParkingLot().getId())
                .collect(Collectors.toSet());

        // Trả về các chỗ đỗ xe chưa bị thuê hoặc đã hết hạn
        return allParkingLots.stream()
                .filter(parkingLot -> !rentedLotIds.contains(parkingLot.getId()))
                .collect(Collectors.toList());
    }

    // Lấy thông tin một chỗ đỗ xe theo ID
    public ParkingLot getParkingLotById(Long id) {
        return parkingLotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chỗ đỗ xe với ID: " + id));
    }
    public ParkingLot getParkingLotByLotCode(String lotCode) {
        return parkingLotRepository.findByLotCode(lotCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chỗ đỗ xe với mã: " + lotCode));
    }

    // Tạo mới một giao dịch thuê chỗ đỗ xe
    public ParkingRental rentParkingLot(ParkingLot parkingLot, LocalDate endDate) {
        // Tạo đối tượng ParkingRental mới
        ParkingRental rental = new ParkingRental();
        rental.setParkingLot(parkingLot);
        rental.setStartDate(LocalDate.now());
        rental.setEndDate(endDate);

        // Lưu giao dịch thuê
        return parkingRentalRepository.save(rental);
    }

    public void save(ParkingRental rental) {
        parkingRentalRepository.save(rental);

        billService.saveParkingBill(rental);

        Apartment apartment = rental.getApartment();
        if (apartment == null || apartment.getResidentIds() == null || apartment.getResidentIds().isEmpty()) {
            return;
        }

        List<Resident> residents = residentRepository.findAllById(apartment.getResidentIds());

        String notificationMessage = String.format(
                "Bạn đã thuê thành công bãi đậu xe %s cho xe %s, ngày kết thúc: %s",
                rental.getParkingLot().getLotCode(),
                switch (rental.getParkingLot().getType()) {
                    case CAR -> "Ô tô";
                    case MOTORBIKE -> "Xe máy";
                },
                rental.getEndDate()
        );

        for (Resident resident : residents) {
            notificationService.createNotification(
                    resident.getId(),
                    notificationMessage
            );
        }
    }

    public List<ParkingLot> getAllParkingLots(){
        return parkingLotRepository.findAll();
    };

    public void saveParkingLot(ParkingLot parkingLot){
        parkingLotRepository.save(parkingLot);
    };

    public Set<ParkingRental> findByApartmentId(Long apartmentId) {
        return parkingRentalRepository.findByApartmentId(apartmentId);
    };
}