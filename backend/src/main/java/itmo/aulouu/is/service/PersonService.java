package itmo.aulouu.is.service;

import itmo.aulouu.is.Pagification;
import itmo.aulouu.is.dao.CoordinatesRepository;
import itmo.aulouu.is.dao.LocationRepository;
import itmo.aulouu.is.dao.PersonRepository;
import itmo.aulouu.is.dao.UserRepository;
import itmo.aulouu.is.dto.coordinates.CoordinatesDTO;
import itmo.aulouu.is.dto.location.LocationDTO;
import itmo.aulouu.is.dto.person.AlterPersonDTO;
import itmo.aulouu.is.dto.person.CreatePersonDTO;
import itmo.aulouu.is.dto.person.PersonDTO;
import itmo.aulouu.is.exceptions.*;
import itmo.aulouu.is.model.*;
import itmo.aulouu.is.security.jwt.JwtUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.transaction.annotation.Transactional;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import org.postgresql.util.PSQLException;

@Service
@RequiredArgsConstructor
@Transactional(isolation = Isolation.SERIALIZABLE)
public class PersonService {
    private final PersonRepository personRepository;
    private final CoordinatesRepository coordinatesRepository;
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final SimpMessagingTemplate simpMessagingTemplate;

    public List<PersonDTO> getPersonPage(int from, int size) {
        Pageable page = Pagification.createPageTemplate(from, size);
        List<Person> person = personRepository.findAll(page).getContent();
        return person
                .stream()
                .map(this::toPersonDTO)
                .sorted(new Comparator<PersonDTO>() {
                    @Override
                    public int compare(PersonDTO o1, PersonDTO o2) {
                        return o1.getId().compareTo(o2.getId());
                    }
                })
                .toList();
    }

