package com.example.demo.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.FIELD}) // Áp dụng cho trường dữ liệu
@Retention(RetentionPolicy.RUNTIME) // Chạy trong runtime
@Constraint(validatedBy = UniqueEmailValidator.class) // Liên kết với validator
public @interface UniqueEmail {
    String message() default "Email already exists"; // Thông báo lỗi mặc định

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
