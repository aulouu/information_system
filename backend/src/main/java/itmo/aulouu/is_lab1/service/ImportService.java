package itmo.aulouu.is_lab1.service;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.*;

import itmo.aulouu.is_lab1.Pagification;
import itmo.aulouu.is_lab1.dto.ImportHistoryDTO;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.web.multipart.MultipartFile;
import org.yaml.snakeyaml.Yaml;
import itmo.aulouu.is_lab1.dao.*;
import itmo.aulouu.is_lab1.exceptions.*;
import itmo.aulouu.is_lab1.model.*;
import itmo.aulouu.is_lab1.security.jwt.JwtUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(isolation = Isolation.REPEATABLE_READ, rollbackFor = Exception.class, propagation = Propagation.NESTED)
public class ImportService {
    private final CoordinatesRepository coordinatesRepository;
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;
    private final PersonRepository personRepository;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final JwtUtils jwtUtils;
    private final ImportHistoryRepository importHistoryRepository;
    private int importedCount = 0;

    public void importFile(MultipartFile file, HttpServletRequest request) throws IOException {
        importedCount = 0;
        Yaml yaml = new Yaml();
        InputStream inputStream = file.getInputStream();
        HashMap<String, List<HashMap<String, Object>>> data = yaml.load(inputStream);
        User user = findUserByRequest(request);
        if (data.containsKey("coordinates")) {
            List<HashMap<String, Object>> coordinatesList = data.get("coordinates");
            if (coordinatesList == null) {
                throw new IllegalArgumentException("Coordinates list is empty");
            }
            for (HashMap<String, Object> coordData : coordinatesList) {
                parseAndSaveCoordinate(coordData, user, false);
            }
        }
        if (data.containsKey("locations")) {
            List<HashMap<String, Object>> locationsList = data.get("locations");
            if (locationsList == null) {
                throw new IllegalArgumentException("Locations list is empty");
            }
            for (HashMap<String, Object> locationData : locationsList) {
                parseAndSaveLocation(locationData, user, false);
            }
        }
        if (data.containsKey("persons")) {
            List<HashMap<String, Object>> personsList = data.get("persons");
            if (personsList == null) {
                throw new IllegalArgumentException("Persons list is empty");
            }
            for (HashMap<String, Object> personData : personsList) {
                parseAndSavePerson(personData, user, false);
            }
        }
        simpMessagingTemplate.convertAndSend("/topic", "Import completed");
        ImportHistory importHistory = ImportHistory.builder().user(user).importedCount(importedCount)
                .status(OperationStatus.SUCCESS).importTime(LocalDateTime.now()).build();
        importHistoryRepository.save(importHistory);
    }

    private Coordinates parseAndSaveCoordinate(HashMap<String, Object> coordData, User user, boolean inner) {
        if (!coordData.containsKey("x") || !coordData.containsKey("adminCanModify")) {
            throw new IllegalArgumentException("Coordinate data is missing. X and adminCanModify are required");
        }
        int x;
        try {
            x = ((Number) coordData.get("x")).intValue();
        } catch (ClassCastException e) {
            throw new IllegalArgumentException("Invalid data type for x coordinate. Expected a Integer.", e);
        }
        Optional<Integer> y = Optional.empty();
        if (coordData.containsKey("y")) {
            try {
                y = Optional.of(((Number) coordData.get("y")).intValue());
            } catch (ClassCastException e) {
                throw new IllegalArgumentException("Invalid data type for y coordinate. Expected a Integer.", e);
            }
        }
        Boolean adminCanModify = parseAdminCanModify(coordData, user);
        Coordinates coordinate = new Coordinates();
        coordinate.setX(x);
        if (y.isPresent()) {
            coordinate.setY(y.get());
        } else {
            coordinate.setY(0);
        }
        coordinate.setAdminCanModify(adminCanModify);
        coordinate.setUser(user);
        if (coordinatesRepository.existsByXAndY(
                coordinate.getX(),
                coordinate.getY())) {
            if (!inner) {
                throw new CoordinatesAlreadyExistException(String.format("Coordinates %d %d already exist",
                        coordinate.getX(), coordinate.getY()));
            } else {
                System.out.println("Coordinates already exists. Returning existing coordinates");
                return coordinatesRepository.findByXAndY(coordinate.getX(), coordinate.getY());
            }
        }
        coordinatesRepository.save(coordinate);
        incrementImportedCount();
        return coordinate;
    }

