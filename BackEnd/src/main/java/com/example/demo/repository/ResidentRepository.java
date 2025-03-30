package com.example.demo.repository;

import com.example.demo.entity.Resident;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface ResidentRepository extends JpaRepository<Resident, Long> {
    Resident findByFullName(String fullName);

    boolean existsByFullName(String fullName);

    boolean existsByEmail(String email);

    Optional<Resident> findById(Long Id);
    Set<Resident> findByIdIn(Set<Long> residentIds);

    @Modifying
    @Transactional
    @Query("UPDATE Resident r SET r.fullName = :fullName, r.email = :email, r.age = :age, r.phone = :phone WHERE r.id = :id")
    void updateResidentInfo(@Param("id") Long id,
                            @Param("fullName") String fullName,
                            @Param("email") String email,
                            @Param("age") int age,
                            @Param("phone") String phone);

    @Query("SELECT r FROM Resident r LEFT JOIN FETCH r.apartmentNumbers WHERE r.id = :id")
    Optional<Resident> findByIdWithApartments(@Param("id") Long id);
}