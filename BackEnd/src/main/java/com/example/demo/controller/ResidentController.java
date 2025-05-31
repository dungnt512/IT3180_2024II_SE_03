package com.example.demo.controller;

import com.example.demo.entity.Apartment;
import com.example.demo.entity.Resident;
import com.example.demo.entity.User;
import com.example.demo.enums.ApartmentStatus;
import com.example.demo.enums.ApartmentType;
import com.example.demo.enums.ResidentStatus;
import com.example.demo.repository.ResidentRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.ApartmentService;
import com.example.demo.service.ResidentService;
import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.function.Predicate;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/residents")
public class ResidentController {

//    @Autowired
//    private ResidentRepository residentRepository;
    
    @Autowired
    private UserService userService;
//    private UserRepository userRepository;

    
    @Autowired
    private ResidentService residentService;
    @Autowired
    private ApartmentService apartmentService;

    @PostMapping("/a5e324/update/apartment")
    public void updateApartment() {
        List<Resident> residents = residentService.findAll();
        for (Resident resident : residents) {
            for (String apartmentNumber : resident.getApartmentNumbers()) {
                if (apartmentNumber != null && !apartmentNumber.isEmpty()) {
                    Apartment apartment = apartmentService.getApartmentByNumber(apartmentNumber);
                    apartment.getResidentIds().add(resident.getId());
                    apartment.setStatus(ApartmentStatus.OCCUPIED);
                    apartmentService.save(apartment);
                }
            }
        }
    }

    @GetMapping("/filter")
    public List<Resident> filterResidents(
            @RequestParam(value = "fullName", required = false) String fullName,
            @RequestParam(value = "username", required = false) String username,
            @RequestParam(value = "apartment", required = false) List<String> apartments,
            @RequestParam(value = "floor", required = false) Integer floor,
            @RequestParam(value = "floors", required = false) List<Integer> floors,
            @RequestParam(value = "status", required = false) Boolean status,
            @RequestParam(value = "residentStatus", required = false) String residentStatus,
            @RequestParam(value = "role", required = false) String role,
            @RequestParam(value = "filterLogic", defaultValue = "AND") String filterLogic) {

        Map<String, Object> filterParams = new HashMap<>();
        
        if (fullName != null && !fullName.isEmpty()) {
            filterParams.put("fullName", fullName);
        }
        
        if (username != null && !username.isEmpty()) {
            filterParams.put("username", username);
        }
        
        if (apartments != null && !apartments.isEmpty()) {
            filterParams.put("apartments", apartments);
        }
        
        if (floor != null) {
            filterParams.put("floor", floor);
        }
        
        if (floors != null && !floors.isEmpty()) {
            filterParams.put("floors", floors);
        }

        if (status != null) {
            filterParams.put("status", status);
        }
        if (residentStatus != null) {
            filterParams.put("residentStatus", parseStatusValues(residentStatus));
        }
        
        if (role != null && !role.isEmpty()) {
            filterParams.put("role", role);
        }
        
        filterParams.put("filterLogic", filterLogic);
        
        return residentService.filterResidents(filterParams);
    }
    
    @GetMapping("/admin/filter")
    public List<Map<String, Object>> adminFilterResidents(
            @RequestParam(value = "fullName", required = false) String fullName,
            @RequestParam(value = "username", required = false) String username,
            @RequestParam(value = "apartment", required = false) List<String> apartments,
            @RequestParam(value = "floor", required = false) Integer floor,
            @RequestParam(value = "floors", required = false) List<Integer> floors,
            @RequestParam(value = "status", required = false) Boolean status,
            @RequestParam(value = "residentStatus", required = false) String residentStatus,
            @RequestParam(value = "role", required = false) String role,
            @RequestParam(value = "filterLogic", defaultValue = "AND") String filterLogic) {
        
        Map<String, Object> filterParams = new HashMap<>();
        
        if (fullName != null && !fullName.isEmpty()) {
            filterParams.put("fullName", fullName);
        }
        
        if (username != null && !username.isEmpty()) {
            filterParams.put("username", username);
        }
        
        if (apartments != null && !apartments.isEmpty()) {
            filterParams.put("apartments", apartments);
        }
        
        if (floor != null) {
            filterParams.put("floor", floor);
        }
        
        if (floors != null && !floors.isEmpty()) {
            filterParams.put("floors", floors);
        }
        

        if (status != null) {
            filterParams.put("status", status);
        }
        if (residentStatus != null) {
            filterParams.put("residentStatus", parseStatusValues(residentStatus));
        }
        if (role != null && !role.isEmpty()) {
            filterParams.put("role", role);
        }

        filterParams.put("filterLogic", filterLogic);
        
        List<Resident> residents = residentService.filterResidents(filterParams);
        List<User> allUsers = userService.allUsers();
        
        Map<Long, User> userByResidentId = allUsers.stream()
            .filter(u -> u.getResidentId() != null)
            .collect(Collectors.toMap(
                User::getResidentId,
                u -> u,
                (existing, replacement) -> existing
            ));
        
        return residents.stream()
            .map(resident -> {
                Map<String, Object> combinedInfo = new HashMap<>();
                
                combinedInfo.put("id", resident.getId());
                combinedInfo.put("fullName", resident.getFullName());
                combinedInfo.put("email", resident.getEmail());
                combinedInfo.put("phone", resident.getPhone());
                combinedInfo.put("age", resident.getAge());
                combinedInfo.put("status", resident.getStatus());

                String apartmentStr = resident.getApartmentNumbers() != null ? 
                    String.join(", ", resident.getApartmentNumbers()) : "";
                combinedInfo.put("apartmentNumbers", apartmentStr);

                User user = userByResidentId.get(resident.getId());
                if (user != null) {
                    combinedInfo.put("userId", user.getId());
                    combinedInfo.put("name", user.getName());
                    combinedInfo.put("role", user.getRole());
                    combinedInfo.put("activation", user.isActivation());
                }
                
                return combinedInfo;
            })
            .collect(Collectors.toList());
    }

    private List<Integer> parseMultipleValues(String values) {
        if (values == null || values.isEmpty()) {
            return new ArrayList<>();
        }

        return Arrays.stream(values.split("\\|"))
                .filter(s -> !s.isEmpty())
                .map(s -> {
                    try {
                        return Integer.parseInt(s.trim());
                    } catch (NumberFormatException e) {
                        return null;
                    }
                })
                .filter(value -> value != null)
                .collect(Collectors.toList());
    }

    private List<ResidentStatus> parseStatusValues(String status) {
        if (status == null || status.isEmpty()) {
            return new ArrayList<>();
        }

        return Arrays.stream(status.split("\\|"))
                .filter(s -> !s.isEmpty())
                .map(s -> {
                    try {
                        return ResidentStatus.valueOf(s.trim());
                    } catch (IllegalArgumentException e) {
                        return null;
                    }
                })
                .filter(value -> value != null)
                .collect(Collectors.toList());
    }
}