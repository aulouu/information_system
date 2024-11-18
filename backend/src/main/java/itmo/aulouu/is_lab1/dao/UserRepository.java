package itmo.aulouu.is_lab1.dao;

import itmo.aulouu.is_lab1.model.Role;
import itmo.aulouu.is_lab1.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
   Optional<User> findByUsername(String username);

   boolean existsByUsername(String username);

   List<User> findAllByRole(Role role);
}
