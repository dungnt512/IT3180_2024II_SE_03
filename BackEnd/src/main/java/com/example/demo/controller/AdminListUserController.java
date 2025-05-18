package com.example.demo.controller;

import com.example.demo.dto.ManualUserDTO;
import com.example.demo.dto.ResidentDTO;
import com.example.demo.entity.Apartment;
import com.example.demo.entity.Resident;
import com.example.demo.entity.User;
import com.example.demo.service.ApartmentService;
import com.example.demo.service.ResidentService;
import com.example.demo.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin
public class AdminListUserController {

    @Autowired
    private UserService userService;

    @Autowired
    private ResidentService residentService;

    @Autowired
    private ApartmentService apartmentService;

    private boolean isCurrentUserSuperAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        return "admin".equals(currentUsername);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        return userService.findByName(currentUsername);
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<User> users = userService.allUsers();
        User currentUser = getCurrentUser();
        boolean isSuperAdmin = isCurrentUserSuperAdmin();

        List<Map<String, Object>> result = users.stream().map(user -> {
            Map<String, Object> item = new HashMap<>();
            item.put("id", user.getId());
            item.put("name", user.getName());
            item.put("role", user.getRole());
            item.put("activation", user.isActivation());

            boolean canEdit = (isSuperAdmin || !"ADMIN".equals(user.getRole())) &&
                              !user.getId().equals(currentUser.getId());
            item.put("canEdit", canEdit);

            if (user.getResidentId() != null) {
                Resident resident = residentService.findById(user.getResidentId());
                if (resident != null) {
                    item.put("fullName", resident.getFullName());
                    item.put("apartmentNumbers", resident.getApartmentNumbers());
                    item.put("email", resident.getEmail());
                    item.put("phone", resident.getPhone());
                    item.put("age", resident.getAge());
                    item.put("status", resident.getStatus());
                }
            }

            return item;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @PostMapping("/add")
    public ResponseEntity<?> addUser(@Valid @RequestBody ManualUserDTO manualUserDTO, BindingResult result) {
        if (result.hasErrors()) {
            Map<String, String> errors = new HashMap<>();

            for (FieldError error : result.getFieldErrors()) {
                String fieldName = error.getField();
                String errorMessage = error.getDefaultMessage();
                errors.put(fieldName, errorMessage);
            }

            return ResponseEntity.badRequest().body(errors);
        }

        userService.addUser(manualUserDTO);
        return ResponseEntity.ok("User added successfully");
    }
    @PostMapping("/delete/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        User user = userService.findById(id);
        if (user == null || user.getResidentId() == null) return ResponseEntity.status(404).body("User not found");
        Resident resident = residentService.findById(user.getResidentId());
        boolean deleted = userService.deleteUser(id) && residentService.deleteResident(user.getResidentId());
        return deleted ? ResponseEntity.ok("success") : ResponseEntity.status(500).body("error");
    }

    @PostMapping("/deactivate/{id}")
    public ResponseEntity<String> deactivateUser(@PathVariable Long id) {
        User user = userService.findById(id);
        if (user == null || user.getResidentId() == null) return ResponseEntity.status(404).body("User not found");
        Resident resident = residentService.findById(user.getResidentId());
        apartmentService.deleteResident(resident);
        boolean result = userService.deactivateUser(id);
        return result ? ResponseEntity.ok("success") : ResponseEntity.status(500).body("error");
    }

    @PostMapping("/edit/{id}")
    public ResponseEntity<String> editUser(@PathVariable Long id, @Valid @RequestBody ResidentDTO dto) {
        User user = userService.findById(id);
        if (user == null || user.getResidentId() == null) return ResponseEntity.status(404).body("User not found");
        Resident resident = residentService.findById(user.getResidentId());
        apartmentService.updateResident(resident, dto);
        boolean updated = userService.updateUser(id, dto) && residentService.updateResident(user.getResidentId(), dto);
        return updated ? ResponseEntity.ok("updated") : ResponseEntity.status(500).body("error");
    }
    @GetMapping("/edit/{id}")
    public ResponseEntity<?> getUserDetails(@PathVariable Long id) {
        User user = userService.findById(id);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        Resident resident = residentService.findById(user.getResidentId());
        if (resident == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Resident not found");
        }

        ResidentDTO respDTO = new ResidentDTO();
        respDTO.setFullName(resident.getFullName());
        respDTO.setAge(resident.getAge());
        respDTO.setPhone(resident.getPhone());
        respDTO.setRole(user.getRole());
        respDTO.setApartmentNumbers(resident.getApartmentNumbers());
        respDTO.setStatus(resident.getStatus());

        List<String> apartmentNumbers = apartmentService.getApartmentNumbers();

        // Tạo response chứa cả thông tin resident và danh sách căn hộ
        Map<String, Object> response = new HashMap<>();
        response.put("resident", respDTO);
        // System.out.println("check res " + respDTO);
        // response.put("id", id);
        // response.put("apartmentNumbers", apartmentNumbers);

        return ResponseEntity.ok(response);
    }


    @PostMapping("/activate/{id}")
    public ResponseEntity<String> activateUser(@PathVariable Long id) {
        boolean activated = userService.activateUser(id);
        User user = userService.findById(id);
        Resident resident = residentService.findById(user.getResidentId());
        apartmentService.updateResident(resident);
        return activated ? ResponseEntity.ok("success") : ResponseEntity.status(500).body("error");
    }

    @GetMapping("/resident-info/{userId}")
    public ResponseEntity<?> getResidentInfo(@PathVariable Long userId) {
        User user = userService.findById(userId);
        if (user == null || user.getResidentId() == null) return ResponseEntity.status(404).body("Không tìm thấy cư dân");
        Resident resident = residentService.findById(user.getResidentId());
        if (resident == null) return ResponseEntity.status(404).body("Không tìm thấy cư dân");
        return ResponseEntity.ok(resident);
    }

    @PostMapping("/batch/delete")
    public ResponseEntity<Map<String, Object>> batchDelete(@RequestBody Map<String, List<Long>> payload) {
        List<Long> ids = payload.get("ids");
        Map<String, Object> result = new HashMap<>();

        if (ids == null || ids.isEmpty()) {
            result.put("success", false);
            result.put("message", "No users selected");
            return ResponseEntity.badRequest().body(result);
        }

        int count = 0;
        List<Long> failed = new ArrayList<>();

        for (Long id : ids) {
            User user = userService.findById(id);
            if (user == null || user.getResidentId() == null) {
                failed.add(id);
                continue;
            }
            Resident resident = residentService.findById(user.getResidentId());
            if (resident == null || !userService.deleteUser(id) || !residentService.deleteResident(user.getResidentId())) {
                failed.add(id);
            } else {
                count++;
            }
        }

        result.put("success", failed.isEmpty());
        result.put("deletedCount", count);
        result.put("failedIds", failed);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/batch/activate")
    public ResponseEntity<Map<String, Object>> batchActivate(@RequestBody Map<String, List<Long>> payload) {
        List<Long> ids = payload.get("ids");
        Map<String, Object> result = new HashMap<>();

        if (ids == null || ids.isEmpty()) {
            result.put("success", false);
            result.put("message", "No users selected");
            return ResponseEntity.badRequest().body(result);
        }

        int count = 0;
        List<Long> failed = new ArrayList<>();

        for (Long id : ids) {
            try {
                User user = userService.findById(id);
                if (user != null) {
                    user.setActivation(true);
                    userService.save(user);
                    Resident resident = residentService.findById(user.getResidentId());
                    if (resident != null) apartmentService.updateResident(resident);
                    count++;
                } else failed.add(id);
            } catch (Exception e) {
                failed.add(id);
            }
        }

        result.put("success", count > 0);
        result.put("activatedCount", count);
        result.put("failedIds", failed);
        return ResponseEntity.ok(result);
    }
}
