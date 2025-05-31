package com.example.demo.service;


import com.example.demo.entity.ManualNotification;
import com.example.demo.entity.Resident;
import com.example.demo.repository.ManualNotificationRepository;
import com.example.demo.repository.ResidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
public class ManualNotificationService {
    @Autowired
    ResidentRepository residentRepository;

    private final ManualNotificationRepository manualNotificationRepository;

    @Autowired
    public ManualNotificationService(ManualNotificationRepository manualNotificationRepository) {
        this.manualNotificationRepository = manualNotificationRepository;
    }

    public List<ManualNotification> getAllManualNotifications() {
        return manualNotificationRepository.findAll();
    }

    public ManualNotification createManualNotification(List<Long> residentIds, String message) {
        ManualNotification manualNotification = new ManualNotification();
        List<Resident> residents = residentRepository.findAllById(residentIds);
        manualNotification.setResidents(residents);
        manualNotification.setMessage(message);
        manualNotification.setCreatedAt(LocalDateTime.now());

        return manualNotificationRepository.save(manualNotification);
    }
}
