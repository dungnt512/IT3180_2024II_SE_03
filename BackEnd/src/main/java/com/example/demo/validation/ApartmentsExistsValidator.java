package com.example.demo.validation;

import com.example.demo.repository.ApartmentRepository;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class ApartmentsExistsValidator implements ConstraintValidator<ApartmentsExists, Set<String>> {
    @Autowired
    private ApartmentRepository apartmentRepository;
    @Override
    public void initialize(ApartmentsExists constraintAnnotation) {
        // You can use this method to initialize the validator with the annotation attributes
    }

    @Override
    public boolean isValid(Set<String> apartmentNumbers, ConstraintValidatorContext context) {
        if (apartmentNumbers == null) {
            return true;
        }
        for (String apartmentNumber : apartmentNumbers) {
            if (apartmentNumber == null || apartmentNumber.trim().isEmpty()) {
                return false;
            }

            if (!apartmentRepository.existsByApartmentNumber(apartmentNumber)) {
                return false;
            }
        }
        return true;
    }

}