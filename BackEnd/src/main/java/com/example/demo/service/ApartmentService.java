package com.example.demo.service;

import com.example.demo.dto.ApartmentDTO;
import com.example.demo.dto.ResidentDTO;
import com.example.demo.entity.Apartment;
import com.example.demo.entity.ApartmentFeeUnit;
import com.example.demo.entity.Bill;
import com.example.demo.entity.Resident;
import com.example.demo.enums.ApartmentStatus;
import com.example.demo.enums.ApartmentType;
import com.example.demo.enums.BillStatus;
import com.example.demo.enums.BillType;
import com.example.demo.repository.ApartmentRepository;
import com.example.demo.repository.BillRepository;
import com.example.demo.repository.ResidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ApartmentService {

    @Autowired
    private ApartmentRepository apartmentRepository;
    @Autowired
    private BillService billService;
    @Autowired
    private ApartmentFeeUnitService apartmentFeeUnitService;
    @Autowired
    private ResidentRepository residentRepository;

    // Lấy danh sách tất cả các căn hộ
    public List<Apartment> getAllApartments() {
        return apartmentRepository.findAll();
    }

    public Apartment findById(Long id) {
        Optional<Apartment> apartment = apartmentRepository.findById(id);
        return apartment.orElseThrow(() -> new RuntimeException("Căn hộ không tồn tại"));
    }
    public List<Apartment> findAllById(List<Long> id) {
        return apartmentRepository.findAllById(id);
    }
    // Lấy thông tin căn hộ theo ID
    public Optional<Apartment> getApartmentById(Long id) {
        return apartmentRepository.findById(id);
    }
    public Apartment save(Apartment apartment) {
        return apartmentRepository.save(apartment);
    }
    public List<Apartment> save(List<Apartment> apartment) {
        return apartmentRepository.saveAll(apartment);
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
        return apartmentRepository.findByApartmentNumber(apartmentNumber);
    }

    public void saveApartment(ApartmentDTO apartmentDTO) {
        Apartment apartment = new Apartment();
        apartment.setApartmentNumber(apartmentDTO.getApartmentNumber());
        apartment.setRoomNumber(apartmentDTO.getRoomNumber());
        apartment.setFloor(apartmentDTO.getFloor());
        apartment.setArea(apartmentDTO.getArea());
        apartment.setType(apartmentDTO.getType());

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
                ApartmentFeeUnit apartmentFeeUnit = apartmentFeeUnitService.getFeeUnit();
                if (apartment.getStatus() == ApartmentStatus.RENT) {
                    billService.saveApartmentBill(apartment, "phí thuê căn hộ " + apartment.getApartmentNumber(), apartmentFeeUnit.getApartmentPricePerM2());
                }
                billService.saveApartmentBill(apartment, "phí dịch vụ căn hộ" + apartment.getApartmentNumber(), apartmentFeeUnit.getServiceFeePerM2());
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

        if (deletedApartments != null && !deletedApartments.isEmpty()) {
            deleteResident(deletedApartments, resident);
        }
        if (addedApartments != null && !addedApartments.isEmpty()) {
            updateResident(addedApartments, resident);
        }
//        residentRepository.save(resident);
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
    
    // Phương thức filter căn hộ
    public List<Apartment> filterApartments(Map<String, Object> filterParams) {
        String filterLogic = (String) filterParams.getOrDefault("filterLogic", "AND");
        boolean isAnd = "AND".equalsIgnoreCase(filterLogic);
        
        String apartmentNumber = (String) filterParams.get("apartmentNumber");
        String roomNumber = (String) filterParams.get("roomNumber");
//        String minRoomsNumber = (String) filterParams.get("minRoomsNumber");
//        String maxRoomsNumber = (String) filterParams.get("maxRoomsNumber");
        List<Integer> floors = (List<Integer>) filterParams.get("floors");
        Double minArea = (Double) filterParams.get("minArea");
        Double maxArea = (Double) filterParams.get("maxArea");
        List<ApartmentStatus> statuses = (List<ApartmentStatus>) filterParams.get("status");
        List<ApartmentType> types = (List<ApartmentType>) filterParams.get("type");
//        System.err.println(apartmentNumber + " " + roomNumber + " " + floors + " " + minArea + " " + maxArea + " " + statuses);
        
        if ("OR".equalsIgnoreCase(filterLogic)) {
            Set<Apartment> results = new HashSet<>();
            
            if (apartmentNumber != null && !apartmentNumber.isEmpty()) {
                results.addAll(apartmentRepository.findByApartmentNumberContainingIgnoreCase(apartmentNumber));
            }
            
            if (roomNumber != null && !roomNumber.isEmpty()) {
                results.addAll(apartmentRepository.findByRoomNumberContainingIgnoreCase(roomNumber));
            }
            
            if (floors != null && !floors.isEmpty()) {
                results.addAll(apartmentRepository.findByFloorIn(floors));
            }
            
            if (minArea != null) {
                results.addAll(apartmentRepository.findByAreaGreaterThanEqual(minArea));
            }
            
            if (maxArea != null) {
                results.addAll(apartmentRepository.findByAreaLessThanEqual(maxArea));
            }
            
            if (statuses != null && !statuses.isEmpty()) {
                results.addAll(apartmentRepository.findByStatusIn(statuses));
            }

            if (types != null && !types.isEmpty()) {
                results.addAll(apartmentRepository.findByTypeIn(types));
            }
            
            return new ArrayList<>(results);
        } else {
            Specification<Apartment> spec = null;
            
            if (apartmentNumber != null && !apartmentNumber.isEmpty()) {
                Specification<Apartment> apartmentNumberSpec = (root, query, cb) -> 
                    cb.like(cb.lower(root.get("apartmentNumber")), "%" + apartmentNumber.toLowerCase() + "%");
                spec = spec == null ? apartmentNumberSpec : spec.and(apartmentNumberSpec);
            }
            
            if (roomNumber != null && !roomNumber.isEmpty()) {
                Specification<Apartment> roomNumberSpec = (root, query, cb) -> 
                    cb.like(cb.lower(root.get("roomNumber")), "%" + roomNumber.toLowerCase() + "%");
                spec = spec == null ? roomNumberSpec : spec.and(roomNumberSpec);
            }
            
            if (floors != null && !floors.isEmpty()) {
                Specification<Apartment> floorSpec = (root, query, cb) -> root.get("floor").in(floors);
                spec = spec == null ? floorSpec : spec.and(floorSpec);
            }
            
            if (minArea != null) {
                Specification<Apartment> minAreaSpec = (root, query, cb) -> 
                    cb.greaterThanOrEqualTo(root.get("area"), minArea);
                spec = spec == null ? minAreaSpec : spec.and(minAreaSpec);
            }
            
            if (maxArea != null) {
                Specification<Apartment> maxAreaSpec = (root, query, cb) -> 
                    cb.lessThanOrEqualTo(root.get("area"), maxArea);
                spec = spec == null ? maxAreaSpec : spec.and(maxAreaSpec);
            }
            
            if (statuses != null && !statuses.isEmpty()) {
                Specification<Apartment> statusSpec = (root, query, cb) -> root.get("status").in(statuses);
                spec = spec == null ? statusSpec : spec.and(statusSpec);
            }

            if (types != null && !types.isEmpty()) {
                Specification<Apartment> typeSpec = (root, query, cb) -> root.get("type").in(types);
                spec = spec == null ? typeSpec : spec.and(typeSpec);
            }
            
            return spec == null ? apartmentRepository.findAll() : apartmentRepository.findAll(spec);
        }
    }

    public List<Apartment> findByResidentIdsContaining(Long id) {
        return apartmentRepository.findByResidentIdsContaining(id);
    }

    public Apartment findByApartmentNumber(String apartmentNumber) {
        return apartmentRepository.findByApartmentNumber(apartmentNumber);
    }
}