package com.example.demo.controller;

import com.example.demo.dto.ContributionTypeDTO;
import com.example.demo.service.ContributionTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contribution-types")
public class ContributionTypeAPIController {

    @Autowired
    private ContributionTypeService contributionTypeService;

//    @GetMapping
//    public List<ContributionTypeDTO> getAllContributionTypes() {
//        return contributionTypeService.getAllContributionTypes();
//    }
    
    @GetMapping("/active")
    public List<ContributionTypeDTO> getActiveContributionTypes() {
        return contributionTypeService.getActiveContributionTypes();
    }
    
//    @GetMapping("/{id}")
//    public ContributionTypeDTO getContributionTypeById(@PathVariable Long id) {
//        return contributionTypeService.getContributionTypeById(id);
//    }
} 