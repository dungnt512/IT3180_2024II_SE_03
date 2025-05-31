package com.example.demo.controller.export;

import com.example.demo.entity.ParkingLot;
import com.example.demo.repository.ParkingLotRepository;
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
public class ParkingLotExcelExportController {

    @Autowired
    private ParkingLotRepository parkingLotRepository;

    @GetMapping("/parking-lots")
    public void exportParkingLotsToExcel(HttpServletResponse response) throws IOException {
        List<ParkingLot> parkingLots = parkingLotRepository.findAll();

        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        String filename = ExcelExportUtil.generateExcelFilename("Danh_sach_cho_do_xe");
        response.setHeader("Content-Disposition", "attachment; filename=" + filename);
//        response.setHeader("Content-Disposition", "attachment; filename=.xlsx");

        Workbook workbook = ExcelExportUtil.createWorkbook();
        Sheet sheet = ExcelExportUtil.createSheet(workbook, "Danh sách chỗ đỗ xe");

        ExcelExportUtil.createReportTitleRow(sheet, "DANH SÁCH CHỖ ĐỖ XE", 5);
        ExcelExportUtil.createExportInfoRow(sheet, 5);

        List<String> headers = Arrays.asList(
                "ID", "Mã vị trí", "Loại phương tiện", "Trạng thái", "Biển số xe"
        );

        ExcelExportUtil.createHeaderRow(sheet, headers, 3);

        List<List<Object>> data = new ArrayList<>();

        for (ParkingLot parkingLot : parkingLots) {
            List<Object> rowData = new ArrayList<>();
            rowData.add(parkingLot.getId());
            rowData.add(parkingLot.getLotCode());
            rowData.add(formatParkingType(parkingLot.getType() != null ? parkingLot.getType().name() : ""));
            rowData.add(formatParkingLotStatus(parkingLot.getStatus() != null ? parkingLot.getStatus().name() : ""));
            rowData.add(parkingLot.getPlate());

            data.add(rowData);
        }

        ExcelExportUtil.createDataRows(sheet, data, 4);

        ExcelExportUtil.autoSizeColumns(sheet, headers.size());

        workbook.write(response.getOutputStream());
        workbook.close();
    }

    private String formatParkingType(String type) {
        if (type == null) return "";

        switch (type) {
            case "CAR":
                return "Ô tô";
            case "MOTORBIKE":
                return "Xe máy";
            default:
                return type;
        }
    }

    private String formatParkingLotStatus(String status) {
        if (status == null) return "";

        switch (status) {
            case "AVAILABLE":
                return "Còn trống";
            case "RENTED":
                return "Đã được thuê";
            default:
                return status;
        }
    }
} 
