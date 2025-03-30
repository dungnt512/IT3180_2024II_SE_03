package com.example.demo.service;

import com.example.demo.dto.ResidentDTO;
import com.example.demo.entity.Resident;
import com.example.demo.repository.ResidentRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class ResidentService {
    @Autowired
    private ResidentRepository residentRepository;

    public Resident findById(Long id) {
        return residentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resident not found"));
    }
    public Resident findByIdWithApartments(Long id) {
        return residentRepository.findByIdWithApartments(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy resident với ID: " + id));
    }


    public Set<Resident> findByIdIn(Set<Long> residentIds) {
        return residentRepository.findByIdIn(residentIds);
    }

    public boolean deleteResident(Long id) {
        Resident resident = residentRepository.findById(id).orElse(null);
        if (resident == null) {
            return false;
        }
        residentRepository.delete(resident);
        return true;
    }

    public boolean updateResident(Long id, ResidentDTO user) {
        Resident resident = residentRepository.findById(id).orElse(null);
//        System.out.println(resident);
//        System.out.println(user);
        if (resident == null) {
            return false;
        }
        resident.setFullName(user.getFullName());
        resident.setAge(user.getAge());
        resident.setPhone(user.getPhone());
        resident.setApartmentNumbers(user.getApartmentNumbers());
        residentRepository.save(resident);
        return true;
    }
}