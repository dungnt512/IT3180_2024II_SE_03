package com.example.demo.service;

import com.example.demo.dto.ResidentDTO;
import com.example.demo.entity.Apartment;
import com.example.demo.entity.Resident;
import com.example.demo.entity.User;
import com.example.demo.enums.ResidentStatus;
import com.example.demo.repository.ApartmentRepository;
import com.example.demo.repository.ResidentRepository;
import com.example.demo.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ResidentService {
    @Autowired
    private ResidentRepository residentRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ApartmentRepository apartmentRepository;

    public List<Resident> findAll() {
        return residentRepository.findAll();
    }

    public Resident findById(Long id) {
        return residentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resident not found"));
    }
    public List<Resident> findAllById(List<Long> id) {
        return residentRepository.findAllById(id);
    }
    public Resident findByIdWithApartments(Long id) {
        return residentRepository.findByIdWithApartments(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy resident với ID: " + id));
    }


    public Set<Resident> findByIdIn(Set<Long> residentIds) {
        return residentRepository.findByIdIn(residentIds);
    }

    public boolean deleteResident(Long id) {
        Resident resident = residentRepository.findById(id).orElse(null);
        if (resident == null) {
            return false;
        }
        residentRepository.delete(resident);
        return true;
    }

    public boolean updateResident(Long id, ResidentDTO user) {
        Resident resident = residentRepository.findById(id).orElse(null);
        if (resident == null) {
            return false;
        }
        resident.setFullName(user.getFullName());
        resident.setAge(user.getAge());
        resident.setPhone(user.getPhone());
        resident.setApartmentNumbers(user.getApartmentNumbers());
        resident.setStatus(user.getStatus());
        residentRepository.save(resident);
        return true;
    }

    public List<Resident> filterResidents(Map<String, Object> filterParams) {
        String fullName = (String) filterParams.get("fullName");
        String username = (String) filterParams.get("username");
        List<String> apartments = (List<String>) filterParams.get("apartments");
        Object floorObj = filterParams.get("floor");
        Object floorsObj = filterParams.get("floors");
        Boolean status = (Boolean) filterParams.get("status");
        List<ResidentStatus> residentStatuses = (List<ResidentStatus>) filterParams.get("residentStatus");
        String role = (String) filterParams.get("role");
        String filterLogic = (String) filterParams.get("filterLogic");
        
        Integer floor = null;
        if (floorObj != null) {
            if (floorObj instanceof String && !((String)floorObj).isEmpty()) {
                try {
                    floor = Integer.parseInt((String)floorObj);
                } catch (NumberFormatException e) {
                }
            } else if (floorObj instanceof Integer) {
                floor = (Integer)floorObj;
            }
        }
        
        List<Integer> floors = null;
        if (floorsObj != null) {
            if (floorsObj instanceof List) {
                floors = ((List<?>) floorsObj).stream()
                    .map(item -> {
                        if (item instanceof String) {
                            try {
                                return Integer.parseInt((String)item);
                            } catch (NumberFormatException e) {
                                return null;
                            }
                        } else if (item instanceof Integer) {
                            return (Integer)item;
                        }
                        return null;
                    })
                    .filter(item -> item != null)
                    .collect(Collectors.toList());
            }
        }

        if ("OR".equalsIgnoreCase(filterLogic)) {
            Set<Resident> results = new HashSet<>();
            
            if (fullName != null && !fullName.isEmpty()) {
                results.addAll(residentRepository.findByFullNameContainingIgnoreCase(fullName));
            }
            
            if (username != null && !username.isEmpty()) {
                results.addAll(residentRepository.findByUserNameContaining(username));
            }
            
            if (apartments != null && !apartments.isEmpty()) {
                results.addAll(residentRepository.findByApartmentNumbersIn(apartments));
            }
            
            if (floor != null) {
                results.addAll(residentRepository.findByFloor(floor));
            }
            
            if (floors != null && !floors.isEmpty()) {
                results.addAll(residentRepository.findByFloors(floors));
            }
            
            if (role != null && !role.isEmpty()) {
                results.addAll(residentRepository.findByUserRole(role));
            }

            if (residentStatuses != null && !residentStatuses.isEmpty()) {
                results.addAll(residentRepository.findByStatusIn(residentStatuses));
            }

            if (status != null) {
                results.addAll(residentRepository.findByUserStatus(status));
            }
            
            return new ArrayList<>(results);
        } else {
            // Logic AND
            List<Resident> result = residentRepository.findByFilters(fullName, username);
            
            if (apartments != null && !apartments.isEmpty()) {
                result = result.stream()
                    .filter(resident -> 
                        resident.getApartmentNumbers() != null && 
                        resident.getApartmentNumbers().stream()
                            .anyMatch(apt -> apartments.contains(apt))
                    )
                    .collect(Collectors.toList());
            }
            if (residentStatuses != null && !residentStatuses.isEmpty()) {
                result = result.stream().
                        filter(resident -> residentStatuses.contains(resident.getStatus())).toList();
            }
            if (floor != null) {
                List<String> apartmentNumbersByFloor = apartmentRepository.findByFloor(floor).stream()
                    .map(Apartment::getApartmentNumber)
                    .collect(Collectors.toList());
                
                result = result.stream()
                    .filter(resident -> 
                        resident.getApartmentNumbers() != null && 
                        resident.getApartmentNumbers().stream()
                            .anyMatch(apartmentNumbersByFloor::contains)
                    )
                    .collect(Collectors.toList());
            }
            
            if (floors != null && !floors.isEmpty()) {
                List<String> apartmentNumbersByFloors = apartmentRepository.findByFloorIn(floors).stream()
                    .map(Apartment::getApartmentNumber)
                    .collect(Collectors.toList());
                
                result = result.stream()
                    .filter(resident -> 
                        resident.getApartmentNumbers() != null && 
                        resident.getApartmentNumbers().stream()
                            .anyMatch(apartmentNumbersByFloors::contains)
                    )
                    .collect(Collectors.toList());
            }
            
            if (role != null && !role.isEmpty()) {
                Map<Long, User> userByResidentId = userRepository.findByRole(role).stream()
                    .filter(user -> user.getResidentId() != null)
                    .collect(Collectors.toMap(
                        User::getResidentId, 
                        user -> user,
                        (existing, replacement) -> existing
                    ));
                
                result = result.stream()
                    .filter(resident -> userByResidentId.containsKey(resident.getId()))
                    .collect(Collectors.toList());
            }


            
            if (status != null) {
                Map<Long, User> userByResidentId = userRepository.findByActivation(status).stream()
                    .filter(user -> user.getResidentId() != null)
                    .collect(Collectors.toMap(
                        User::getResidentId, 
                        user -> user,
                        (existing, replacement) -> existing
                    ));
                
                result = result.stream()
                    .filter(resident -> userByResidentId.containsKey(resident.getId()))
                    .collect(Collectors.toList());
            }

            return result;
        }
    }
}