    private Location parseAndSaveLocation(HashMap<String, Object> locationData, User user, boolean inner) {
        if (!locationData.containsKey("name") || !locationData.containsKey("y")
                || !locationData.containsKey("adminCanModify")) {
            throw new IllegalArgumentException("Location data is missing. Name, y and adminCanModify are required");
        }
        if (locationData.get("name") == null) {
            throw new IllegalArgumentException("Location name cannot be null");
        }
        String name = locationData.get("name").toString();
        Optional<Double> x = Optional.empty();
        if (locationData.containsKey("x")) {
            try {
                x = Optional.of(((Number) locationData.get("x")).doubleValue());
            } catch (ClassCastException e) {
                throw new IllegalArgumentException("Invalid data type for x coordinate in location. Expected a Double.", e);
            }
        }
        Integer y;
        try {
            if (locationData.get("y") == null) {
                throw new IllegalArgumentException("Y coordinate in location cannot be null");
            }
            y = ((Number) locationData.get("y")).intValue();
        } catch (ClassCastException e) {
            throw new IllegalArgumentException("Invalid data type for y coordinate in location. Expected an integer.", e);
        }
        Optional<Double> z = Optional.empty();
        if (locationData.containsKey("z")) {
            try {
                z = Optional.of(((Number) locationData.get("z")).doubleValue());
            } catch (ClassCastException e) {
                throw new IllegalArgumentException("Invalid data type for z coordinate in location. Expected a Double.", e);
            }
        }
        Boolean adminCanModify = parseAdminCanModify(locationData, user);
        Location location = new Location();
        if (x.isPresent()) {
            location.setX(x.get());
        } else location.setX(0);
        location.setY(y);
        if (z.isPresent()) {
            location.setZ(z.get());
        } else {
            location.setZ(0);
        }
        location.setName(name);
        location.setAdminCanModify(adminCanModify);
        location.setUser(user);
        if (inner && locationRepository.existsByXAndYAndZAndName(location.getX(), location.getY(), location.getZ(),
                location.getName())) {
            System.out.println("Location already exists. Returning existing location");
            return locationRepository.findByName(location.getName());
        }
        if (locationRepository.existsByName(location.getName())) {
            throw new LocationAlreadyExistException(String.format("Location %s already exists", location.getName()));
        }
        if (locationRepository.existsByXAndYAndZ(
                location.getX(),
                location.getY(),
                location.getZ())) {
            throw new LocationAlreadyExistException(String.format("Location %.3f %d %.3f already exists by name %s",
                    location.getX(), location.getY(), location.getZ(), location.getName()));
        }
        locationRepository.save(location);
        incrementImportedCount();
        return location;
    }

