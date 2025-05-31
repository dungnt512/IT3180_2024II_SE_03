package com.example.demo.entity;

import com.example.demo.enums.ApartmentStatus;
import com.example.demo.enums.ApartmentType;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.Set;

@Entity
@Table(name = "apartments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Apartment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "apartment_number", nullable = false, unique = true)
    private String apartmentNumber;

    @Column(name = "room_number", nullable = false, unique = false)
    private String roomNumber;

    private Integer floor;
    private Double area;

    @Enumerated(EnumType.STRING)
    private ApartmentStatus status = ApartmentStatus.VACANT;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "apartment_bills", joinColumns = @JoinColumn(name = "apartment_id"))
    @Column(name = "bill_id")
    private Set<Long> billIds;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "apartment_residents", joinColumns = @JoinColumn(name = "apartment_id"))
    @Column(name = "resident_id")
    private Set<Long> residentIds;

    @OneToMany(mappedBy = "apartment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ParkingRental> parkingRentals;

    @Enumerated(EnumType.STRING)
    private ApartmentType type;


}