    public List<PersonDTO> getPerson() {
        List<Person> person = personRepository.findAll();
        return person
                .stream()
                .map(this::toPersonDTO)
                .sorted(new Comparator<PersonDTO>() {
                    @Override
                    public int compare(PersonDTO o1, PersonDTO o2) {
                        return o1.getId().compareTo(o2.getId());
                    }
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public Coordinates findCoordinatesById(Long id) {
        return coordinatesRepository.findById(id)
                .orElseThrow(() -> new CoordinatesNotFoundException(
                        String.format("Coordinates with id %s not found", id)));
    }

    @Transactional(readOnly = true)
    public Location findLocationById(Long id) {
        return locationRepository.findById(id)
                .orElseThrow(() -> new LocationNotFoundException(
                        String.format("Location with id %s not found", id)));
    }

    @Retryable(value = { PSQLException.class }, maxAttempts = 4, backoff = @Backoff(delay = 100, multiplier = 2))
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public PersonDTO createPerson(CreatePersonDTO createPersonDTO, HttpServletRequest request) {
        if (personRepository.existsByName(createPersonDTO.getName()))
            throw new PersonAlreadyExistException(String.format("Person %s already exists", createPersonDTO.getName()));
//        Coordinates coordinate = coordinatesRepository.findById(createPersonDTO.getCoordinatesId())
//                .orElseThrow(() -> new CoordinatesNotFoundException(
//                        String.format("Coordinates with id %s not found", createPersonDTO.getCoordinatesId())));
        Coordinates coordinate = findCoordinatesById(createPersonDTO.getCoordinatesId());
//        Location location = locationRepository.findById(createPersonDTO.getLocationId())
//                .orElseThrow(() -> new LocationNotFoundException(
//                        String.format("Location with id %s not found", createPersonDTO.getLocationId())));
        Location location = findLocationById(createPersonDTO.getLocationId());

        User user = findUserByRequest(request);

        // Преобразование строки в объект Date
        Date birthday;
        try {
            SimpleDateFormat dateFormat = new SimpleDateFormat("dd.MM.yyyy");
            dateFormat.setLenient(false); // Жёсткая проверка формата
            birthday = dateFormat.parse(createPersonDTO.getBirthday());
        } catch (ParseException e) {
            throw new IllegalArgumentException("Please enter a valid date for Birthday in the format dd.mm.yyyy");
        }

        Person person = Person
                .builder()
                .name(createPersonDTO.getName())
                .coordinates(coordinate)
                .creationDate(LocalDateTime.now())
                .eyeColor(createPersonDTO.getEyeColor())
                .hairColor(createPersonDTO.getHairColor())
                .location(location)
                .height(createPersonDTO.getHeight())
                .birthday(birthday)
                .nationality(createPersonDTO.getNationality())
                .adminCanModify(createPersonDTO.getAdminCanModify())
                .user(user)
                .build();

        person = personRepository.save(person);
        simpMessagingTemplate.convertAndSend("/topic", "New person created");

        return toPersonDTO(person);
    }

    @Retryable(value = { PSQLException.class }, maxAttempts = 4, backoff = @Backoff(delay = 100, multiplier = 2))
    public PersonDTO alterPerson(Long personId, AlterPersonDTO alterPersonDTO, HttpServletRequest request) {
        Person person = personRepository.findById(personId)
                .orElseThrow(() -> new PersonNotFoundException(
                        String.format("Person with id %s not found", personId)));

        if (!checkPermission(person, request))
            throw new ForbiddenException(String.format("No access to person with id %s", personId));

        if (alterPersonDTO.getName() != null)
            person.setName(alterPersonDTO.getName());

        if (alterPersonDTO.getCoordinatesId() != null) {
//            Coordinates coordinates = coordinatesRepository.findById(alterPersonDTO.getCoordinatesId())
//                    .orElseThrow(() -> new CoordinatesNotFoundException(
//                            String.format("Coordinates with id %s not found", alterPersonDTO.getCoordinatesId())));
            Coordinates coordinates = findCoordinatesById(alterPersonDTO.getCoordinatesId());
            person.setCoordinates(coordinates);
        }

        person.setEyeColor(alterPersonDTO.getEyeColor());

        person.setHairColor(alterPersonDTO.getHairColor());

        if (alterPersonDTO.getLocationId() != null) {
//            Location location = locationRepository.findById(alterPersonDTO.getLocationId())
//                    .orElseThrow(() -> new LocationNotFoundException(
//                            String.format("Location with id %s not found", alterPersonDTO.getLocationId())));
            Location location = findLocationById(alterPersonDTO.getLocationId());
            person.setLocation(location);
        }

        if (alterPersonDTO.getHeight() != null) {
            person.setHeight(alterPersonDTO.getHeight());
        }

        // Преобразование строки в объект Date
        Date birthday;
        try {
            SimpleDateFormat dateFormat = new SimpleDateFormat("dd.MM.yyyy");
            dateFormat.setLenient(false); // Жёсткая проверка формата
            birthday = dateFormat.parse(alterPersonDTO.getBirthday());
        } catch (ParseException e) {
            throw new IllegalArgumentException("Please enter a valid date for Birthday in the format dd.mm.yyyy");
        }

        if (alterPersonDTO.getBirthday() != null) {
            person.setBirthday(birthday);
        }

        person.setNationality(alterPersonDTO.getNationality());

        if (alterPersonDTO.getAdminCanModify() != null)
            person.setAdminCanModify(alterPersonDTO.getAdminCanModify());

        person = personRepository.save(person);
        simpMessagingTemplate.convertAndSend("/topic", "Person updated");
        return toPersonDTO(person);
    }

    @Retryable(value = { PSQLException.class }, maxAttempts = 4, backoff = @Backoff(delay = 100, multiplier = 2))
    public void deletePerson(Long personId, HttpServletRequest request) {
        Person person = personRepository.findById(personId)
                .orElseThrow(() -> new PersonNotFoundException(
                        String.format("Person with id %s not found", personId)));
        if (!checkPermission(person, request))
            throw new ForbiddenException(String.format("No access to person with id %s", personId));
        personRepository.delete(person);
        simpMessagingTemplate.convertAndSend("/topic", "Person deleted");
    }

    public void deleteAllPersonsByHeight(Integer value, HttpServletRequest request) {
        List<Person> persons = personRepository.findAllPersonsByHeight(value);
        if (jwtUtils.parseJwt(request) == null || jwtUtils.getUserNameFromJwtToken(jwtUtils.parseJwt(request)) == null)
            throw new ForbiddenException("You have no rights to delete this persons");
        for (Person person : persons) {
            if (!checkPermission(person, request))
                throw new ForbiddenException(String.format("No access to person with id %s", person.getId()));
            personRepository.delete(person);
        }
//        personRepository.deleteAll(persons);
        simpMessagingTemplate.convertAndSend("/topic", "Successfully deleted persons");
    }

    public List<PersonDTO> getPersonsByNameStartsWith(String substring) {
        List<Person> persons = personRepository.findAllByNameStartsWith(substring);

        return persons
                .stream()
                .map(this::toPersonDTO)
                .sorted(new Comparator<PersonDTO>() {
                    @Override
                    public int compare(PersonDTO o1, PersonDTO o2) {
                        return o1.getId().compareTo(o2.getId());
                    }
                })
                .toList();
    }

    public List<PersonDTO> getPersonsByBirthdayLessThan(String date) {
        List<Person> persons = personRepository.findAll();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy");
        LocalDate localDate = LocalDate.parse(date, formatter);
        Date resDate = Date.from(localDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
        return persons
                .stream()
                .filter(person -> person.getBirthday().before(resDate))
                .map(this::toPersonDTO)
                .sorted(new Comparator<PersonDTO>() {
                    @Override
                    public int compare(PersonDTO o1, PersonDTO o2) {
                        return o1.getId().compareTo(o2.getId());
                    }
                })
                .toList();
    }

    public List<PersonDTO> getCountByHairColor(Color hairColor) {
        List<Person> persons = personRepository.findCountByHairColor(hairColor);
        return persons
                .stream()
                .map(this::toPersonDTO)
                .sorted(new Comparator<PersonDTO>() {
                    @Override
                    public int compare(PersonDTO o1, PersonDTO o2) {
                        return o1.getId().compareTo(o2.getId());
                    }
                })
                .toList();
    }

    public List<PersonDTO> getCountByEyeColor(Color eyeColor) {
        List<Person> persons = personRepository.findCountByEyeColor(eyeColor);
        return persons
                .stream()
                .map(this::toPersonDTO)
                .sorted(new Comparator<PersonDTO>() {
                    @Override
                    public int compare(PersonDTO o1, PersonDTO o2) {
                        return o1.getId().compareTo(o2.getId());
                    }
                })
                .toList();
    }

    private PersonDTO toPersonDTO(Person person) {
        return PersonDTO
                .builder()
                .id(person.getId())
                .name(person.getName())
                .coordinates(new CoordinatesDTO(
                        person.getCoordinates().getId(),
                        person.getCoordinates().getX(),
                        person.getCoordinates().getY(),
                        person.getCoordinates().getAdminCanModify(),
                        person.getCoordinates().getUser().getUsername()))
                .creationDate(person.getCreationDate())
                .eyeColor(person.getEyeColor())
                .hairColor(person.getHairColor())
                .location(new LocationDTO(
                        person.getLocation().getId(),
                        person.getLocation().getX(),
                        person.getLocation().getY(),
                        person.getLocation().getZ(),
                        person.getLocation().getName(),
                        person.getLocation().getAdminCanModify(),
                        person.getLocation().getUser().getUsername()))
                .height(person.getHeight())
                .birthday(person.getBirthday())
                .nationality(person.getNationality())
                .adminCanModify(person.getAdminCanModify())
                .userName(person.getUser().getUsername())
                .build();
    }

    private User findUserByRequest(HttpServletRequest request) {
        String username = jwtUtils.getUserNameFromJwtToken(jwtUtils.parseJwt(request));
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(
                        String.format("Username %s not found", username)));
    }

    private boolean checkPermission(Person person, HttpServletRequest request) {
        String username = jwtUtils.getUserNameFromJwtToken(jwtUtils.parseJwt(request));
        User fromUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(
                        String.format("Username %s not found", username)));
        return person.getUser().getUsername().equals(username) || fromUser.getRole() == Role.ADMIN &&
                person.getAdminCanModify();
    }
}
