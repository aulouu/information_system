package itmo.aulouu.is_lab1.service;

import itmo.aulouu.is_lab1.exceptions.UserAlreadyExistException;
import itmo.aulouu.is_lab1.exceptions.UserNotFoundException;
import itmo.aulouu.is_lab1.security.jwt.JwtUtils;
import itmo.aulouu.is_lab1.dao.*;
import itmo.aulouu.is_lab1.dto.*;
import itmo.aulouu.is_lab1.model.*;
import itmo.aulouu.is_lab1.exceptions.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public AuthResponseDTO register(RegisterUserDTO registerUserDto) {
        if (userRepository.existsByUsername(registerUserDto.getUsername()))
            throw new UserAlreadyExistException(
                    String.format("Username %s already exists", registerUserDto.getUsername())
            );

        long userCount = userRepository.count();
        Role role = userCount == 0 ? Role.ADMIN : Role.USER;

        User user = User
                .builder()
                .username(registerUserDto.getUsername())
                .password(passwordEncoder.encode(registerUserDto.getPassword()))
                .role(role)
                .build();

        user = userRepository.save(user);

        String token = jwtUtils.generateJwtToken(user.getUsername());
        return new AuthResponseDTO(
                user.getUsername(),
                user.getRole(),
                token
        );
    }

    public AuthResponseDTO login(LoginUserDTO loginUserDto) {
        User user = userRepository.findByUsername(loginUserDto.getUsername())
                .orElseThrow(() -> new UserNotFoundException(
                        String.format("Username %s not found", loginUserDto.getUsername())
                ));

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginUserDto.getUsername(), loginUserDto.getPassword())
        );

        String token = jwtUtils.generateJwtToken(user.getUsername());
        return new AuthResponseDTO(
                user.getUsername(),
                user.getRole(),
                token
        );
    }

}
