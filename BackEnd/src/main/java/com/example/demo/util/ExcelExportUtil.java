package com.example.demo.util;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.List;
import java.util.Map;

public class ExcelExportUtil {

    public static Workbook createWorkbook() {
        return new XSSFWorkbook();
    }
    
    public static Sheet createSheet(Workbook workbook, String sheetName) {
        return workbook.createSheet(sheetName);
    }
    
    public static void createReportTitleRow(Sheet sheet, String title, int columnsCount) {
        Row titleRow = sheet.createRow(0);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue(title);
        
        CellStyle titleStyle = sheet.getWorkbook().createCellStyle();
        Font titleFont = sheet.getWorkbook().createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 16);
        titleStyle.setFont(titleFont);
        titleStyle.setAlignment(HorizontalAlignment.CENTER);
        titleCell.setCellStyle(titleStyle);
        
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, columnsCount - 1));
    }
    
    public static void createExportInfoRow(Sheet sheet, int columnsCount) {
        Row infoRow = sheet.createRow(1);
        Cell infoCell = infoRow.createCell(0);
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
        String currentTime = LocalDateTime.now().format(formatter);
        infoCell.setCellValue("Xuất báo cáo lúc: " + currentTime);
        
        CellStyle infoStyle = sheet.getWorkbook().createCellStyle();
        Font infoFont = sheet.getWorkbook().createFont();
        infoFont.setItalic(true);
        infoStyle.setFont(infoFont);
        infoCell.setCellStyle(infoStyle);
        
        sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, columnsCount - 1));
    }
    
    public static void createHeaderRow(Sheet sheet, List<String> headers, int rowIndex) {
        Row headerRow = sheet.createRow(rowIndex);
        
        CellStyle headerStyle = sheet.getWorkbook().createCellStyle();
        Font headerFont = sheet.getWorkbook().createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        headerStyle.setBorderBottom(BorderStyle.THIN);
        headerStyle.setBorderLeft(BorderStyle.THIN);
        headerStyle.setBorderRight(BorderStyle.THIN);
        headerStyle.setBorderTop(BorderStyle.THIN);
        headerStyle.setAlignment(HorizontalAlignment.CENTER);
        
        for (int i = 0; i < headers.size(); i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers.get(i));
            cell.setCellStyle(headerStyle);
        }
    }
    
    public static void createDataRows(Sheet sheet, List<List<Object>> data, int startRowIndex) {
        CellStyle dataCellStyle = sheet.getWorkbook().createCellStyle();
        dataCellStyle.setBorderBottom(BorderStyle.THIN);
        dataCellStyle.setBorderLeft(BorderStyle.THIN);
        dataCellStyle.setBorderRight(BorderStyle.THIN);
        dataCellStyle.setBorderTop(BorderStyle.THIN);
        
        CellStyle numberCellStyle = sheet.getWorkbook().createCellStyle();
        numberCellStyle.cloneStyleFrom(dataCellStyle);
        numberCellStyle.setAlignment(HorizontalAlignment.RIGHT);
        DataFormat format = sheet.getWorkbook().createDataFormat();
        numberCellStyle.setDataFormat(format.getFormat("#,##0"));
        
        CellStyle dateCellStyle = sheet.getWorkbook().createCellStyle();
        dateCellStyle.cloneStyleFrom(dataCellStyle);
        dateCellStyle.setDataFormat(format.getFormat("dd/mm/yyyy"));
        
        CellStyle dateTimeCellStyle = sheet.getWorkbook().createCellStyle();
        dateTimeCellStyle.cloneStyleFrom(dataCellStyle);
        dateTimeCellStyle.setDataFormat(format.getFormat("dd/mm/yyyy hh:mm:ss"));
        
        for (int i = 0; i < data.size(); i++) {
            Row row = sheet.createRow(i + startRowIndex);
            List<Object> rowData = data.get(i);
            
            for (int j = 0; j < rowData.size(); j++) {
                Cell cell = row.createCell(j);
                Object value = rowData.get(j);
                
                if (value == null) {
                    cell.setCellValue("");
                } else if (value instanceof String) {
                    cell.setCellValue((String) value);
                    cell.setCellStyle(dataCellStyle);
                } else if (value instanceof Number) {
                    cell.setCellValue(((Number) value).doubleValue());
                    cell.setCellStyle(numberCellStyle);
                } else if (value instanceof Boolean) {
                    cell.setCellValue((Boolean) value);
                    cell.setCellStyle(dataCellStyle);
                } else if (value instanceof Date) {
                    cell.setCellValue((Date) value);
                    cell.setCellStyle(dateCellStyle);
                } else if (value instanceof LocalDate) {
                    cell.setCellValue(((LocalDate) value).format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
                    cell.setCellStyle(dateCellStyle);
                } else if (value instanceof LocalDateTime) {
                    cell.setCellValue(((LocalDateTime) value).format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")));
                    cell.setCellStyle(dateTimeCellStyle);
                } else {
                    cell.setCellValue(value.toString());
                    cell.setCellStyle(dataCellStyle);
                }
            }
        }
    }
    
    public static void autoSizeColumns(Sheet sheet, int columnsCount) {
        for (int i = 0; i < columnsCount; i++) {
            sheet.autoSizeColumn(i);
            int currentWidth = sheet.getColumnWidth(i);
            sheet.setColumnWidth(i, currentWidth + 500);
        }
    }

    public static String generateExcelFilename(String baseFilename) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");
        String timestamp = LocalDateTime.now().format(formatter);
        
        return baseFilename + "_" + timestamp + ".xlsx";
    }
} 