package itmo.aulouu.is.dao;

import itmo.aulouu.is.model.ImportHistory;
import itmo.aulouu.is.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ImportHistoryRepository extends JpaRepository<ImportHistory, Long> {
    Page<ImportHistory> findAllByUser(User user, Pageable pageable);

    Page<ImportHistory> findAll(Pageable pageable);

    Optional<ImportHistory> findById(Long id);
}
