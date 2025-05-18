package com.example.demo.controller;

import com.example.demo.dto.ContributionTypeDTO;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.ContributionTypeService;
import com.example.demo.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contribution-types")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class ContributionTypeController {

    @Autowired
    private ContributionTypeService contributionTypeService;

    @Autowired
    private UserService userService;
//    private UserRepository userRepository;


    @GetMapping
    public ResponseEntity<List<ContributionTypeDTO>> listContributionTypes() {
        List<ContributionTypeDTO> types = contributionTypeService.getAllContributionTypes();
        return ResponseEntity.ok(types);
    }

    @GetMapping("/form-data")
    public ResponseEntity<ContributionTypeDTO> getFormData() {
        return ResponseEntity.ok(new ContributionTypeDTO());
    }

    @PostMapping("/create")
    @ResponseBody
    public ResponseEntity<?> createContributionType(@Valid @RequestBody ContributionTypeDTO dto, BindingResult bindingResult) {
        try {
            if (bindingResult.hasErrors()) {
                Map<String, String> errors = new HashMap<>();
                bindingResult.getAllErrors().forEach((error) -> {
                    String fieldName = ((FieldError) error).getField();
                    String errorMessage = error.getDefaultMessage();
                    errors.put(fieldName, errorMessage);
                });
                return ResponseEntity.badRequest().body(errors);
            }

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();

            User user = userService.findByName(username);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không tìm thấy thông tin người dùng");
            }

            ContributionTypeDTO createdType = contributionTypeService.createContributionType(dto, user.getId());
            return ResponseEntity.ok(createdType);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContributionTypeDTO> getContributionTypeById(@PathVariable Long id) {
        ContributionTypeDTO type = contributionTypeService.getContributionTypeById(id);
        return ResponseEntity.ok(type);
    }

    @PostMapping("/{id}/edit")
    @ResponseBody
    public ResponseEntity<?> updateContributionType(@PathVariable Long id, @Valid @RequestBody ContributionTypeDTO dto, BindingResult bindingResult) {
        try {
            if (bindingResult.hasErrors()) {
                Map<String, String> errors = new HashMap<>();
                bindingResult.getAllErrors().forEach((error) -> {
                    String fieldName = ((FieldError) error).getField();
                    String errorMessage = error.getDefaultMessage();
                    errors.put(fieldName, errorMessage);
                });
                return ResponseEntity.badRequest().body(errors);
            }

            ContributionTypeDTO updatedType = contributionTypeService.updateContributionType(id, dto);
            return ResponseEntity.ok(updatedType);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteContributionType(@PathVariable Long id) {
        try {
            contributionTypeService.deleteContributionType(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
} 
