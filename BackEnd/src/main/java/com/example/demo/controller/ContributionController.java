package com.example.demo.controller;

import com.example.demo.dto.ContributionDTO;
import com.example.demo.dto.ResidentContributionDTO;
import com.example.demo.entity.*;
import com.example.demo.enums.ContributionStatus;
import com.example.demo.enums.PaymentStatus;
import com.example.demo.repository.ApartmentRepository;
import com.example.demo.repository.ResidentRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contributions")
@Validated
public class ContributionController {

    @Autowired
    private ContributionService contributionService;

    @Autowired
    private ResidentContributionService residentContributionService;

    @Autowired
    private ContributionTypeService contributionTypeService;

//    @Autowired
//    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private ResidentService residentService;
//    @Autowired
//    private ResidentRepository residentRepository;

    @Autowired
    private ApartmentService apartmentService;
//    @Autowired
//    private ApartmentRepository apartmentRepository;

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/user")
    public ResponseEntity<?> userContributions() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        User user = userService.findByName(username);
        if (user == null || user.getResidentId() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không tìm thấy thông tin người dùng");
        }

        Resident resident;
        try {
            resident = residentService.findById(user.getResidentId());
            if (resident == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không tìm thấy thông tin cư dân");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không tìm thấy thông tin cư dân");
        }

