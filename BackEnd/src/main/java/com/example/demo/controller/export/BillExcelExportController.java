package com.example.demo.controller.export;

import com.example.demo.entity.Bill;
import com.example.demo.repository.BillRepository;
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
public class BillExcelExportController {

    @Autowired
    private BillRepository billRepository;

    @GetMapping("/bills")
    public void exportBillsToExcel(HttpServletResponse response) throws IOException {
        List<Bill> bills = billRepository.findAll();

        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        String filename = ExcelExportUtil.generateExcelFilename("Danh_sach_hoa_don");
        response.setHeader("Content-Disposition", "attachment; filename=" + filename);

        Workbook workbook = ExcelExportUtil.createWorkbook();
        Sheet sheet = ExcelExportUtil.createSheet(workbook, "Danh sách hóa đơn");

        ExcelExportUtil.createReportTitleRow(sheet, "DANH SÁCH HÓA ĐƠN", 9);
        ExcelExportUtil.createExportInfoRow(sheet, 9);

        List<String> headers = Arrays.asList(
                "ID", "Số căn hộ", "Loại hóa đơn", "Số tiền", "Ngày đến hạn", 
                "Mô tả", "Trạng thái", "Ngày tạo", "Mã tham chiếu thanh toán"
        );

        ExcelExportUtil.createHeaderRow(sheet, headers, 3);

        List<List<Object>> data = new ArrayList<>();
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

        for (Bill bill : bills) {
            List<Object> rowData = new ArrayList<>();
            rowData.add(bill.getId());
            rowData.add(bill.getApartmentNumber());
            rowData.add(formatBillType(bill.getBillType() != null ? bill.getBillType().name() : ""));
            rowData.add(bill.getAmount());
            rowData.add(bill.getDueDate());
            rowData.add(bill.getDescription());
            rowData.add(formatBillStatus(bill.getStatus() != null ? bill.getStatus().name() : ""));
            rowData.add(bill.getCreatedAt());
            rowData.add(bill.getPaymentReferenceCode());

            data.add(rowData);
        }

        ExcelExportUtil.createDataRows(sheet, data, 4);

        ExcelExportUtil.autoSizeColumns(sheet, headers.size());

        workbook.write(response.getOutputStream());
        workbook.close();
    }

    private String formatBillType(String type) {
        if (type == null) return "";

        switch (type) {
            case "ELECTRICITY":
                return "Điện";
            case "WATER":
                return "Nước";
            case "FIXED_COST":
                return "Phí cố định";
            case "SERVICE_COST":
                return "Phí dịch vụ";
            case "CONTRIBUTION":
                return "Đóng góp";
            case "OTHER":
                return "Khác";
            default:
                return type;
        }
    }

    private String formatBillStatus(String status) {
        if (status == null) return "";

        switch (status) {
            case "UNPAID":
                return "Chưa thanh toán";
            case "PAID":
                return "Đã thanh toán";
            default:
                return status;
        }
    }
} 
