package com.example.demo.authentication.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import java.io.IOException;

@Configuration
@EnableWebSecurity
public class HomeSecurity {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/register", "/login", "/assets/**").permitAll()
                        .requestMatchers("/admin/**").hasRole("ADMIN") // Chỉ ADMIN mới truy cập được
                        .requestMatchers("/user/**").hasRole("USER") // Chỉ USER mới truy cập được
                        .anyRequest().authenticated()
                )
                .formLogin(form -> form
                        .loginPage("/login")
                        .successHandler(new AuthenticationSuccessHandler() {
                            @Override
                            public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                                                Authentication authentication) throws IOException, ServletException, IOException {
                                // Kiểm tra vai trò của người dùng
                                if (authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"))) {
                                    response.sendRedirect("/admin/home"); // Chuyển hướng ADMIN đến /admin/home
                                } else if (authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_USER"))) {
                                    response.sendRedirect("/user/home"); // Chuyển hướng USER đến /user/home
                                } else {
                                    response.sendRedirect("/home"); // Mặc định
                                }
                            }
                        })
                        .failureUrl("/login?error=true") // Chuyển hướng khi đăng nhập thất bại
                        .permitAll()
                )
                .csrf(csrf -> csrf.disable()); // Tạm thời vô hiệu hóa CSRF để debug

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}