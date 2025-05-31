package com.example.demo.controller.export;

import com.example.demo.entity.Invoice;
import com.example.demo.repository.InvoiceRepository;
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
public class InvoiceExcelExportController {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @GetMapping("/invoices")
    public void exportInvoicesToExcel(HttpServletResponse response) throws IOException {
        List<Invoice> invoices = invoiceRepository.findAll();

        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        String filename = ExcelExportUtil.generateExcelFilename("Danh_sach_hoa_don_thanh_toan");
        response.setHeader("Content-Disposition", "attachment; filename=" + filename);
//        response.setHeader("Content-Disposition", "attachment; filename=.xlsx");

        Workbook workbook = ExcelExportUtil.createWorkbook();
        Sheet sheet = ExcelExportUtil.createSheet(workbook, "Danh sách hóa đơn thanh toán");

        ExcelExportUtil.createReportTitleRow(sheet, "DANH SÁCH HÓA ĐƠN THANH TOÁN", 10);
        ExcelExportUtil.createExportInfoRow(sheet, 10);

        List<String> headers = Arrays.asList(
                "ID", "Mã hóa đơn", "Số căn hộ", "Tên cư dân", "Tổng tiền", 
                "Mô tả", "Ngày tạo", "Ngày hết hạn", "Trạng thái", "Mã tham chiếu thanh toán"
        );

        ExcelExportUtil.createHeaderRow(sheet, headers, 3);

        List<List<Object>> data = new ArrayList<>();

        for (Invoice invoice : invoices) {
            List<Object> rowData = new ArrayList<>();
            rowData.add(invoice.getId());
            rowData.add(invoice.getInvoiceNumber());
            rowData.add(invoice.getApartmentNumber());
            rowData.add(invoice.getResidentName());
            rowData.add(invoice.getTotalAmount());
            rowData.add(invoice.getDescription());
            rowData.add(invoice.getCreatedAt());
            rowData.add(invoice.getDueDate());
            rowData.add(formatInvoiceStatus(invoice.getStatus() != null ? invoice.getStatus().name() : ""));
            rowData.add(invoice.getPaymentReferenceCode());

            data.add(rowData);
        }

        ExcelExportUtil.createDataRows(sheet, data, 4);

        ExcelExportUtil.autoSizeColumns(sheet, headers.size());

        workbook.write(response.getOutputStream());
        workbook.close();
    }

    private String formatInvoiceStatus(String status) {
        if (status == null) return "";

        switch (status) {
            case "UNPAID":
                return "Chưa thanh toán";
            case "PAID":
                return "Đã thanh toán";
            case "FAILED":
                return "Thanh toán thất bại";
            case "REFUNDED":
                return "Đã hoàn tiền";
            default:
                return status;
        }
    }
} 
