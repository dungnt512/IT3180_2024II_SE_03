package com.example.demo.controller.export;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class ExcelExportMenuController {

    @GetMapping("/api/admin/export")
    public String showExportMenu() {
        return "admin/export/export-menu";
    }
} 
