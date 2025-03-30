package com.example.demo.config;

import com.example.demo.entity.Resident;
import com.example.demo.entity.User;
import com.example.demo.repository.ResidentRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminUserInitializer implements CommandLineRunner {

    @Autowired
    private ResidentRepository residentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByName("admin")) {
            Resident adminResident = new Resident();
            adminResident.setFullName("Admin User");
            adminResident.setPhone("0123456789");
            adminResident.setEmail("admin@gmail.com");
            residentRepository.save(adminResident);

            User adminUser = new User();
            adminUser.setResidentId(adminResident.getId());
            adminUser.setName("admin");
            adminUser.setPassword(passwordEncoder.encode("1234567890"));
            adminUser.setRole("ADMIN");
            adminUser.setActivation(true);
            adminUser.setDateCreated("26/03/2025");;
            userRepository.save(adminUser);

            System.out.println("Admin user created successfully!");
        }
    }
}
