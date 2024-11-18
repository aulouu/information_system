package itmo.aulouu.is_lab1.dto;

import itmo.aulouu.is_lab1.model.Role;
import lombok.Getter;

@Getter
public class AuthResponseDTO {
    private String username;
    private Role role;
    private String token;
    private final String tokenType = "Bearer ";

    public AuthResponseDTO(String username, Role role, String token) {
        this.username = username;
        this.role = role;
        this.token = token;
    }
}