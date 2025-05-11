package com.example.demo.exception;

public class ApartmentNotFoundException extends RuntimeException {
    public ApartmentNotFoundException(String apartmentNumber) {
        super("Không tìm thấy căn hộ với số: " + apartmentNumber);
    }
}