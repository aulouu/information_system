package itmo.aulouu.is_lab1.dao;

import itmo.aulouu.is_lab1.model.Location;
import itmo.aulouu.is_lab1.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface PersonRepository extends JpaRepository<Person, Long> {
   boolean existsByName(String name);
   Person findByName(String name);

   List<Person> findAllByUser(User user);

//   List<Person> findByName(String name);

   List<Person> findAllByCoordinates(Coordinates coordinates);

   List<Person> findAllByLocation(Location location);

   @Query("SELECT p FROM Person p WHERE p.height = :value")
   List<Person> findAllPersonsByHeight(Integer value);

   @Query("SELECT p FROM Person p WHERE p.name LIKE :substring%")
   List<Person> findAllByNameStartsWith(String substring);

//   List<Person> findPersonsByBirthdayLessThan(String date);

   @Query("SELECT p FROM Person p WHERE p.hairColor = :hairColor")
   List<Person> findCountByHairColor(Color hairColor);

   @Query("SELECT p FROM Person p WHERE p.eyeColor = :eyeColor")
   List<Person> findCountByEyeColor(Color eyeColor);

}
