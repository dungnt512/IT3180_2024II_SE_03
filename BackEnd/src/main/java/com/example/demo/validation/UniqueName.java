package com.example.demo.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.FIELD}) // Áp dụng cho trường dữ liệu
@Retention(RetentionPolicy.RUNTIME) // Chạy trong thời gian runtime
@Constraint(validatedBy = UniqueNameValidator.class) // Liên kết với validator
public @interface UniqueName {
    String message() default "Name already exists"; // Thông báo lỗi mặc định

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}