    @SuppressWarnings("unchecked")
    private Person parseAndSavePerson(HashMap<String, Object> personData, User user, boolean inner) {
        if (!personData.containsKey("name")
                || !personData.containsKey("coordinates")
                || !personData.containsKey("location")
                || !personData.containsKey("height")
                || !personData.containsKey("birthday")
                || !personData.containsKey("adminCanModify")) {
            throw new IllegalArgumentException(
                    "Person data is missing. Name, coordinates, location, height, birthday and adminCanModify are required");
        }
        HashMap<String, Object> coordData = (HashMap<String, Object>) personData.get("coordinates");
        Coordinates coordinates = parseAndSaveCoordinate(coordData, user, true);
        HashMap<String, Object> locationData = (HashMap<String, Object>) personData.get("location");
        Location location = parseAndSaveLocation(locationData, user, true);
        if (personData.get("name") == null) {
            throw new IllegalArgumentException("Person name cannot be null");
        }
        String name = personData.get("name").toString();
        Color eyeColor;
        try {
            eyeColor = Color.valueOf(personData.get("eyeColor").toString());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid eye color. Must be one of: " + Arrays.toString(Color.values()), e);
        }
        Color hairColor;
        try {
            hairColor = Color.valueOf(personData.get("hairColor").toString());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid hair color. Must be one of: " + Arrays.toString(Color.values()), e);
        }
        Integer height;
        try {
            if (personData.get("height") == null) {
                throw new IllegalArgumentException("Height cannot be null");
            }
            height = ((Number) personData.get("height")).intValue();
        } catch (ClassCastException e) {
            throw new IllegalArgumentException("Invalid data type for height. Expected a Integer.", e);
        }
        Date birthday;
        try {
            if (personData.get("birthday") == null) {
                throw new IllegalArgumentException("Birthday cannot be null");
            }
            birthday = (Date) personData.get("birthday");
        } catch (ClassCastException e) {
            throw new IllegalArgumentException("Invalid data type for birthday. Expected a Date format dd-MM-yyyy.", e);
        }
        Country nationality;
        try {
            nationality = Country.valueOf(personData.get("nationality").toString());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid nationality. Must be one of: " + Arrays.toString(Country.values()),
                    e);
        }
        Boolean adminCanModify = parseAdminCanModify(personData, user);
        Person person = new Person();
        if (height <= 0) {
            throw new IllegalArgumentException("Height must be positive");
        }
        person.setName(name);
        person.setCoordinates(coordinates);
        person.setCreationDate(LocalDateTime.now());
        person.setEyeColor(eyeColor);
        person.setHairColor(hairColor);
        person.setLocation(location);
        person.setHeight(height);
        person.setBirthday(birthday);
        person.setNationality(nationality);
        person.setAdminCanModify(adminCanModify);
        person.setUser(user);
        if (personRepository.existsByName(person.getName())) {
            if (!inner) {
                throw new PersonAlreadyExistException(
                        String.format("Person with name %s already exists",
                                person.getName()));
            } else {
                System.out.println("Person already exists. Returning existing person");
                return personRepository.findByName(person.getName());
            }
        }
        personRepository.save(person);
        incrementImportedCount();
        return person;
    }

    private User findUserByRequest(HttpServletRequest request) {
        String username = jwtUtils.getUserNameFromJwtToken(jwtUtils.parseJwt(request));
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(
                        String.format("Username %s not found", username)));
    }

    private Boolean parseAdminCanModify(HashMap<String, Object> data, User user) {
        if (data.get("adminCanModify") == null) {
            throw new IllegalArgumentException("adminCanModify cannot be null");
        }
        String adminCanModifyStr = data.get("adminCanModify").toString();
        if (!adminCanModifyStr.equals("true") && !adminCanModifyStr.equals("false")) {
            throw new IllegalArgumentException("adminCanModify must be true or false");
        }
        return Boolean.parseBoolean(adminCanModifyStr);
    }

    private void incrementImportedCount() {
        importedCount++;
    }

    public List<ImportHistoryDTO> getImportHistory(int from, int size, HttpServletRequest request) {
        User fromUser = findUserByRequest(request);
        Pageable page = Pagification.createPageTemplate(from, size);
        List<ImportHistory> importHistory;
        if (fromUser.getRole() == Role.ADMIN) {
            importHistory = importHistoryRepository.findAll(page).getContent();
        } else {
            importHistory = importHistoryRepository.findAllByUser(fromUser, page).getContent();
        }
        return importHistory
                .stream()
                .map(importHistory1 -> new ImportHistoryDTO(
                        importHistory1.getId(),
                        importHistory1.getStatus(),
                        importHistory1.getImportTime(),
                        importHistory1.getImportedCount(),
                        importHistory1.getUser().getId()))
                .sorted(new Comparator<ImportHistoryDTO>() {
                    @Override
                    public int compare(ImportHistoryDTO o1, ImportHistoryDTO o2) {
                        return o1.getId().compareTo(o2.getId());
                    }
                })
                .toList();
    }
    public void deleteImportHistory(Long id, HttpServletRequest request) {
        User fromUser = findUserByRequest(request);
        Optional<ImportHistory> importHistory = importHistoryRepository.findById(id);
        if (importHistory.isEmpty()) {
            throw new IllegalArgumentException("Import history not found by id " + id);
        }
        if (fromUser.getRole() != Role.ADMIN && fromUser.getId() != importHistory.get().getUser().getId()) {
            throw new IllegalArgumentException("Only admins or owner can delete import history");
        }
        importHistoryRepository.deleteById(id);
        simpMessagingTemplate.convertAndSend("/topic", "Import history deleted");
    }
}
