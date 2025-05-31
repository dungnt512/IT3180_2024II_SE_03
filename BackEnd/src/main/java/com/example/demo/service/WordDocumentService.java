package com.example.demo.service;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.URI;
import java.net.URL;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

import javax.imageio.ImageIO;

import org.apache.poi.util.Units;
import org.apache.poi.xwpf.usermodel.ParagraphAlignment;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.apache.poi.xwpf.usermodel.XWPFTable;
import org.apache.poi.xwpf.usermodel.XWPFTableCell;
import org.apache.poi.xwpf.usermodel.XWPFTableRow;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.example.demo.entity.Bill;
import com.example.demo.entity.Invoice;

@Service
public class WordDocumentService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final NumberFormat CURRENCY_FORMAT = NumberFormat.getCurrencyInstance(Locale.forLanguageTag("vi-VN"));
    
//    @Value("${document.company.name}")
//    private String companyName;
//
//    @Value("${document.company.address}")
//    private String companyAddress;
//
//    @Value("${document.company.phone}")
//    private String companyPhone;
//
//    @Value("${document.company.email}")
//    private String companyEmail;
//
//    @Value("${document.invoice.title}")
//    private String invoiceTitle;
//
//    @Value("${document.management.name}")
//    private String managementName;
//
//    @Value("${document.management.signature}")
//    private String managementSignature;
//
//    @Value("${document.payment.note}")
//    private String paymentNote;
//
//    @Value("${document.payment.method}")
//    private String paymentMethod;

    public ByteArrayOutputStream createInvoiceDocument(Invoice invoice, List<Bill> bills) {
        try {
            XWPFDocument document = new XWPFDocument();
            
            addHeader(document, invoice);
            addInvoiceInfo(document, invoice);
            addBillsTable(document, bills, invoice);
            addFooter(document, invoice);
            
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            document.write(out);
            document.close();
            return out;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo hóa đơn: " + e.getMessage(), e);
        }
    }
    
    private void addHeader(XWPFDocument document, Invoice invoice) {
        XWPFParagraph title = document.createParagraph();
        title.setAlignment(ParagraphAlignment.CENTER);
        
        XWPFRun titleRun = title.createRun();
        // titleRun.setText(companyName);
        titleRun.setText("CHUNG CƯ BLUEMOON");

        titleRun.setBold(true);
        titleRun.setFontSize(18);
        titleRun.setFontFamily("Times New Roman");
        titleRun.addBreak();
        
        XWPFRun address = title.createRun();
        // address.setText("Địa chỉ: " + companyAddress);
        address.setText("Địa chỉ: Đại học Bách Khoa Hà Nội, 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội");

        address.setFontSize(11);
        address.addBreak();
        
        XWPFRun contactInfo = title.createRun();

        // contactInfo.setText("Điện thoại: " + companyPhone + " - Email: " + companyEmail);
        contactInfo.setText("Điện thoại: 0123456789 - Email: abc@gmail.com");
        contactInfo.setFontSize(11);
        contactInfo.addBreak();
        contactInfo.addBreak();
        
        // invoiceTitleRun.setText(invoiceTitle);
        
        XWPFRun invoiceTitleRun = title.createRun();
        invoiceTitleRun.setText("HÓA ĐƠN THANH TOÁN PHÍ DỊCH VỤ CHUNG CƯ");
        invoiceTitleRun.setBold(true);
        invoiceTitleRun.setFontSize(16);
        invoiceTitleRun.addBreak();

        XWPFRun invoiceNumber = title.createRun();
        invoiceNumber.setText("Số hóa đơn: " + invoice.getInvoiceNumber());
        invoiceNumber.setFontSize(12);
        invoiceNumber.addBreak();
        invoiceNumber.addBreak();
    }
    
    private void addInvoiceInfo(XWPFDocument document, Invoice invoice) {
        XWPFParagraph infoPara = document.createParagraph();
        infoPara.setAlignment(ParagraphAlignment.LEFT);
        
        XWPFRun infoRun = infoPara.createRun();
        infoRun.setFontFamily("Times New Roman");
        infoRun.setFontSize(12);
        
        infoRun.setText("Tên khách hàng: " + invoice.getResidentName());
        infoRun.addBreak();
        
        infoRun.setText("Căn hộ: " + invoice.getApartmentNumber());
        infoRun.addBreak();
        
        infoRun.setText("Ngày xuất hóa đơn: " + invoice.getCreatedAt().format(DATE_FORMATTER));
        infoRun.addBreak();
        
        infoRun.setText("Mã thanh toán: " + invoice.getPaymentReferenceCode());
        infoRun.addBreak();
        infoRun.addBreak();
    }
    
    private void addBillsTable(XWPFDocument document, List<Bill> bills, Invoice invoice) {
        XWPFTable table = document.createTable();
        
        XWPFTableRow headerRow = table.getRow(0);
        if (headerRow == null) headerRow = table.createRow();
        
        String[] headers = new String[]{"STT", "Loại phí", "Kỳ thanh toán", "Số tiền", "Ngày đến hạn"};
        
        for (int i = 0; i < headers.length; i++) {
            XWPFTableCell cell = headerRow.getCell(i);
            if (cell == null) cell = headerRow.createCell();
            
            XWPFParagraph paragraph = cell.getParagraphArray(0);
            if (paragraph == null) paragraph = cell.addParagraph();
            paragraph.setAlignment(ParagraphAlignment.CENTER);
            
            XWPFRun run = paragraph.createRun();
            run.setText(headers[i]);
            run.setBold(true);
            run.setFontSize(12);
            run.setFontFamily("Times New Roman");
        }
        
        for (int i = 0; i < bills.size(); i++) {
            Bill bill = bills.get(i);
            XWPFTableRow row = table.createRow();
            
            // STT
            row.getCell(0).setText(String.valueOf(i + 1));
            
            row.getCell(1).setText(bill.getBillType().toString());
            
            String period = bill.getDueDate().getMonth().toString() + "/" + bill.getDueDate().getYear();
            row.getCell(2).setText(period);
            
            row.getCell(3).setText(CURRENCY_FORMAT.format(bill.getAmount()));
            
            row.getCell(4).setText(bill.getDueDate().format(DATE_FORMATTER));
        }
        
        XWPFTableRow totalRow = table.createRow();
        totalRow.getCell(0).setText("");
        totalRow.getCell(1).setText("");
        totalRow.getCell(2).setText("TỔNG CỘNG:");
        
        XWPFParagraph totalPara = totalRow.getCell(2).getParagraphArray(0);
        totalPara.getRuns().get(0).setBold(true);
        
        totalRow.getCell(3).setText(CURRENCY_FORMAT.format(invoice.getTotalAmount()));
        totalRow.getCell(4).setText("");
        
        XWPFParagraph amountPara = totalRow.getCell(3).getParagraphArray(0);
        amountPara.getRuns().get(0).setBold(true);
    }
    
    private void addFooter(XWPFDocument document, Invoice invoice) {
        XWPFParagraph footerPara = document.createParagraph();
        footerPara.setAlignment(ParagraphAlignment.LEFT);
        
        XWPFRun footerRun = footerPara.createRun();
        footerRun.setFontFamily("Times New Roman");
        footerRun.setFontSize(12);
        footerRun.addBreak();
        
        // footerRun.setText("Hình thức thanh toán: " + paymentMethod);
        footerRun.setText("Hình thức thanh toán: Chuyển khoản ngân hàng");

        footerRun.addBreak();
        
        footerRun.setText("Nội dung chuyển khoản: " + invoice.getPaymentReferenceCode());
        footerRun.addBreak();
        footerRun.addBreak();
        
        footerRun.setText("Quét mã QR để thanh toán:");
        footerRun.addBreak();
        
        if (invoice.getQrCodeUrl() != null && !invoice.getQrCodeUrl().isEmpty()) {
            try {
                URL url = URI.create(invoice.getQrCodeUrl()).toURL();
                BufferedImage image = ImageIO.read(url);
                
                ByteArrayOutputStream os = new ByteArrayOutputStream();
                ImageIO.write(image, "png", os);
                InputStream is = new ByteArrayInputStream(os.toByteArray());
                
                footerRun.addPicture(is, XWPFDocument.PICTURE_TYPE_PNG, "QR Code", Units.toEMU(150), Units.toEMU(150));
            } catch (Exception e) {
                footerRun.setText("(Không thể hiển thị mã QR)");
            }
        } else {
            footerRun.setText("(Không có mã QR)");
        }
        
        footerRun.addBreak();
        footerRun.addBreak();
        
        // footerRun.setText(paymentNote);
        footerRun.setText("Vui lòng thanh toán trước ngày đến hạn. Cảm ơn quý cư dân.");

        footerRun.addBreak();
        
        XWPFParagraph signaturePara = document.createParagraph();
        signaturePara.setAlignment(ParagraphAlignment.RIGHT);
        
        XWPFRun signatureRun = signaturePara.createRun();
        signatureRun.setFontFamily("Times New Roman");
        signatureRun.setFontSize(12);
        // signatureRun.setText(managementName);
        signatureRun.setText("Ban quản lý");

        signatureRun.addBreak();
        // signatureRun.setText(managementSignature);
        signatureRun.setText("Chung cư BlueMoon");
    }
} 