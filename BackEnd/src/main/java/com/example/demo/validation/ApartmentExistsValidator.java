package com.example.demo.validation;

import com.example.demo.repository.ApartmentRepository;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ApartmentExistsValidator implements ConstraintValidator<ApartmentExists, String> {
    @Autowired
    private ApartmentRepository apartmentRepository;
    @Override
    public void initialize(ApartmentExists constraintAnnotation) {
        // You can use this method to initialize the validator with the annotation attributes
    }

    @Override
    public boolean isValid(String apartmentNumber, ConstraintValidatorContext context) {
        if (apartmentNumber == null || apartmentNumber.trim().isEmpty()) {
            return false;
        }

        if (!apartmentRepository.existsByApartmentNumber(apartmentNumber)) {
            return false;
        }

        return true;
    }
}