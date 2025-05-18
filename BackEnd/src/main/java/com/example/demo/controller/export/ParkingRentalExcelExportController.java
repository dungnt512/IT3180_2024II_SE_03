package com.example.demo.controller.export;

import com.example.demo.entity.ParkingRental;
import com.example.demo.entity.Apartment;
import com.example.demo.entity.ParkingLot;
import com.example.demo.repository.ParkingRentalRepository;
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
public class ParkingRentalExcelExportController {

    @Autowired
    private ParkingRentalRepository parkingRentalRepository;

    @GetMapping("/parking-rentals")
    public void exportParkingRentalsToExcel(HttpServletResponse response) throws IOException {
        List<ParkingRental> parkingRentals = parkingRentalRepository.findAll();

        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        String filename = ExcelExportUtil.generateExcelFilename("Danh_sach_thue_cho_do_xe");
        response.setHeader("Content-Disposition", "attachment; filename=" + filename);
//        response.setHeader("Content-Disposition", "attachment; filename=.xlsx");

        Workbook workbook = ExcelExportUtil.createWorkbook();
        Sheet sheet = ExcelExportUtil.createSheet(workbook, "Danh sách thuê chỗ đỗ xe");

        ExcelExportUtil.createReportTitleRow(sheet, "DANH SÁCH THUÊ CHỖ ĐỖ XE", 6);
        ExcelExportUtil.createExportInfoRow(sheet, 6);

        List<String> headers = Arrays.asList(
                "ID", "Căn hộ", "Mã vị trí đỗ xe", "Loại phương tiện", "Ngày bắt đầu", "Ngày kết thúc"
        );

        ExcelExportUtil.createHeaderRow(sheet, headers, 3);

        List<List<Object>> data = new ArrayList<>();

        for (ParkingRental parkingRental : parkingRentals) {
            List<Object> rowData = new ArrayList<>();
            rowData.add(parkingRental.getId());

            Apartment apartment = parkingRental.getApartment();
            String apartmentNumber = apartment != null ? apartment.getApartmentNumber() : "Không xác định";
            rowData.add(apartmentNumber);

            ParkingLot parkingLot = parkingRental.getParkingLot();
            String lotCode = parkingLot != null ? parkingLot.getLotCode() : "Không xác định";
            rowData.add(lotCode);

            String vehicleType = parkingLot != null && parkingLot.getType() != null ? 
                    formatVehicleType(parkingLot.getType().name()) : "Không xác định";
            rowData.add(vehicleType);

            rowData.add(parkingRental.getStartDate());
            rowData.add(parkingRental.getEndDate());

            data.add(rowData);
        }

        ExcelExportUtil.createDataRows(sheet, data, 4);

        ExcelExportUtil.autoSizeColumns(sheet, headers.size());

        workbook.write(response.getOutputStream());
        workbook.close();
    }

    private String formatVehicleType(String type) {
        if (type == null) return "Không xác định";

        switch (type) {
            case "CAR":
                return "Ô tô";
            case "MOTORBIKE":
                return "Xe máy";
            default:
                return type;
        }
    }
} 
