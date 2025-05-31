package com.example.demo.controller.export;

import com.example.demo.entity.User;
import com.example.demo.entity.Resident;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.ResidentRepository;
import com.example.demo.util.ExcelExportUtil;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/export")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class UserExcelExportController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ResidentRepository residentRepository;

    @GetMapping("/users")
    public ResponseEntity<byte[]> exportUsersToExcel() throws IOException {
        List<User> users = userRepository.findAll();

        Map<Long, String> residentNames = residentRepository.findAll()
                .stream()
                .collect(Collectors.toMap(
                        Resident::getId,
                        Resident::getFullName
                ));

        Workbook workbook = ExcelExportUtil.createWorkbook();
        Sheet sheet = ExcelExportUtil.createSheet(workbook, "Danh sách tài khoản");

        ExcelExportUtil.createReportTitleRow(sheet, "DANH SÁCH TÀI KHOẢN", 5);
        ExcelExportUtil.createExportInfoRow(sheet, 5);

        List<String> headers = Arrays.asList(
                "ID", "Tên đăng nhập", "Quyền", "Trạng thái", "Cư dân liên kết"
        );
        ExcelExportUtil.createHeaderRow(sheet, headers, 3);

        List<List<Object>> data = new ArrayList<>();

        for (User user : users) {
            List<Object> rowData = new ArrayList<>();
            rowData.add(user.getId());
            rowData.add(user.getUsername());
            rowData.add(formatRole(user.getRole()));
            rowData.add(user.isActivation() ? "Đang hoạt động" : "Bị khóa");

            String residentName = user.getResidentId() != null ?
                    residentNames.getOrDefault(user.getResidentId(), "Không xác định") :
                    "Không có";
            rowData.add(residentName);

            data.add(rowData);
        }

        ExcelExportUtil.createDataRows(sheet, data, 4);
        ExcelExportUtil.autoSizeColumns(sheet, headers.size());

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        workbook.write(out);
        workbook.close();

        byte[] fileBytes = out.toByteArray();
        String filename = ExcelExportUtil.generateExcelFilename("Danh_sach_tai_khoan");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(fileBytes);
    }

    private String formatRole(String role) {
        if (role == null) return "";

        switch (role) {
            case "ADMIN":
                return "Quản trị viên";
            case "USER":
                return "Người dùng";
            case "MANAGER":
                return "Quản lý";
            default:
                return role;
        }
    }
}
