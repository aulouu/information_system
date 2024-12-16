package itmo.aulouu.is.service;

import itmo.aulouu.is.Pagification;
import itmo.aulouu.is.dao.LocationRepository;
import itmo.aulouu.is.dao.PersonRepository;
import itmo.aulouu.is.dao.UserRepository;
import itmo.aulouu.is.dto.location.AlterLocationDTO;
import itmo.aulouu.is.dto.location.CreateLocationDTO;
import itmo.aulouu.is.dto.location.LocationDTO;
import itmo.aulouu.is.exceptions.ForbiddenException;
import itmo.aulouu.is.exceptions.LocationAlreadyExistException;
import itmo.aulouu.is.exceptions.LocationNotFoundException;
import itmo.aulouu.is.model.Location;
import itmo.aulouu.is.model.Person;
import itmo.aulouu.is.model.Role;
import itmo.aulouu.is.model.User;
import itmo.aulouu.is.security.jwt.JwtUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LocationService {
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;
    private final PersonRepository personRepository;
    private final JwtUtils jwtUtils;
    private final SimpMessagingTemplate simpMessagingTemplate;

    public List<LocationDTO> getLocations(int from, int size) {
        Pageable page = Pagification.createPageTemplate(from, size);
        List<Location> location = locationRepository.findAll(page).getContent();
        return location
                .stream()
                .map(location1 -> new LocationDTO(
                        location1.getId(),
                        location1.getX(),
                        location1.getY(),
                        location1.getZ(),
                        location1.getName(),
                        location1.getAdminCanModify(),
                        location1.getUser().getUsername()))
                .sorted(new Comparator<LocationDTO>() {
                    @Override
                    public int compare(LocationDTO o1, LocationDTO o2) {
                        return o1.getId().compareTo(o2.getId());
                    }
                })
                .toList();
    }

    @Transactional
    public LocationDTO createLocation(CreateLocationDTO createLocationDTO, HttpServletRequest request) {
        if (locationRepository.existsByName(createLocationDTO.getName()))
            throw new LocationAlreadyExistException(String.format("Location %s already exists",
                    createLocationDTO.getName()));
        if (locationRepository.existsByXAndYAndZ(
                createLocationDTO.getX(),
                createLocationDTO.getY(),
                createLocationDTO.getZ()))
            throw new LocationAlreadyExistException(String.format("Location %.3f %d %.3f already exist",
                    createLocationDTO.getX(), createLocationDTO.getY(), createLocationDTO.getZ()));

        User user = findUserByRequest(request);

        Location location = Location
                .builder()
                .x(createLocationDTO.getX())
                .y(createLocationDTO.getY())
                .z(createLocationDTO.getZ())
                .adminCanModify(createLocationDTO.getAdminCanModify())
                .name(createLocationDTO.getName())
                .user(user)
                .build();

        location = locationRepository.save(location);
        simpMessagingTemplate.convertAndSend("/topic", "New location added");
        return new LocationDTO(
                location.getId(),
                location.getX(),
                location.getY(),
                location.getZ(),
                location.getName(),
                location.getAdminCanModify(),
                location.getUser().getUsername());
    }

    @Transactional
    public LocationDTO alterLocation(Long locationId, AlterLocationDTO alterLocationDTO,
                                     HttpServletRequest request) {
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new LocationNotFoundException(
                        String.format("Location with id %d not found", locationId)));
        if (!checkPermission(location, request))
            throw new ForbiddenException(String.format("No access to location with id %d", locationId));

        if (alterLocationDTO.getY() != null)
            location.setY(alterLocationDTO.getY());
        if (alterLocationDTO.getName() != null)
            location.setName(alterLocationDTO.getName());
        if (alterLocationDTO.getAdminCanModify() != null)
            location.setAdminCanModify(alterLocationDTO.getAdminCanModify());
        location.setX(alterLocationDTO.getX());
        location.setZ(alterLocationDTO.getZ());

        location = locationRepository.save(location);
        simpMessagingTemplate.convertAndSend("/topic", "Location updated");

        return new LocationDTO(
                location.getId(),
                location.getX(),
                location.getY(),
                location.getZ(),
                location.getName(),
                location.getAdminCanModify(),
                location.getUser().getUsername());
    }

    @Transactional
    public void deleteLocation(Long locationId, HttpServletRequest request) {
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new LocationNotFoundException(
                        String.format("Location with id %d not found", locationId)));
        if (!checkPermission(location, request))
            throw new ForbiddenException(String.format("No access to location with id %d", locationId));

        List<Person> personsWithThisLocation = personRepository.findAllByLocation(location);

        personRepository.deleteAll(personsWithThisLocation);
        locationRepository.deleteById(locationId);
        simpMessagingTemplate.convertAndSend("/topic", "Location deleted");
    }

    private User findUserByRequest(HttpServletRequest request) {
        String username = jwtUtils.getUserNameFromJwtToken(jwtUtils.parseJwt(request));
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(
                        String.format("Username %s not found", username)));
    }

    private boolean checkPermission(Location location, HttpServletRequest request) {
        String username = jwtUtils.getUserNameFromJwtToken(jwtUtils.parseJwt(request));
        User fromUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(
                        String.format("Username %s not found", username)));
        return location.getUser().getUsername().equals(username) || fromUser.getRole() == Role.ADMIN &&
                location.getAdminCanModify();
    }
}
