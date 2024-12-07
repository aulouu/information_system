package itmo.aulouu.is_lab1.controller;

import itmo.aulouu.is_lab1.model.Role;
import itmo.aulouu.is_lab1.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/user")
public class UserController {
    private final UserService userService;

    @GetMapping("/role/{username}")
    public Role getRoleByUsername(@PathVariable String username) {
        return userService.getRoleByUsername(username);
    }
}
