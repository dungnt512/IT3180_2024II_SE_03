package com.example.demo.authentication.repository;

import com.example.demo.authentication.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByName(String name);
    boolean existsByName(String name);
}
