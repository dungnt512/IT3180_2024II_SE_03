package com.example.demo.repository;

import com.example.demo.entity.Resident;
import com.example.demo.enums.ResidentStatus;
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

    List<Resident> findByFullNameContainingIgnoreCase(String name);

    @Query("SELECT r FROM Resident r JOIN r.apartmentNumbers a WHERE a LIKE %:apartmentNumber%")
    List<Resident> findByApartmentNumberContaining(@Param("apartmentNumber") String apartmentNumber);

    @Query("SELECT DISTINCT r FROM Resident r JOIN r.apartmentNumbers a JOIN Apartment apt ON a = apt.apartmentNumber WHERE apt.floor = :floor")
    List<Resident> findByFloor(@Param("floor") Integer floor);

    List<Resident> findByStatusIn(List<ResidentStatus> statuses);
    List<Resident> findAll();

    @Query("SELECT r FROM Resident r WHERE r.email = :username")
    Resident findByUsername(@Param("username") String username);

    @Query("SELECT r FROM Resident r WHERE r.email = :email")
    Resident findByEmail(@Param("email") String email);

    @Query("SELECT r FROM Resident r WHERE r.phone = :phoneNumber")
    Resident findByPhoneNumber(@Param("phoneNumber") String phoneNumber);

    @Query("SELECT r FROM Resident r JOIN r.apartmentNumbers a WHERE a = :apartmentNumber")
    List<Resident> findByApartmentNumber(@Param("apartmentNumber") String apartmentNumber);

    List<Resident> findAllById(Iterable<Long> ids);

    @Query("SELECT r FROM Resident r JOIN User u ON r.id = u.residentId " +
           "WHERE LOWER(u.name) LIKE LOWER(CONCAT('%', :username, '%'))")
    List<Resident> findByUserNameContaining(@Param("username") String username);
    
    @Query("SELECT r FROM Resident r WHERE EXISTS (SELECT 1 FROM r.apartmentNumbers a " +
           "WHERE a IN :apartments)")
    List<Resident> findByApartmentNumbersIn(@Param("apartments") List<String> apartments);
    
    // Cập nhật phương thức tìm theo nhiều tầng
    @Query("SELECT DISTINCT r FROM Resident r JOIN r.apartmentNumbers a JOIN Apartment apt ON a = apt.apartmentNumber WHERE apt.floor IN :floors")
    List<Resident> findByFloors(@Param("floors") List<Integer> floors);
    
    @Query("SELECT r FROM Resident r JOIN User u ON r.id = u.residentId " +
           "WHERE u.role = :role")
    List<Resident> findByUserRole(@Param("role") String role);
    
    @Query("SELECT r FROM Resident r JOIN User u ON r.id = u.residentId " +
           "WHERE u.activation = :status")
    List<Resident> findByUserStatus(@Param("status") Boolean status);
    
    @Query("SELECT DISTINCT r FROM Resident r LEFT JOIN User u ON r.id = u.residentId " +
           "WHERE (:fullName IS NULL OR LOWER(r.fullName) LIKE LOWER(CONCAT('%', :fullName, '%'))) " +
           "AND (:username IS NULL OR (u IS NOT NULL AND LOWER(u.name) LIKE LOWER(CONCAT('%', :username, '%'))))")
    List<Resident> findByFilters(
        @Param("fullName") String fullName,
        @Param("username") String username
    );
}
