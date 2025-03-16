package com.example.demo.authentication.entity;

import com.example.demo.authentication.enums.ApartmentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

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

    @Column(name = "room_number", nullable = false, unique = true)
    private String roomNumber;

    private Integer floor;
    private Double area;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private Resident owner;

    @Enumerated(EnumType.STRING)
    private ApartmentStatus status;

    @OneToMany(mappedBy = "apartment")
    private List<Bill> bills;
}
