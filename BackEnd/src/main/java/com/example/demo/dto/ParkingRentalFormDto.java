package com.example.demo.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ParkingRentalFormDto {

    @NotNull(message = "Vui lòng chọn chỗ đỗ xe")
    private String parkingLotCode;

    @NotNull(message = "Ngày đến hạn không được để trống")
    @Future(message = "Ngày đến hạn phải sau ngày hôm nay")
    private LocalDate endDate;

    @NotNull(message = "Vui lòng chọn biển số xe")
    private String plate;
}