package com.example.demo.controller;

import com.example.demo.dto.ContributionDTO;
import com.example.demo.entity.Contribution;
import com.example.demo.enums.ContributionStatus;
import com.example.demo.repository.ContributionRepository;
import com.example.demo.service.ContributionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/contributions")
public class ContributionAPIController {

//    @Autowired
//    private ContributionRepository contributionRepository;
    
    @Autowired
    private ContributionService contributionService;

    @GetMapping("/list")
    public List<ContributionDTO> getAllContributions() {
        return contributionService.getAllContributions();
    }

    @GetMapping("/filter")
    public List<ContributionDTO> filterContributions(
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "typeId", required = false) Long typeId,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(value = "minAmount", required = false) Double minAmount,
            @RequestParam(value = "maxAmount", required = false) Double maxAmount,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "filterLogic", defaultValue = "AND") String filterLogic) {

        Map<String, Object> filterParams = new HashMap<>();
        
        if (title != null && !title.isEmpty()) {
            filterParams.put("title", title);
        }
        
        if (typeId != null) {
            filterParams.put("typeId", typeId);
        }
        
        if (startDate != null) {
            filterParams.put("startDate", startDate);
        }
        
        if (endDate != null) {
            filterParams.put("endDate", endDate);
        }
        
        if (minAmount != null) {
            filterParams.put("minAmount", minAmount);
        }
        
        if (maxAmount != null) {
            filterParams.put("maxAmount", maxAmount);
        }
        
        if (status != null && !status.isEmpty()) {
            try {
                ContributionStatus contributionStatus = ContributionStatus.valueOf(status);
                filterParams.put("status", contributionStatus);
            } catch (IllegalArgumentException e) {
            }
        }
        
        filterParams.put("filterLogic", filterLogic);
        
        return contributionService.filterContributions(filterParams);
    }
    
    @GetMapping("/active")
    public List<ContributionDTO> getActiveContributions() {
        return contributionService.getActiveContributions();
    }
    
    @GetMapping("/closed")
    public List<ContributionDTO> getClosedContributions() {
        return contributionService.getClosedContributions();
    }
    
    @GetMapping("/{id}")
    public ContributionDTO getContributionById(@PathVariable Long id) {
        return contributionService.getContributionById(id);
    }
} 