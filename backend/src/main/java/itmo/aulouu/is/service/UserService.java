package itmo.aulouu.is.service;

import itmo.aulouu.is.dao.UserRepository;
import itmo.aulouu.is.model.Role;
import itmo.aulouu.is.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public Role getRoleByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(
                        String.format("Username %s not found", username)
                ));
        return user.getRole();
    }

}
