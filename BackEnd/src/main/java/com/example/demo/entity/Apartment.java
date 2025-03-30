package com.example.demo.entity;

import com.example.demo.enums.ApartmentStatus;
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

    @Column(name = "room_number", nullable = false, unique = true)
    private String roomNumber;

    private Integer floor;
    private Double area;
    private String dateCreated;

    @Enumerated(EnumType.STRING)
    private ApartmentStatus status;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "apartment_bills", joinColumns = @JoinColumn(name = "apartment_id"))
    @Column(name = "bill_id")
    private Set<Long> billIds;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "apartment_residents", joinColumns = @JoinColumn(name = "apartment_id"))
    @Column(name = "resident_id")
    private Set<Long> residentIds;
}
