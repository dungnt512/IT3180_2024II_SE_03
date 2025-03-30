package com.example.demo.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = ApartmentsExistsValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ApartmentsExists {
    String message() default "Apartment does not exist";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}