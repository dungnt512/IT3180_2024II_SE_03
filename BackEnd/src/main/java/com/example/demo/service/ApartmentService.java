package com.example.demo.service;

import com.example.demo.dto.ApartmentDTO;
import com.example.demo.dto.ResidentDTO;
import com.example.demo.entity.Apartment;
import com.example.demo.entity.Resident;
import com.example.demo.enums.ApartmentStatus;
import com.example.demo.exception.ApartmentNotFoundException;
import com.example.demo.repository.ApartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ApartmentService {

    @Autowired
    private ApartmentRepository apartmentRepository;
    @Autowired
    private BillService billService;

    // Lấy danh sách tất cả các căn hộ
    public List<Apartment> getAllApartments() {
        return apartmentRepository.findAll();
    }

    public Apartment findById(Long id) {
        Optional<Apartment> apartment = apartmentRepository.findById(id);
        return apartment.orElseThrow(() -> new RuntimeException("Căn hộ không tồn tại"));
    }

    // Lấy thông tin căn hộ theo ID
    public Optional<Apartment> getApartmentById(Long id) {
        return apartmentRepository.findById(id);
    }
    public List<String> getApartmentNumbers() {
        List<Apartment> apartments = apartmentRepository.findAll();
        List<String> apartmentNumbers = new ArrayList<>();
        for (Apartment apartment : apartments) {
            apartmentNumbers.add(apartment.getApartmentNumber());
        }
        return apartmentNumbers;
    }
    public Apartment getApartmentByNumber(String apartmentNumber) {
        Apartment apartment = apartmentRepository.findByApartmentNumber(apartmentNumber);
        if (apartment == null) {
            throw new ApartmentNotFoundException(apartmentNumber); // Hoặc bạn có thể ném một exception khác tùy ý
        }
        return apartment;
    }

    public void saveApartment(ApartmentDTO apartmentDTO) {
        Apartment apartment = new Apartment();
        apartment.setApartmentNumber(apartmentDTO.getApartmentNumber());
        apartment.setRoomNumber(apartmentDTO.getRoomNumber());
        apartment.setFloor(apartmentDTO.getFloor());
        apartment.setArea(apartmentDTO.getArea());

        apartmentRepository.save(apartment);
    }

    public void updateApartment(ApartmentDTO apartmentDTO) {
        Apartment apartment = getApartmentByNumber(apartmentDTO.getApartmentNumber());
        apartment.setRoomNumber(apartmentDTO.getRoomNumber());
        apartment.setFloor(apartmentDTO.getFloor());
        apartment.setArea(apartmentDTO.getArea());
        apartment.setStatus(apartmentDTO.getStatus());

        apartmentRepository.save(apartment);
    }

    public void deleteResident(Set<String> apartmentNumbers, Resident resident) {
        resident.getApartmentNumbers().removeAll(apartmentNumbers);
        for (String apartmentNumber : apartmentNumbers) {
            Apartment apartment = getApartmentByNumber(apartmentNumber);

            Set<Long> residentIds = apartment.getResidentIds();
            if (residentIds != null) {
                residentIds.remove(resident.getId());
                apartment.setResidentIds(residentIds);

                if (residentIds.isEmpty() && apartment.getStatus() == ApartmentStatus.RENT) {
                    apartment.setStatus(ApartmentStatus.VACANT);
                }

                apartmentRepository.save(apartment);
            }
        }
    }
    public void updateResident(Set<String> apartmentNumbers, Resident resident) {
        resident.getApartmentNumbers().addAll(apartmentNumbers);
        for (String apartmentNumber : apartmentNumbers) {
            Apartment apartment = getApartmentByNumber(apartmentNumber);

            Set<Long> residentIds = apartment.getResidentIds();
            if (residentIds == null) {
                residentIds = new HashSet<>();
            }
            boolean isFirstResident = residentIds.isEmpty();

            residentIds.add(resident.getId());
            apartment.setResidentIds(residentIds);

            if (isFirstResident && apartment.getStatus() == ApartmentStatus.VACANT) {
                apartment.setStatus(ApartmentStatus.RENT);
            }

            apartmentRepository.save(apartment);

            if (isFirstResident){
                if (apartment.getStatus() == ApartmentStatus.RENT) {
                    billService.saveApartmentBill(apartment, "phí thuê căn hộ " + apartment.getApartmentNumber(), 300000L);
                }
                billService.saveApartmentBill(apartment, "phí dịch vụ căn hộ" + apartment.getApartmentNumber(), 10000L);
                billService.saveApartmentBill(apartment, "phí quản lý căn hộ" + apartment.getApartmentNumber(), 7000L);
            }
        }
    }
    public void updateResident(Resident resident, ResidentDTO userDTO) {
        Set<String> A = resident.getApartmentNumbers();
        Set<String> B = userDTO.getApartmentNumbers();
        if (A == null) {
            A = new HashSet<>();
        }
        if (B == null) {
            B = new HashSet<>();
        }
        Set<String> deletedApartments = new HashSet<>(A);
        deletedApartments.removeAll(B);
        Set<String> addedApartments = new HashSet<>(B);
        addedApartments.removeAll(A);
//        System.out.println(deletedApartments);
//        System.out.println(addedApartments);

        if (deletedApartments != null && !deletedApartments.isEmpty()) {
            deleteResident(deletedApartments, resident);
        }
        if (addedApartments != null && !addedApartments.isEmpty()) {
            updateResident(addedApartments, resident);
        }

    }

    public void deleteResident(Resident resident) {
        Set<String> apartmentNumbers = resident.getApartmentNumbers();
        deleteResident(apartmentNumbers, resident);
    }

    public void updateResident(Resident resident) {
        Set<String> apartmentNumbers = resident.getApartmentNumbers();
        updateResident(apartmentNumbers, resident);
    }

    // Xóa căn hộ theo ID
    public void deleteApartment(Long id) {
        apartmentRepository.deleteById(id);
    }
}