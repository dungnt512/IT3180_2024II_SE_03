package com.example.demo.service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.net.URI;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.entity.Bill;
import com.example.demo.entity.Invoice;
import com.itextpdf.text.Chunk;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.Image;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.Rectangle;
import com.itextpdf.text.pdf.BaseFont;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;

import fr.opensagres.poi.xwpf.converter.pdf.PdfConverter;
import fr.opensagres.poi.xwpf.converter.pdf.PdfOptions;

@Service
public class PdfDocumentService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final NumberFormat CURRENCY_FORMAT = NumberFormat.getCurrencyInstance(Locale.forLanguageTag("vi-VN"));

    @Autowired
    private WordDocumentService wordDocumentService;

    private Font createVietnameseFont(String fontName, int size, int style) {
        try {
            Font f = new Font(BaseFont.createFont("src/main/resources/fonts/" + fontName, 
                                BaseFont.IDENTITY_H, BaseFont.EMBEDDED), size, style);
            return f;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo font: " + e.getMessage(), e);
        }
    }

    public ByteArrayOutputStream createPdfFromWord(Invoice invoice, List<Bill> bills) {
        try {
            ByteArrayOutputStream docxOutput = wordDocumentService.createInvoiceDocument(invoice, bills);
            
            ByteArrayInputStream docxInputStream = new ByteArrayInputStream(docxOutput.toByteArray());
            XWPFDocument document = new XWPFDocument(docxInputStream);
            
            ByteArrayOutputStream pdfOutput = new ByteArrayOutputStream();
            PdfOptions options = PdfOptions.create();
            PdfConverter.getInstance().convert(document, pdfOutput, options);
            
            document.close();
            
            return pdfOutput;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo PDF từ Word: " + e.getMessage(), e);
        }
    }

    public ByteArrayOutputStream createInvoicePdfDirectly(Invoice invoice, List<Bill> bills) {
        try {
            ByteArrayOutputStream pdfOutput = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, pdfOutput);
            
            document.open();
            
            addHeader(document, invoice);
            
            addInvoiceInfo(document, invoice);
            
            addBillsTable(document, bills);
            
            addFooter(document, invoice);
            
            document.close();
            
            return pdfOutput;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo PDF: " + e.getMessage(), e);
        }
    }
    
    private void addHeader(Document document, Invoice invoice) throws DocumentException {
        // Font titleFont = new Font(Font.FontFamily.TIMES_ROMAN, 18, Font.BOLD);
        // Font normalFont = new Font(Font.FontFamily.TIMES_ROMAN, 11);
        // Font invoiceTitleFont = new Font(Font.FontFamily.TIMES_ROMAN, 16, Font.BOLD);

        Font titleFont = createVietnameseFont("vuTimes.ttf", 18, Font.BOLD);
        Font normalFont = createVietnameseFont("vuTimes.ttf", 11, Font.NORMAL);
        Font invoiceTitleFont = createVietnameseFont("vuTimes.ttf", 16, Font.BOLD);

        
        Paragraph title = new Paragraph("CHUNG CƯ BLUEMOON", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
        
        Paragraph address = new Paragraph("Địa chỉ: Đại học Bách Khoa Hà Nội, 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội", normalFont);
        address.setAlignment(Element.ALIGN_CENTER);
        document.add(address);
        
        Paragraph contactInfo = new Paragraph("Điện thoại: 0123456789 - Email: abc@gmail.com", normalFont);
        contactInfo.setAlignment(Element.ALIGN_CENTER);
        document.add(contactInfo);
        
        document.add(Chunk.NEWLINE);
        
        Paragraph invoiceTitle = new Paragraph("HÓA ĐƠN THANH TOÁN PHÍ DỊCH VỤ CHUNG CƯ", invoiceTitleFont);
        invoiceTitle.setAlignment(Element.ALIGN_CENTER);
        document.add(invoiceTitle);
        
        Paragraph invoiceNumber = new Paragraph("Số hóa đơn: " + invoice.getInvoiceNumber(), normalFont);
        invoiceNumber.setAlignment(Element.ALIGN_CENTER);
        document.add(invoiceNumber);
        
        document.add(Chunk.NEWLINE);
    }
    
    private void addInvoiceInfo(Document document, Invoice invoice) throws DocumentException {
        // Font normalFont = new Font(Font.FontFamily.TIMES_ROMAN, 12);
        Font normalFont = createVietnameseFont("vuTimes.ttf", 12, Font.NORMAL);
        
        Paragraph info = new Paragraph();
        info.setFont(normalFont);
        info.add("Tên khách hàng: " + invoice.getResidentName() + "\n");
        info.add("Căn hộ: " + invoice.getApartmentNumber() + "\n");
        info.add("Ngày xuất hóa đơn: " + invoice.getCreatedAt().format(DATE_FORMATTER) + "\n");
        info.add("Ngày đến hạn: " + (invoice.getDueDate() != null ? invoice.getDueDate().format(DATE_FORMATTER) : "N/A") + "\n");
        info.add("Mã thanh toán: " + invoice.getPaymentReferenceCode() + "\n\n");
        
        document.add(info);
    }
    
    private void addBillsTable(Document document, List<Bill> bills) throws DocumentException {
        PdfPTable table = new PdfPTable(5); 
        table.setWidthPercentage(100);
        
        float[] columnWidths = {0.5f, 1.5f, 1.0f, 1.5f, 1.0f};
        table.setWidths(columnWidths);
        
        // Font headerFont = new Font(Font.FontFamily.TIMES_ROMAN, 12, Font.BOLD);
        // Font cellFont = new Font(Font.FontFamily.TIMES_ROMAN, 12);
        // Font boldFont = new Font(Font.FontFamily.TIMES_ROMAN, 12, Font.BOLD);
        Font headerFont = createVietnameseFont("vuTimes.ttf", 12, Font.BOLD);
        Font cellFont = createVietnameseFont("vuTimes.ttf", 12, Font.NORMAL);
        Font boldFont = createVietnameseFont("vuTimes.ttf", 12, Font.BOLD);

        
        String[] headers = new String[]{"STT", "Loại phí", "Kỳ thanh toán", "Số tiền", "Ngày đến hạn"};
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, headerFont));
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setPadding(5);
            table.addCell(cell);
        }
        
        double totalAmount = 0;
        for (int i = 0; i < bills.size(); i++) {
            Bill bill = bills.get(i);
            
            PdfPCell cell1 = new PdfPCell(new Phrase(String.valueOf(i + 1), cellFont));
            cell1.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(cell1);
            
            table.addCell(new Phrase(bill.getBillType().toString(), cellFont));
            
            String period = bill.getDueDate().getMonth().toString() + "/" + bill.getDueDate().getYear();
            table.addCell(new Phrase(period, cellFont));
            
            PdfPCell cellAmount = new PdfPCell(new Phrase(CURRENCY_FORMAT.format(bill.getAmount()), cellFont));
            cellAmount.setHorizontalAlignment(Element.ALIGN_RIGHT);
            table.addCell(cellAmount);
            
            table.addCell(new Phrase(bill.getDueDate().format(DATE_FORMATTER), cellFont));
            
            totalAmount += bill.getAmount();
        }
        
        PdfPCell emptyCell = new PdfPCell(new Phrase(""));
        emptyCell.setBorder(Rectangle.NO_BORDER);
        table.addCell(emptyCell);
        table.addCell(emptyCell);
        
        PdfPCell totalLabel = new PdfPCell(new Phrase("TỔNG CỘNG:", boldFont));
        totalLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(totalLabel);
        
        PdfPCell totalValue = new PdfPCell(new Phrase(CURRENCY_FORMAT.format(totalAmount), boldFont));
        totalValue.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(totalValue);
        
        table.addCell(emptyCell);
        
        document.add(table);
        document.add(Chunk.NEWLINE);
    }
    
    private void addFooter(Document document, Invoice invoice) throws DocumentException {
        // Font normalFont = new Font(Font.FontFamily.TIMES_ROMAN, 12);
        // Font boldFont = new Font(Font.FontFamily.TIMES_ROMAN, 12, Font.BOLD);
        Font normalFont = createVietnameseFont("vuTimes.ttf", 12, Font.NORMAL);
        Font boldFont = createVietnameseFont("vuTimes.ttf", 12, Font.BOLD);
        
        Paragraph paymentInfo = new Paragraph();
        paymentInfo.setFont(normalFont);
        paymentInfo.add("Hình thức thanh toán: Chuyển khoản ngân hàng\n");
        paymentInfo.add("Nội dung chuyển khoản: " + invoice.getPaymentReferenceCode() + "\n\n");
        paymentInfo.add("Quét mã QR để thanh toán:\n");
        document.add(paymentInfo);
        
        if (invoice.getQrCodeUrl() != null && !invoice.getQrCodeUrl().isEmpty()) {
            try {
                Image qrImage = Image.getInstance(URI.create(invoice.getQrCodeUrl()).toURL());
                qrImage.scaleToFit(150, 150);
                document.add(qrImage);
            } catch (Exception e) {
                document.add(new Paragraph("(Không thể hiển thị mã QR)", normalFont));
            }
        } else {
            document.add(new Paragraph("(Không có mã QR)", normalFont));
        }
        
        document.add(Chunk.NEWLINE);
        document.add(new Paragraph("Vui lòng thanh toán trước ngày đến hạn. Cảm ơn quý cư dân.", normalFont));
        document.add(Chunk.NEWLINE);
        
        Paragraph signature = new Paragraph();
        signature.setAlignment(Element.ALIGN_RIGHT);
        signature.setFont(normalFont);
        signature.add("Ban quản lý\n");
        signature.add("Chung cư BlueMoon");
        document.add(signature);
    }
} 