package itmo.aulouu.is_lab1.service;

import itmo.aulouu.is_lab1.Pagification;
import itmo.aulouu.is_lab1.dao.*;
import itmo.aulouu.is_lab1.dto.coordinates.*;
import itmo.aulouu.is_lab1.dto.location.LocationDTO;
import itmo.aulouu.is_lab1.dto.person.PersonDTO;
import itmo.aulouu.is_lab1.exceptions.CoordinatesAlreadyExistException;
import itmo.aulouu.is_lab1.exceptions.CoordinatesNotFoundException;
import itmo.aulouu.is_lab1.exceptions.ForbiddenException;
import itmo.aulouu.is_lab1.model.*;
import itmo.aulouu.is_lab1.security.jwt.JwtUtils;
import itmo.aulouu.is_lab1.exceptions.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CoordinatesService {
   private final CoordinatesRepository coordinatesRepository;
   private final PersonRepository personRepository;
   private final UserRepository userRepository;
   private final JwtUtils jwtUtils;
   private final SimpMessagingTemplate simpMessagingTemplate;

   public List<CoordinatesDTO> getCoordinates(int from, int size) {
      Pageable page = Pagification.createPageTemplate(from, size);
      List<Coordinates> coordinates = coordinatesRepository.findAll(page).getContent();
      return coordinates
            .stream()
            .map(coordinates1 -> new CoordinatesDTO(
                  coordinates1.getId(),
                  coordinates1.getX(),
                  coordinates1.getY(),
                  coordinates1.getAdminCanModify(),
                  coordinates1.getUser().getUsername()))
            .sorted(new Comparator<CoordinatesDTO>() {
               @Override
               public int compare(CoordinatesDTO o1, CoordinatesDTO o2) {
                  return o1.getId().compareTo(o2.getId());
               }
            })
            .toList();
   }

   public CoordinatesDTO createCoordinate(CreateCoordinatesDTO createCoordinatesDTO, HttpServletRequest request) {
      if (coordinatesRepository.existsByXAndY(
            createCoordinatesDTO.getX(),
            createCoordinatesDTO.getY()))
         throw new CoordinatesAlreadyExistException(String.format("Coordinates %d %d already exist",
               createCoordinatesDTO.getX(), createCoordinatesDTO.getY()));

      User user = findUserByRequest(request);

      Coordinates coordinates = Coordinates
            .builder()
            .x(createCoordinatesDTO.getX())
            .y(createCoordinatesDTO.getY())
            .user(user)
            .adminCanModify(createCoordinatesDTO.getAdminCanModify())
            .build();

      coordinates = coordinatesRepository.save(coordinates);
      simpMessagingTemplate.convertAndSend("/topic", "New coordinates added");
      return new CoordinatesDTO(
            coordinates.getId(),
            coordinates.getX(),
            coordinates.getY(),
            coordinates.getAdminCanModify(),
            coordinates.getUser().getUsername());
   }

   public CoordinatesDTO alterCoordinate(Long coordinatesId, AlterCoordinatesDTO alterCoordinatesDTO,
         HttpServletRequest request) {
      Coordinates coordinates = coordinatesRepository.findById(coordinatesId)
            .orElseThrow(() -> new CoordinatesNotFoundException(
                  String.format("Coordinates with id %d not found", coordinatesId)));
      if (!checkPermission(coordinates, request))
         throw new ForbiddenException(String.format("No access to coordinates with id %d", coordinatesId));

      coordinates.setX(alterCoordinatesDTO.getX());
      coordinates.setY(alterCoordinatesDTO.getY());
      if (alterCoordinatesDTO.getAdminCanModify() != null)
         coordinates.setAdminCanModify(alterCoordinatesDTO.getAdminCanModify());

      coordinates = coordinatesRepository.save(coordinates);
      simpMessagingTemplate.convertAndSend("/topic", "Coordinates updated");

      return new CoordinatesDTO(
            coordinates.getId(),
            coordinates.getX(),
            coordinates.getY(),
            coordinates.getAdminCanModify(),
            coordinates.getUser().getUsername());
   }

   public void deleteCoordinates(Long coordinatesId, HttpServletRequest request) {
      Coordinates coordinates = coordinatesRepository.findById(coordinatesId)
            .orElseThrow(() -> new CoordinatesNotFoundException(
                  String.format("Coordinates with id %d not found", coordinatesId)));
      if (!checkPermission(coordinates, request))
         throw new ForbiddenException(String.format("No access to coordinates with id %d", coordinatesId));

      List<Person> personsWithThisCoordinates = personRepository.findAllByCoordinates(coordinates);

      personRepository.deleteAll(personsWithThisCoordinates);
      coordinatesRepository.deleteById(coordinatesId);
      simpMessagingTemplate.convertAndSend("/topic", "Coordinates deleted");
   }

   private User findUserByRequest(HttpServletRequest request) {
      String username = jwtUtils.getUserNameFromJwtToken(jwtUtils.parseJwt(request));
      System.out.println("Username: " + username);
      return userRepository.findByUsername(username).get();
   }

   private boolean checkPermission(Coordinates coordinates, HttpServletRequest request) {
      String username = jwtUtils.getUserNameFromJwtToken(jwtUtils.parseJwt(request));
      User fromUser = userRepository.findByUsername(username).get();
      return coordinates.getUser().getUsername().equals(username) || fromUser.getRole() == Role.ADMIN &&
            coordinates.getAdminCanModify();
   }
}
