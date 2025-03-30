package com.example.demo.dto;

import com.example.demo.validation.UniqueName;
import jakarta.validation.constraints.*;
import lombok.*;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class UserCreationRequest {
    @NotBlank(message = "Name is required")
    @UniqueName(message = "Name already exists")
    private String name;

    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotBlank(message = "Fullname is required")
    private String fullName;

    @Min(value = 1, message = "Age must be at least 1")
    @Max(value = 120, message = "Age must be less than or equal to 120")
    private Long age;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "\\d{10}", message = "Phone must be 10 digits")
    private String phone;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "ApartmentId is required")
    private String apartmentId;
}