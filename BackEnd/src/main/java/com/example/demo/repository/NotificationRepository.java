package com.example.demo.repository;

import com.example.demo.entity.Notification;
import com.example.demo.entity.Resident;
import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByResidentOrderByCreatedAtDesc(Resident resident);
    int countByResidentAndReadFalse(Resident resident);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.resident = :resident AND n.read = false")
    void markAllAsRead(@Param("resident") Resident resident);

    List<Notification> findByResidentAndReadFalse(Resident resident);
}
