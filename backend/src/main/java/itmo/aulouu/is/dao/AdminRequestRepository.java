package itmo.aulouu.is.dao;

import itmo.aulouu.is.model.AdminRequest;
import itmo.aulouu.is.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminRequestRepository extends JpaRepository<AdminRequest, Long> {
    boolean existsByUser(User user);
}
