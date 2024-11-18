package itmo.aulouu.is_lab1.dao;

import itmo.aulouu.is_lab1.model.Coordinates;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CoordinatesRepository extends JpaRepository<Coordinates, Long> {
   boolean existsByXAndY(int x, int y);
}
