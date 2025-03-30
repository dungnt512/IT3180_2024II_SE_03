package com.example.demo.validation;

import com.example.demo.repository.ResidentRepository;
import com.example.demo.repository.UserRepository;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class UniqueEmailValidator implements ConstraintValidator<UniqueEmail, String> {

    @Autowired
    private ResidentRepository residentRepository; // Repository để kiểm tra email

    @Override
    public boolean isValid(String email, ConstraintValidatorContext context) {
        if (email == null) {
            return true; // Không kiểm tra nếu email là null (nếu cần, có thể dùng @NotNull riêng)
        }

        boolean isUnique = !residentRepository.existsByEmail(email);

        if (!isUnique) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Email already exists")
                    .addConstraintViolation();
        }

        return isUnique;
    }
}
