package com.example.demo.controller;

import com.example.demo.dto.ResidentContributionDTO;
import com.example.demo.entity.User;
import com.example.demo.enums.PaymentStatus;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.ResidentContributionService;
import com.example.demo.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

@Controller
@RequestMapping("/resident-contributions")
public class ResidentContributionController {

    @Autowired
    private ResidentContributionService residentContributionService;

    @Autowired
    private UserService userService;
//    private UserRepository userRepository;

    @GetMapping
    public String listResidentContributions(Model model) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        User user = userService.findByName(username);
        if (user == null || user.getResidentId() == null) {
            return "redirect:/error";
        }

        List<ResidentContributionDTO> contributions = residentContributionService.getContributionsByResidentId(user.getResidentId());
        model.addAttribute("contributions", contributions);
        return "resident/contributions";
    }

    @GetMapping("/{contributionId}/create")
    public String createResidentContributionForm(@PathVariable Long contributionId, Model model) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        User user = userService.findByName(username);
        if (user == null || user.getResidentId() == null) {
            return "redirect:/error";
        }

        model.addAttribute("contributionId", contributionId);
        model.addAttribute("residentId", user.getResidentId());
        model.addAttribute("contribution", new ResidentContributionDTO());
        return "resident/create-contribution";
    }

    @PostMapping("/{contributionId}/create")
    @ResponseBody
    public ResponseEntity<?> createResidentContribution(
            @PathVariable Long contributionId,
            @Valid @RequestBody ResidentContributionDTO dto,
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

            dto.setContributionId(contributionId);
            dto.setResidentId(user.getResidentId());

            ResidentContributionDTO createdContribution = residentContributionService.createResidentContribution(dto);
            return ResponseEntity.ok(createdContribution);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public String viewResidentContribution(@PathVariable Long id, Model model) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        User user = userService.findByName(username);
        if (user == null || user.getResidentId() == null) {
            return "redirect:/error";
        }

        ResidentContributionDTO contribution = residentContributionService.getContributionById(id);
        if (!contribution.getResidentId().equals(user.getResidentId())) {
            return "redirect:/error-403";
        }

        model.addAttribute("contribution", contribution);
        return "resident/contribution-detail";
    }

    @PostMapping("/{id}/update-payment")
    @ResponseBody
    public ResponseEntity<?> updatePaymentStatus(
            @PathVariable Long id,
            @RequestParam PaymentStatus status,
            @RequestParam(required = false) String transactionId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            
            User user = userService.findByName(username);
            if (user == null || user.getResidentId() == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không tìm thấy thông tin người dùng");
            }

            ResidentContributionDTO contribution = residentContributionService.getContributionById(id);
            if (!contribution.getResidentId().equals(user.getResidentId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Bạn không có quyền cập nhật khoản đóng góp này");
            }

            ResidentContributionDTO updatedContribution = residentContributionService.updatePaymentStatus(id, status, transactionId);
            return ResponseEntity.ok(updatedContribution);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
} 