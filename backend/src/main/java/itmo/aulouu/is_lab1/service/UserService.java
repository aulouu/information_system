package itmo.aulouu.is_lab1.service;

import itmo.aulouu.is_lab1.dao.UserRepository;
import itmo.aulouu.is_lab1.model.Role;
import itmo.aulouu.is_lab1.model.User;
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
