package com.example.demo.controller.export;

import com.example.demo.entity.Complaint;
import com.example.demo.entity.Resident;
import com.example.demo.repository.ComplaintRepository;
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
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Controller
@RequestMapping("/api/admin/export")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class ComplaintExcelExportController {

    @Autowired
    private ComplaintRepository complaintRepository;

    @GetMapping("/complaints")
    public void exportComplaintsToExcel(HttpServletResponse response) throws IOException {
        List<Complaint> complaints = complaintRepository.findAll();

        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        String filename = ExcelExportUtil.generateExcelFilename("Danh_sach_khieu_nai");
        response.setHeader("Content-Disposition", "attachment; filename=" + filename);

        Workbook workbook = ExcelExportUtil.createWorkbook();
        Sheet sheet = ExcelExportUtil.createSheet(workbook, "Danh sách khiếu nại");

        ExcelExportUtil.createReportTitleRow(sheet, "DANH SÁCH KHIẾU NẠI", 7);
        ExcelExportUtil.createExportInfoRow(sheet, 7);

        List<String> headers = Arrays.asList(
                "ID", "Tiêu đề", "Nội dung", "Loại khiếu nại", "Ngày tạo", "Cư dân", "Trạng thái"
        );

        ExcelExportUtil.createHeaderRow(sheet, headers, 3);

        List<List<Object>> data = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

        for (Complaint complaint : complaints) {
            List<Object> rowData = new ArrayList<>();
            rowData.add(complaint.getId());
            rowData.add(complaint.getTitle());
            rowData.add(complaint.getContent());
            rowData.add(complaint.getType());
            rowData.add(complaint.getCreatedAt());

            Resident resident = complaint.getResident();
            String residentName = resident != null ? resident.getFullName() : "Không xác định";
            rowData.add(residentName);

            String status = complaint.getStatus() != null ? complaint.getStatus().getDisplayName() : "Không xác định";
            rowData.add(status);

            data.add(rowData);
        }

        ExcelExportUtil.createDataRows(sheet, data, 4);

        ExcelExportUtil.autoSizeColumns(sheet, headers.size());

        workbook.write(response.getOutputStream());
        workbook.close();
    }
} 
