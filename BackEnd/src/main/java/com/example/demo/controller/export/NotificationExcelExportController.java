package com.example.demo.controller.export;

import com.example.demo.entity.Notification;
import com.example.demo.entity.Resident;
import com.example.demo.repository.NotificationRepository;
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
public class NotificationExcelExportController {

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping("/notifications")
    public void exportNotificationsToExcel(HttpServletResponse response) throws IOException {
        List<Notification> notifications = notificationRepository.findAll();

        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        String filename = ExcelExportUtil.generateExcelFilename("Danh_sach_thong_bao");
        response.setHeader("Content-Disposition", "attachment; filename=" + filename);
//        response.setHeader("Content-Disposition", "attachment; filename=.xlsx");

        Workbook workbook = ExcelExportUtil.createWorkbook();
        Sheet sheet = ExcelExportUtil.createSheet(workbook, "Danh sách thông báo");

        ExcelExportUtil.createReportTitleRow(sheet, "DANH SÁCH THÔNG BÁO", 5);
        ExcelExportUtil.createExportInfoRow(sheet, 5);

        List<String> headers = Arrays.asList(
                "ID", "Cư dân", "Nội dung thông báo", "Đã đọc", "Ngày tạo"
        );

        ExcelExportUtil.createHeaderRow(sheet, headers, 3);

        List<List<Object>> data = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

        for (Notification notification : notifications) {
            List<Object> rowData = new ArrayList<>();
            rowData.add(notification.getId());

            Resident resident = notification.getResident();
            String residentName = resident != null ? resident.getFullName() : "Không xác định";
            rowData.add(residentName);

            rowData.add(notification.getMessage());
            rowData.add(notification.isRead() ? "Đã đọc" : "Chưa đọc");
            rowData.add(notification.getCreatedAt());

            data.add(rowData);
        }

        ExcelExportUtil.createDataRows(sheet, data, 4);

        ExcelExportUtil.autoSizeColumns(sheet, headers.size());

        workbook.write(response.getOutputStream());
        workbook.close();
    }
} 
