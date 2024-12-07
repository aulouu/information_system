package itmo.aulouu.is_lab1.dto;

import itmo.aulouu.is_lab1.model.Role;
import lombok.Getter;

@Getter
public class AuthResponseDTO {
    private final String tokenType = "Bearer ";
    private String username;
    private Role role;
    private String token;

    public AuthResponseDTO(String username, Role role, String token) {
        this.username = username;
        this.role = role;
        this.token = token;
    }
}