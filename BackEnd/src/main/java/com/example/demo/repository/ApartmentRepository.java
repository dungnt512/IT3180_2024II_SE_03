package com.example.demo.repository;
import com.example.demo.entity.Apartment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ApartmentRepository extends JpaRepository<Apartment, Long> {
    boolean existsByApartmentNumber(String apartmentNumber);
    Apartment findByApartmentNumber(String apartmentNumber);
    Optional<Apartment> findById(Long apartmentId);
}

