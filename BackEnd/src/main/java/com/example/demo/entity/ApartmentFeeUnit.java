package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "apartment_fee_units")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ApartmentFeeUnit {

    @Id
    private Long id;

    @Column(name = "apartment_price_per_m2", nullable = false)
    private Long apartmentPricePerM2;
    @Column(name = "service_fee_per_m2", nullable = false)
    private Long serviceFeePerM2;
    @Column(name = "motorbike_parking_fee_by_month", nullable = false)
    private Long motorbikeParkingFeeByMonth;
    @Column(name = "motorbike_parking_fee_by_hour", nullable = false)
    private Long motorbikeParkingFeeByHour;
    @Column(name = "car_parking_fee_by_month", nullable = false)
    private Long carParkingFeeByMonth;
    @Column(name = "car_parking_fee_by_hour", nullable = false)
    private Long carParkingFeeByHour;
    @Column(name = "water_fee_per_m3", nullable = false)
    private Long waterFeePerM3;
    @Column(name = "electricity_fee_per_kwh", nullable = false)
    private Long electricityFeePerKWh;
}
