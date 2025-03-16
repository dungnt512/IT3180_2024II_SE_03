package com.example.demo.authentication.config;

import com.example.demo.authentication.entity.Resident;
import com.example.demo.authentication.entity.User;
import com.example.demo.authentication.repository.ResidentRepository;
import com.example.demo.authentication.repository.UserRepository;
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
            userRepository.save(adminUser);

            System.out.println("Admin user created successfully!");
        }
    }
}