        List<ContributionDTO> contributions = contributionService.getActiveContributions();
        List<ResidentContributionDTO> userContributions = residentContributionService.getContributionsByResidentId(resident.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("contributions", contributions);
        response.put("userContributions", userContributions);
        response.put("resident", resident);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/form-data")
    public ResponseEntity<?> getContributionFormData() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        User user = userService.findByName(username);
        if (user == null || user.getResidentId() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không tìm thấy thông tin người dùng");
        }
        Resident resident;
        try {
            resident = residentService.findById(user.getResidentId());
            if (resident == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không tìm thấy thông tin cư dân");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không tìm thấy thông tin cư dân");
        }

        List<Apartment> apartments = apartmentService.findByResidentIdsContaining(resident.getId());
        if (apartments.isEmpty()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không tìm thấy thông tin căn hộ");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("apartments", apartments);
        response.put("resident", resident);
        response.put("contributionTypes", contributionTypeService.getActiveContributionTypes());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/user/create")
    @ResponseBody
    public ResponseEntity<?> createContribution(@Valid @RequestBody ResidentContributionDTO residentContributionDTO, BindingResult bindingResult) {
        try {
            if (bindingResult.hasErrors()) {
                Map<String, String> errors = new HashMap<>();
                bindingResult.getAllErrors().forEach((error) -> {
                    String fieldName = ((FieldError) error).getField();
                    String errorMessage = error.getDefaultMessage();
                    errors.put(fieldName, errorMessage);
                });
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
            }

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();

            User user = userService.findByName(username);
            if (user == null || user.getResidentId() == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không tìm thấy thông tin người dùng");
            }

            residentContributionDTO.setResidentId(user.getResidentId());
            Resident resident;
            try {
                resident = residentService.findById(user.getResidentId());
                if (resident == null) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không tìm thấy thông tin cư dân");
                }
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không tìm thấy thông tin cư dân");
            }

            List<Apartment> apartments = apartmentService.findByResidentIdsContaining(resident.getId());
            boolean hasAccess = apartments.stream()
                .anyMatch(apt -> apt.getApartmentNumber().equals(residentContributionDTO.getApartmentNumber()));

            if (!hasAccess) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Bạn không sở hữu căn hộ này");
            }

            ResidentContributionDTO createdContribution = residentContributionService.createResidentContribution(residentContributionDTO);

            return ResponseEntity.ok(createdContribution.getId());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<?> viewUserContribution(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        User user = userService.findByName(username);
        if (user == null || user.getResidentId() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không tìm thấy thông tin người dùng");
        }

        ContributionDTO contribution = contributionService.getContributionById(id);

        List<ResidentContributionDTO> residentContributions = 
            residentContributionService.getContributionsByContributionId(id).stream()
                .filter(rc -> rc.getResidentId().equals(user.getResidentId()))
                .toList();

        if (residentContributions.isEmpty()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Bạn không có quyền xem khoản đóng góp này");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("contribution", contribution);
        response.put("residentContributions", residentContributions);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{id}/contribute-form")
    public ResponseEntity<?> getContributeFormData(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        User user = userService.findByName(username);
        if (user == null || user.getResidentId() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không tìm thấy thông tin người dùng");
        }
        Resident resident;
        try {
            resident = residentService.findById(user.getResidentId());
            if (resident == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không tìm thấy thông tin cư dân");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không tìm thấy thông tin cư dân");
        }

        ContributionDTO contribution = contributionService.getContributionById(id);
        if (contribution.getStatus() != ContributionStatus.ACTIVE) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Khoản đóng góp không còn hoạt động");
        }

        List<Apartment> apartments = apartmentService.findByResidentIdsContaining(resident.getId());
        if (apartments.isEmpty()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không tìm thấy thông tin căn hộ của " + resident.getId());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("apartments", apartments);
        response.put("resident", resident);
        response.put("contribution", contribution);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/user/contribute")
    @ResponseBody
    public ResponseEntity<?> contributeToContribution(@Valid @RequestBody ResidentContributionDTO dto, 
                                                     BindingResult bindingResult) {
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
            if (user == null || user.getResidentId() == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không tìm thấy thông tin người dùng");
            }

            dto.setResidentId(user.getResidentId());
            dto.setPaymentStatus(PaymentStatus.UNPAID);

            ResidentContributionDTO createdContribution = residentContributionService.createResidentContribution(dto);
            return ResponseEntity.ok(createdContribution.getInvoiceId());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/admin")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> adminContributions() {
        List<ContributionDTO> contributions = contributionService.getActiveContributions();
        List<ContributionDTO> closedContributions = contributionService.getClosedContributions();

        Map<String, Object> response = new HashMap<>();
        response.put("contributions", contributions);
        response.put("closedContributions", closedContributions);
        response.put("statuses", ContributionStatus.values());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin/resident-contributions")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> adminResidentContributions() {
        List<ResidentContributionDTO> contributions = residentContributionService.getAllContributions();

        Map<String, Object> response = new HashMap<>();
        response.put("contributions", contributions);
        response.put("statuses", PaymentStatus.values());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin/form-data")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> getAdminFormData() {
        List<Apartment> apartments = apartmentService.getAllApartments();
        List<Resident> residents = residentService.findAll();

        Map<String, Object> response = new HashMap<>();
        response.put("apartments", apartments);
        response.put("residents", residents);
        response.put("contributionTypes", contributionTypeService.getActiveContributionTypes());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin/create")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @ResponseBody
    public ResponseEntity<?> adminCreateContribution(
            @Valid @RequestBody ContributionDTO contributionDTO, 
            BindingResult bindingResult) {
        try {
            if (bindingResult.hasErrors()) {
                Map<String, String> errors = new HashMap<>();
                bindingResult.getAllErrors().forEach((error) -> {
                    String fieldName = ((FieldError) error).getField();
                    String errorMessage = error.getDefaultMessage();
                    errors.put(fieldName, errorMessage);
                });
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
            }

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();

            User user = userService.findByName(username);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không tìm thấy thông tin người dùng");
            }

            ContributionDTO dto = new ContributionDTO();
            dto.setContributionTypeId(contributionDTO.getContributionTypeId());
            dto.setTitle(contributionDTO.getTitle());
            dto.setDescription(contributionDTO.getDescription());
            dto.setStartDate(contributionDTO.getStartDate());
            dto.setEndDate(contributionDTO.getEndDate());
            dto.setTargetAmount(contributionDTO.getTargetAmount());

            Contribution createdContribution = contributionService.createContribution(dto, user.getId());

            String notificationMessage = "Khoản đóng góp mới: " + createdContribution.getTitle() + 
                " đã được tạo. Vui lòng xem chi tiết trong mục Đóng góp.";

            List<Resident> allResidents = residentService.findAll();
            for (Resident resident : allResidents) {
                notificationService.createNotification(resident.getId(), notificationMessage,
                        "Contribution: " + createdContribution.getTitle(), "/contributions/user/" + createdContribution.getId());
            }

            return ResponseEntity.ok(createdContribution.getId());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/admin/{id}/edit")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> editContribution(
            @PathVariable Long id,
            @Valid @RequestBody Contribution contribution,
            BindingResult bindingResult) {
        try {
            if (bindingResult.hasErrors()) {
                Map<String, String> errors = new HashMap<>();
                bindingResult.getAllErrors().forEach((error) -> {
                    String fieldName = ((FieldError) error).getField();
                    String errorMessage = error.getDefaultMessage();
                    errors.put(fieldName, errorMessage);
                });
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
            }

            Contribution updatedContribution = contributionService.updateContribution(id, contribution);
            return ResponseEntity.ok(updatedContribution);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/admin/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> getAdminContribution(@PathVariable Long id) {
        ContributionDTO contribution = contributionService.getContributionById(id);
        List<ResidentContributionDTO> residentContributions = 
            residentContributionService.getContributionsByContributionId(id);

        Map<String, Object> response = new HashMap<>();
        response.put("contribution", contribution);
        response.put("residentContributions", residentContributions);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin/{id}/close")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @ResponseBody
    public ResponseEntity<?> closeContribution(@PathVariable Long id) {
        try {
            contributionService.closeContribution(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/admin/{id}/cancel")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @ResponseBody
    public ResponseEntity<?> cancelContribution(@PathVariable Long id) {
        try {
            contributionService.cancelContribution(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/admin/{id}/reactivate")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @ResponseBody
    public ResponseEntity<?> reactivateContribution(@PathVariable Long id) {
        try {
            contributionService.reactivateContribution(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/admin/create-for-all")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @ResponseBody
    public ResponseEntity<?> createForAllApartments(
            @RequestParam @NotNull(message = "ID khoản đóng góp không được để trống") Long contributionId,
            @RequestParam @NotNull(message = "Số tiền không được để trống") Double amount) {
        try {
            contributionService.createResidentContributionsForAll(contributionId, amount);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

}
