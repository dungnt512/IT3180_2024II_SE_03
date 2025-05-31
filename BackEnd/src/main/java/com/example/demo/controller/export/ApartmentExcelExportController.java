package com.example.demo.controller.export;

import com.example.demo.entity.Apartment;
import com.example.demo.repository.ApartmentRepository;
import com.example.demo.util.ExcelExportUtil;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/export")
@CrossOrigin(origins = "http://localhost:3000") // <-- đổi theo địa chỉ frontend nếu khác
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class ApartmentExcelExportController {

    @Autowired
    private ApartmentRepository apartmentRepository;

    @GetMapping(value = "/apartments", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public void exportApartmentsToExcel(HttpServletResponse response) throws IOException {
        List<Apartment> apartments = apartmentRepository.findAll();

        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        String filename = ExcelExportUtil.generateExcelFilename("Danh_sach_can_ho");
        response.setHeader("Content-Disposition", "attachment; filename=" + filename);

        Workbook workbook = ExcelExportUtil.createWorkbook();
        Sheet sheet = ExcelExportUtil.createSheet(workbook, "Danh sách căn hộ");

        ExcelExportUtil.createReportTitleRow(sheet, "DANH SÁCH CĂN HỘ", 8);
        ExcelExportUtil.createExportInfoRow(sheet, 8);

        List<String> headers = Arrays.asList(
                "ID", "Số căn hộ", "Số phòng", "Tầng", "Diện tích (m²)", "Kiểu căn hộ", "Trạng thái", "Danh sách cư dân"
        );

        ExcelExportUtil.createHeaderRow(sheet, headers, 3);

        List<List<Object>> data = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        for (Apartment apartment : apartments) {
            List<Object> rowData = new ArrayList<>();
            rowData.add(apartment.getId());
            rowData.add(apartment.getApartmentNumber());
            rowData.add(apartment.getRoomNumber());
            rowData.add(apartment.getFloor());
            rowData.add(apartment.getArea());
            rowData.add(formatApartmentType(apartment.getType() != null ? apartment.getType().name() : ""));
            rowData.add(formatApartmentStatus(apartment.getStatus() != null ? apartment.getStatus().name() : ""));

            String residentNames = apartment.getResidentIds() != null && !apartment.getResidentIds().isEmpty() ?
                    String.join(", ", apartment.getResidentIds().toString()) : "Không có cư dân";
            rowData.add(residentNames);

            data.add(rowData);
        }

        ExcelExportUtil.createDataRows(sheet, data, 4);
        ExcelExportUtil.autoSizeColumns(sheet, headers.size());

        workbook.write(response.getOutputStream());
        workbook.close();
    }

    private String formatApartmentStatus(String status) {
        if (status == null) return "";
        return switch (status) {
            case "VACANT" -> "Trống";
            case "OCCUPIED" -> "Đã mua";
            case "RENT" -> "Đang cho thuê";
            default -> status;
        };
    }

    private String formatApartmentType(String type) {
        if (type == null) return "Không xác định";
        return switch (type) {
            case "KIOT" -> "Kiot";
            case "STANDARD" -> "Tiêu chuẩn";
            case "PENHOUSE" -> "Penhouse";
            default -> type;
        };
    }
}
