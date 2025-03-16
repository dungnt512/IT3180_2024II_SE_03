package com.example.demo.authentication.validation;

import com.example.demo.authentication.repository.UserRepository;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class UniqueNameValidator implements ConstraintValidator<UniqueName, String> {

    @Autowired
    private UserRepository userRepository; // Repository để truy vấn database

    @Override
    public void initialize(UniqueName constraintAnnotation) {
    }

    @Override
    public boolean isValid(String name, ConstraintValidatorContext context) {
        if (name == null) {
            return true;
        }

        boolean isUnique = !userRepository.existsByName(name);

        if (!isUnique) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Tên đã tồn tại trong hệ thống") // Thông báo lỗi tùy chỉnh
                    .addConstraintViolation();
        }

        return isUnique;
    }
}