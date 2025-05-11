package com.example.demo.entity;

import com.example.demo.enums.ParkingLotStatus;
import com.example.demo.enums.ParkingType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "parking_lots")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ParkingLot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "lot_code", nullable = false, unique = true)
    private String lotCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private ParkingType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ParkingLotStatus status = ParkingLotStatus.AVAILABLE;

    @Column(name = "bien_so")
    private String plate = "";
}
