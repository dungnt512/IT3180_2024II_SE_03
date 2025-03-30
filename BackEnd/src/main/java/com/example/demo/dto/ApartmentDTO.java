package com.example.demo.dto;

import com.example.demo.validation.UniqueNumber;
import jakarta.validation.constraints.*;
import lombok.*;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ApartmentDTO {
    @NotBlank(message = "Số căn hộ là cần thiết")
    @UniqueNumber(message = "Số căn hộ đã tồn tại")
    private String apartmentNumber;

    @NotBlank(message = "Số phòng là cần thiết")
    @Min(value = 1, message = "vui lòng nhập vào số phòng hợp")
    private String roomNumber;

    @NotBlank(message = "Số tầng là cần thiết")
    @Min(value = 1, message = "vui lòng nhập vào số tầng hợp lệ")
    private Integer floor;

    @NotBlank(message = "Diện tích là cần thiết")
    @Min(value = 10, message = "vui lòng nhập vào diện tích hợp lệ")
    private Double area;
}
