package com.example.demo.controller;

import com.example.demo.dto.ManualUserDTO;
import com.example.demo.dto.ResidentDTO;
import com.example.demo.entity.Resident;
import com.example.demo.entity.User;
import com.example.demo.service.ApartmentService;
import com.example.demo.service.ResidentService;
import com.example.demo.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.util.*;

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

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.allUsers();
        return ResponseEntity.ok(users);
    }

    @PostMapping("/add")
    public ResponseEntity<?> addUser(@Valid @RequestBody ManualUserDTO manualUserDTO, BindingResult result) {
        if (result.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            for (FieldError error : result.getFieldErrors()) {
                errors.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors); // Trả về 400 Bad Request
        }

        userService.addUser(manualUserDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body("User created successfully");
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        User user = userService.findById(id);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        Resident resident = residentService.findById(user.getResidentId());
        if (resident == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Resident not found");
        }
        boolean deleted = userService.deleteUser(id) && residentService.deleteResident(user.getResidentId());
        return deleted ? ResponseEntity.ok("User deleted successfully") : ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete user");
    }

    @PostMapping("/edit/{id}")
    public ResponseEntity<?> editUser(@PathVariable Long id, @Valid @RequestBody ResidentDTO userDTO, BindingResult result) {
        if (result.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            for (FieldError error : result.getFieldErrors()) {
                errors.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(errors);
        }

        User user = userService.findById(id);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        Long residentId = user.getResidentId();
        Resident resident = residentService.findById(residentId);
        if (resident == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Resident not found");
        }

        apartmentService.updateResident(resident, userDTO);
        boolean updated = userService.updateUser(id, userDTO) && residentService.updateResident(residentId, userDTO);

        if (!updated) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update user");
        }

        return ResponseEntity.ok("User updated successfully");
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
    public Map<String, String> activateUser(@PathVariable Long id) {
        boolean activated = userService.activateUser(id);
        return Map.of("status", activated ? "success" : "error");
    }


    @GetMapping("/resident-info/{userId}")
    public ResponseEntity<?> getResidentInfo(@PathVariable Long userId) {
        User user = userService.findById(userId);
        if (user == null || user.getResidentId() == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Resident info not found");
        }
        Resident resident = residentService.findById(user.getResidentId());
        if (resident == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Resident info not found");
        }
        return ResponseEntity.ok(resident);
    }
    
    @PostMapping("/deactivate/{id}")
    public ResponseEntity<?> deactivateUser(@PathVariable Long id) {
        User user = userService.findById(id);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        Resident resident = residentService.findById(user.getResidentId());
        if (resident == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Resident not found"));
        }

        apartmentService.deleteResident(resident);
        boolean deactivated = userService.deactivateUser(id);

        if (deactivated) {
            return ResponseEntity.ok(Map.of("message", "User deactivated successfully"));
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to deactivate user"));
        }
    }
}
