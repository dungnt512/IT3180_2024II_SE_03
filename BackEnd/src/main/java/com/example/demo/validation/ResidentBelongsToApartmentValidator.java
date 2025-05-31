package com.example.demo.validation;

import com.example.demo.entity.Apartment;
import com.example.demo.repository.ApartmentRepository;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.BeanWrapperImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ResidentBelongsToApartmentValidator implements ConstraintValidator<ResidentBelongsToApartment, Object> {
    @Autowired
    private ApartmentRepository apartmentRepository;
    
    private String apartmentNumberField;
    private String residentIdField;
    
    @Override
    public void initialize(ResidentBelongsToApartment constraintAnnotation) {
        this.apartmentNumberField = constraintAnnotation.apartmentNumberField();
        this.residentIdField = constraintAnnotation.residentIdField();
    }

    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        try {
            Object apartmentNumberValue = new BeanWrapperImpl(value).getPropertyValue(apartmentNumberField);
            Object residentIdValue = new BeanWrapperImpl(value).getPropertyValue(residentIdField);
            
            if (apartmentNumberValue == null || residentIdValue == null) {
                return false; 
            }
            
            String apartmentNumber = apartmentNumberValue.toString();
            Long residentId = Long.valueOf(residentIdValue.toString());
            
            Apartment apartment = apartmentRepository.findByApartmentNumber(apartmentNumber);
            if (apartment == null) {
                return false; 
            }
            
            return apartment.getResidentIds().contains(residentId);
        } catch (Exception e) {
            return false;
        }
    }
} 