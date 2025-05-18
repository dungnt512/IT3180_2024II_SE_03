package com.example.demo.entity;

import com.example.demo.validation.ValidPassword;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Set;


@Entity
@Table(name = "manualNotifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ManualNotification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "manualNotification_residents",
            joinColumns = @JoinColumn(name = "manualNotification_id"),
            inverseJoinColumns = @JoinColumn(name = "resident_id")
    )
    private List<Resident> residents;

    @Column(nullable = false)
    private String message;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}