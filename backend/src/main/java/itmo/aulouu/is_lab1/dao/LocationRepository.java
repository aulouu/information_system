package itmo.aulouu.is_lab1.dao;

import itmo.aulouu.is_lab1.model.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
   boolean existsByXAndYAndZAndName(double x, Integer y, double z, String name);

   Location findByName(String name);
}
