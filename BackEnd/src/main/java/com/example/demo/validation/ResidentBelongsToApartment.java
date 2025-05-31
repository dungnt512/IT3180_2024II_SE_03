package com.example.demo.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = ResidentBelongsToApartmentValidator.class)
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface ResidentBelongsToApartment {
    String message() default "Cư dân không thuộc căn hộ này";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
    
    String apartmentNumberField();
    String residentIdField();
} 