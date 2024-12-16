package itmo.aulouu.is.service;

import itmo.aulouu.is.dao.UserRepository;
import itmo.aulouu.is.dto.AuthResponseDTO;
import itmo.aulouu.is.dto.LoginUserDTO;
import itmo.aulouu.is.dto.RegisterUserDTO;
import itmo.aulouu.is.exceptions.UserAlreadyExistException;
import itmo.aulouu.is.exceptions.UserNotFoundException;
import itmo.aulouu.is.model.Role;
import itmo.aulouu.is.model.User;
import itmo.aulouu.is.security.jwt.JwtUtils;
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
