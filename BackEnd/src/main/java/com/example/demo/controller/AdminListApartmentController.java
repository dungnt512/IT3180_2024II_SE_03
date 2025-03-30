package com.example.demo.controller;

import com.example.demo.dto.ApartmentDTO;
import com.example.demo.entity.Apartment;
import com.example.demo.entity.Resident;
import com.example.demo.service.ApartmentService;
import com.example.demo.service.ResidentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@CrossOrigin(origins = "*") // Cho phép React frontend truy cập
@RestController
@RequestMapping("/api/admin/apartment-list")
public class AdminListApartmentController {

    @Autowired
    private ApartmentService apartmentService;

    @Autowired
    private ResidentService residentService;

    // API lấy danh sách tất cả căn hộ
    @GetMapping
    public ResponseEntity<List<Apartment>> getAllApartments() {
        List<Apartment> apartments = apartmentService.getAllApartments();
        return ResponseEntity.ok(apartments);
    }

    // API thêm căn hộ mới
    @PostMapping("/add-apartment")
    public ResponseEntity<String> addApartment(@RequestBody ApartmentDTO apartmentDTO) {
        apartmentService.saveApartment(apartmentDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body("Apartment created successfully");
    }

    // API lấy danh sách cư dân trong căn hộ
    @GetMapping("/residents/{apartmentId}")
    public ResponseEntity<Set<Resident>> getResidentsByApartment(@PathVariable Long apartmentId) {
        Optional<Apartment> apartment = apartmentService.getApartmentById(apartmentId);
        if (apartment.isPresent()) {
            Set<Long> residentIds = new HashSet<>(apartment.get().getResidentIds());
            Set<Resident> residents = residentService.findByIdIn(residentIds);
            return ResponseEntity.ok(residents);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptySet());
    }

    // API lấy thông tin căn hộ theo ID
    @GetMapping("/edit-apartment/{id}")
    public ResponseEntity<Apartment> getApartmentById(@PathVariable("id") Long id) {
        Optional<Apartment> apartmentOpt = apartmentService.getApartmentById(id);
        return apartmentOpt.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // API cập nhật thông tin căn hộ
    @PostMapping("/edit-apartment")
    public ResponseEntity<String> updateApartment(@RequestBody Apartment apartment) {
        ApartmentDTO apartmentDTO = new ApartmentDTO();
        
        apartmentDTO.setApartmentNumber(apartment.getApartmentNumber());
        apartmentDTO.setRoomNumber(apartment.getRoomNumber());
        apartmentDTO.setArea(apartment.getArea());
        apartmentDTO.setFloor(apartment.getFloor());

        apartmentService.updateApartment(apartmentDTO);

        return ResponseEntity.ok("Apartment updated successfully");
    }
    // API xóa căn hộ theo ID
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteApartment(@PathVariable Long id) {
        apartmentService.deleteApartment(id);
        return ResponseEntity.noContent().build();
    }
}
