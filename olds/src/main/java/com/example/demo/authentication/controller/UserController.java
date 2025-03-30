package com.example.demo.authentication.controller;

import com.example.demo.authentication.entity.Resident;
import com.example.demo.authentication.entity.User;
import com.example.demo.authentication.service.UserService;
import com.example.demo.authentication.service.ResidentService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@Controller
@RequestMapping("/user")
public class UserController {
    @Autowired
    private UserService userService;

    @Autowired
    private ResidentService residentService;

    @GetMapping("/home")
    public String home(Model model, Principal principal) {
        String username = principal.getName();

        User user = userService.findByName(username);

        Resident resident = residentService.findById(user.getResidentId());

        model.addAttribute("username", user.getName());
        model.addAttribute("resident", resident);

        return "user-home";
    }

    @GetMapping("/change-password")
    public String changePassword(Model model, Principal principal) {
        User user = userService.findByName(principal.getName());
        model.addAttribute("userId", user.getId());
        return "change-password";
    }

    @PostMapping("/change-password")
    @ResponseBody
    public String changePassword(@RequestParam Long userId,
                                 @RequestParam String oldPassword,
                                 @RequestParam String newPassword) {
        return userService.changePassword(userId, oldPassword, newPassword);
    }
}
