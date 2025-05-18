package com.example.demo.controller.export;

import com.example.demo.entity.Resident;
import com.example.demo.repository.ResidentRepository;
import com.example.demo.util.ExcelExportUtil;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Controller
@RequestMapping("/api/admin/export")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class ResidentExcelExportController {

    @Autowired
    private ResidentRepository residentRepository;

    @GetMapping("/residents")
    public void exportResidentsToExcel(HttpServletResponse response) throws IOException {
        List<Resident> residents = residentRepository.findAll();

        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        String filename = ExcelExportUtil.generateExcelFilename("Danh_sach_cu_dan");
        response.setHeader("Content-Disposition", "attachment; filename=" + filename);

        Workbook workbook = ExcelExportUtil.createWorkbook();
        Sheet sheet = ExcelExportUtil.createSheet(workbook, "Danh sách cư dân");

        ExcelExportUtil.createReportTitleRow(sheet, "DANH SÁCH CƯ DÂN", 8);
        ExcelExportUtil.createExportInfoRow(sheet, 8);

        List<String> headers = Arrays.asList(
                "ID", "Họ tên", "Email", "Số điện thoại", "Tuổi", "Giới tính", "Tình trạng cư trú", "Các căn hộ"
        );

        ExcelExportUtil.createHeaderRow(sheet, headers, 3);

        List<List<Object>> data = new ArrayList<>();

        for (Resident resident : residents) {
            List<Object> rowData = new ArrayList<>();
            rowData.add(resident.getId());
            rowData.add(resident.getFullName());
            rowData.add(resident.getEmail());
            rowData.add(resident.getPhone());
            rowData.add(resident.getAge());
            rowData.add(formatGender(resident.getGender()));
            rowData.add(formatResidentStatus(resident.getStatus() != null ? resident.getStatus().name() : ""));
            
            String apartmentList = resident.getApartmentNumbers() != null && !resident.getApartmentNumbers().isEmpty() ?
                    String.join(", ", resident.getApartmentNumbers()) : "Không có";
            rowData.add(apartmentList);

            data.add(rowData);
        }

        ExcelExportUtil.createDataRows(sheet, data, 4);

        ExcelExportUtil.autoSizeColumns(sheet, headers.size());

        workbook.write(response.getOutputStream());
        workbook.close();
    }

    private String formatGender(String gender) {
        if (gender == null) return "Không xác định";
        
        switch (gender.toLowerCase()) {
            case "male":
                return "Nam";
            case "female":
                return "Nữ";
            case "other":
                return "Khác";
            default:
                return gender;
        }
    }

    private String formatResidentStatus(String status) {
        if (status == null) return "Không xác định";
        
        switch (status) {
            case "THUONGTRU":
                return "Thường trú";
            case "TAMTRU":
                return "Tạm trú";
            case "TAMVANG":
                return "Tạm vắng";
            default:
                return status;
        }
    }
} 