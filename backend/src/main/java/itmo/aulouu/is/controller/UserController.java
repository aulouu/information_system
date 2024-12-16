package itmo.aulouu.is.controller;

import itmo.aulouu.is.model.Role;
import itmo.aulouu.is.service.UserService;
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
