package com.example.demo.authentication.controller;

import com.example.demo.authentication.entity.User;
import com.example.demo.authentication.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@Controller
@RequestMapping("/admin")
public class AdminController {
    @Autowired
    private UserService userService;

    @GetMapping("home")
    public String adminHome(Model model) {
        List<User> users = userService.allUsers();

        model.addAttribute("users", users);

        return "admin-home";
    }

    @PostMapping("/activate/{id}")
    @ResponseBody
    public String activateUser(@PathVariable Long id) {
        boolean activated = userService.activateUser(id);
        return activated ? "success" : "error";
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
