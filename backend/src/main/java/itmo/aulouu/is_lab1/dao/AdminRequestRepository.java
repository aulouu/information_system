package itmo.aulouu.is_lab1.dao;

import itmo.aulouu.is_lab1.model.AdminRequest;
import itmo.aulouu.is_lab1.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminRequestRepository extends JpaRepository<AdminRequest, Long> {
    boolean existsByUser(User user);
}
