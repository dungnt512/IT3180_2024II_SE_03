package com.example.demo.dto;

import com.example.demo.validation.ApartmentsExists;
import com.example.demo.validation.UniqueEmail;
import com.example.demo.validation.UniqueName;
import com.example.demo.validation.ValidPassword;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.Set;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class UserDTO {
    @NotBlank(message = "Name is required")
    @UniqueName(message = "Name already exists")
    private String name;

    @Size(min = 8, message = "Password must be at least 8 characters")
    @ValidPassword
    private String password;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @Min(value = 1, message = "Age must be at least 1")
    @Max(value = 120, message = "Age must be less than or equal to 120")
    private Long age;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "\\d{10}", message = "Phone must be 10 digits")
    private String phone;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @UniqueEmail(message = "Email already exists")
    private String email;

    @ApartmentsExists(message = "Apartment không tồn tại trong hệ thống")
    private Set<String> apartmentNumbers;
}