package com.example.demo.authentication.service;

import com.example.demo.authentication.dto.UserCreationRequest;
import com.example.demo.authentication.entity.Resident;
import com.example.demo.authentication.entity.User;
import com.example.demo.authentication.repository.ResidentRepository;
import com.example.demo.authentication.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ResidentRepository residentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public void addUser(UserCreationRequest request) {
        Resident resident = new Resident();
        resident.setFullName(request.getFullName());
        resident.setAge(request.getAge());
        resident.setPhone(request.getPhone());
        resident.setEmail(request.getEmail());
        resident.setApartmentId(request.getApartmentId());
        residentRepository.save(resident);

        User user = new User();
        user.setResidentId(resident.getId()); // Lấy ID sau khi lưu
        user.setName(request.getName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);
    }

    public boolean activateUser(Long id) {
        Optional<User> userOptional = userRepository.findById(id);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (!user.isActivation()) {  // Chỉ kích hoạt nếu chưa kích hoạt
                user.setActivation(true);
                userRepository.save(user);
                return true;
            }
        }
        return false;
    }

    public String changePassword(Long userId, String oldPassword, String newPassword) {
        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            return "error_user_not_found";
        }

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            return "error_wrong_old_password";
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return "success";
    }


    public User getUserByName(String username) {
        return userRepository.findByName(username);
    }

    public List<User> allUsers() {
        return userRepository.findAll();
    }

    public User findByName(String name) {
        return userRepository.findByName(name);
    }
}