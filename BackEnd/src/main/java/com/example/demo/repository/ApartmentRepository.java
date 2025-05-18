package com.example.demo.repository;
import com.example.demo.entity.Apartment;
import com.example.demo.enums.ApartmentStatus;
import com.example.demo.enums.ApartmentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApartmentRepository extends JpaRepository<Apartment, Long>, JpaSpecificationExecutor<Apartment> {
    boolean existsByApartmentNumber(String apartmentNumber);
    @Query("SELECT a FROM Apartment a WHERE a.apartmentNumber = :apartmentNumber")
    Apartment findByApartmentNumber(@Param("apartmentNumber") String apartmentNumber);
    Optional<Apartment> findById(Long apartmentId);
    @Query("SELECT a FROM Apartment a WHERE :residentId MEMBER OF a.residentIds")
    List<Apartment> findByResidentIdsContaining(@Param("residentId") Long residentId);
    List<Apartment> findByFloor(Integer floorNumber);
    List<Apartment> findByApartmentNumberContainingIgnoreCase(String apartmentNumber);
    List<Apartment> findByRoomNumberContainingIgnoreCase(String roomNumber);
    List<Apartment> findByFloorIn(List<Integer> floors);
    List<Apartment> findByAreaGreaterThanEqual(Double minArea);
    List<Apartment> findByAreaLessThanEqual(Double maxArea);
    List<Apartment> findByStatusIn(List<ApartmentStatus> statuses);
    List<Apartment> findByTypeIn(List<ApartmentType> types);
    @Query("SELECT a FROM Apartment a WHERE " +
           "(:apartmentNumber IS NULL OR LOWER(a.apartmentNumber) LIKE LOWER(CONCAT('%', :apartmentNumber, '%'))) AND " +
           "(:roomNumber IS NULL OR LOWER(a.roomNumber) LIKE LOWER(CONCAT('%', :roomNumber, '%'))) AND " +
           "(:minArea IS NULL OR a.area >= :minArea) AND " +
           "(:maxArea IS NULL OR a.area <= :maxArea)")
    List<Apartment> findByFilters(
        @Param("apartmentNumber") String apartmentNumber,
        @Param("roomNumber") String roomNumber,
        @Param("minArea") Double minArea,
        @Param("maxArea") Double maxArea
    );
}

