package com.example.demo.entity;

import jakarta.persistence.*;
import com.example.demo.enums.Role;
import lombok.*;

import java.util.List;
import java.util.Set;

@Entity
@Table(name = "residents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Resident {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;
    private String phone;
    private Long age;
    private String gender;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "resident_apartment_numbers", joinColumns = @JoinColumn(name = "resident_id"))
    @Column(name = "apartment_number")
    private Set<String> apartmentNumbers;

    @Enumerated(EnumType.STRING)
    private Role role = Role.RESIDENT;

    /*
    @ManyToOne
    @JoinColumn(name = "apartment_id")
    private Apartment apartment;
    */
}

