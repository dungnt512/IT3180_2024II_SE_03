package com.example.demo.authentication.entity;

import jakarta.persistence.*;
import com.example.demo.authentication.enums.Role;
import lombok.*;

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
    private String apartmentId;

    @Enumerated(EnumType.STRING)
    private Role role = Role.RESIDENT;

    /*
    @ManyToOne
    @JoinColumn(name = "apartment_id")
    private Apartment apartment;
    */
}

