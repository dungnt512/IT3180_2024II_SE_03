package com.example.demo.controller.export;

import com.example.demo.entity.Contribution;
import com.example.demo.entity.ContributionType;
import com.example.demo.entity.ResidentContribution;
import com.example.demo.repository.ContributionRepository;
import com.example.demo.repository.ContributionTypeRepository;
import com.example.demo.repository.ResidentContributionRepository;
import com.example.demo.repository.ResidentRepository;
import com.example.demo.entity.Resident;
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
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/api/admin/export")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class ContributionExcelExportController {

    @Autowired
    private ContributionRepository contributionRepository;

    @Autowired
    private ContributionTypeRepository contributionTypeRepository;
    
    @Autowired
    private ResidentContributionRepository residentContributionRepository;
    
    @Autowired
    private ResidentRepository residentRepository;

    @GetMapping("/contributions")
    public void exportContributionsToExcel(HttpServletResponse response) throws IOException {
        List<Contribution> contributions = contributionRepository.findAll();

        Map<Long, String> contributionTypeNames = contributionTypeRepository.findAll()
                .stream()
                .collect(Collectors.toMap(
                        ContributionType::getId,
                        ContributionType::getName
                ));

        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        String filename = ExcelExportUtil.generateExcelFilename("Danh_sach_dong_gop");
        response.setHeader("Content-Disposition", "attachment; filename=" + filename);
//        response.setHeader("Content-Disposition", "attachment; filename=.xlsx");

        Workbook workbook = ExcelExportUtil.createWorkbook();
        Sheet sheet = ExcelExportUtil.createSheet(workbook, "Danh sách đóng góp");

        ExcelExportUtil.createReportTitleRow(sheet, "DANH SÁCH KHOẢN ĐÓNG GÓP", 9);
        ExcelExportUtil.createExportInfoRow(sheet, 9);

        List<String> headers = Arrays.asList(
                "ID", "Loại đóng góp", "Tiêu đề", "Mô tả", 
                "Ngày bắt đầu", "Ngày kết thúc", "Số tiền mục tiêu", 
                "Ngày tạo", "Trạng thái"
        );

        ExcelExportUtil.createHeaderRow(sheet, headers, 3);

        List<List<Object>> data = new ArrayList<>();

        for (Contribution contribution : contributions) {
            List<Object> rowData = new ArrayList<>();
            rowData.add(contribution.getId());
            rowData.add(contributionTypeNames.getOrDefault(contribution.getContributionTypeId(), "Không xác định"));
            rowData.add(contribution.getTitle());
            rowData.add(contribution.getDescription());
            rowData.add(contribution.getStartDate());
            rowData.add(contribution.getEndDate());
            rowData.add(contribution.getTargetAmount());
            rowData.add(contribution.getCreatedAt());
            rowData.add(formatContributionStatus(contribution.getStatus() != null ? contribution.getStatus().name() : ""));

            data.add(rowData);
        }

        ExcelExportUtil.createDataRows(sheet, data, 4);

        ExcelExportUtil.autoSizeColumns(sheet, headers.size());

        workbook.write(response.getOutputStream());
        workbook.close();
    }

    @GetMapping("/resident-contributions")
    public void exportResidentContributionsToExcel(HttpServletResponse response) throws IOException {
        List<ResidentContribution> residentContributions = residentContributionRepository.findAll();
        
        // Lấy danh sách contributions để map tên
        Map<Long, String> contributionNames = contributionRepository.findAll()
                .stream()
                .collect(Collectors.toMap(
                        Contribution::getId,
                        Contribution::getTitle
                ));
        
        // Lấy danh sách residents để map tên
        Map<Long, String> residentNames = residentRepository.findAll()
                .stream()
                .collect(Collectors.toMap(
                        Resident::getId,
                        Resident::getFullName
                ));

        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        String filename = ExcelExportUtil.generateExcelFilename("Dong_gop_cua_cu_dan");
        response.setHeader("Content-Disposition", "attachment; filename=" + filename);

        Workbook workbook = ExcelExportUtil.createWorkbook();
        Sheet sheet = ExcelExportUtil.createSheet(workbook, "Đóng góp của cư dân");

        ExcelExportUtil.createReportTitleRow(sheet, "DANH SÁCH ĐÓNG GÓP CỦA CƯ DÂN", 10);
        ExcelExportUtil.createExportInfoRow(sheet, 10);

        List<String> headers = Arrays.asList(
                "ID", "Khoản đóng góp", "Cư dân", "Mã căn hộ", 
                "Số tiền", "Ghi chú", "Trạng thái thanh toán", 
                "Ngày thanh toán", "Mã giao dịch", "Ngày tạo"
        );

        ExcelExportUtil.createHeaderRow(sheet, headers, 3);

        List<List<Object>> data = new ArrayList<>();

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

        for (ResidentContribution contribution : residentContributions) {
            List<Object> rowData = new ArrayList<>();
            rowData.add(contribution.getId());
            rowData.add(contributionNames.getOrDefault(contribution.getContributionId(), "Không xác định"));
            rowData.add(residentNames.getOrDefault(contribution.getResidentId(), "Không xác định"));
            rowData.add(contribution.getApartmentNumber());
            rowData.add(contribution.getAmount());
            rowData.add(contribution.getNote());
            rowData.add(formatPaymentStatus(contribution.getPaymentStatus() != null ? contribution.getPaymentStatus().name() : ""));
            rowData.add(contribution.getPaidAt() != null ? contribution.getPaidAt().format(formatter) : "");
            rowData.add(contribution.getTransactionId());
            rowData.add(contribution.getCreatedAt() != null ? contribution.getCreatedAt().format(formatter) : "");

            data.add(rowData);
        }

        ExcelExportUtil.createDataRows(sheet, data, 4);

        ExcelExportUtil.autoSizeColumns(sheet, headers.size());

        workbook.write(response.getOutputStream());
        workbook.close();
    }


    private String formatContributionStatus(String status) {
        if (status == null) return "";

        switch (status) {
            case "ACTIVE":
                return "Đang hoạt động";
            case "CLOSED":
                return "Đã kết thúc";
            case "CANCELED":
                return "Đã hủy";
            default:
                return status;
        }
    }
    
    private String formatPaymentStatus(String status) {
        if (status == null) return "";

        switch (status) {
            case "PAID":
                return "Đã thanh toán";
            case "UNPAID":
                return "Chưa thanh toán";
            case "PROCESSING":
                return "Đang xử lý";
            case "FAILED":
                return "Thất bại";
            default:
                return status;
        }
    }
}
