package itmo.aulouu.is.dao;

import itmo.aulouu.is.model.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
    boolean existsByXAndYAndZ(double x, Integer y, double z);

    boolean existsByName(String name);

    boolean existsByXAndYAndZAndName(double x, Integer y, double z, String name);

    Location findByName(String name);
}
