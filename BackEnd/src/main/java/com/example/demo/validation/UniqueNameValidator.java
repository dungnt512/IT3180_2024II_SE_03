package com.example.demo.validation;

import com.example.demo.repository.UserRepository;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import lombok.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component

public class UniqueNameValidator implements ConstraintValidator<UniqueName, String> {
    private String message; // Lưu trữ thông báo lỗi từ annotation


    @Autowired
    private UserRepository userRepository; // Repository để truy vấn database

    @Override
    public void initialize(UniqueName constraintAnnotation) {
        this.message = constraintAnnotation.message();
    }

    @Override
    public boolean isValid(String name, ConstraintValidatorContext context) {
        if (name == null) {
            return true;
        }

        boolean isUnique = !userRepository.existsByName(name);

        if (!isUnique) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(message)
                    .addConstraintViolation();
        }

        return isUnique;
    }
}