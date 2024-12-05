package itmo.aulouu.is_lab1.service;

import itmo.aulouu.is_lab1.Pagification;
import itmo.aulouu.is_lab1.dao.*;
import itmo.aulouu.is_lab1.dto.coordinates.*;
import itmo.aulouu.is_lab1.dto.location.*;
import itmo.aulouu.is_lab1.dto.person.*;
import itmo.aulouu.is_lab1.model.*;
import itmo.aulouu.is_lab1.security.jwt.JwtUtils;
import itmo.aulouu.is_lab1.exceptions.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.parameters.P;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
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

@Service
@RequiredArgsConstructor
@Transactional(isolation = Isolation.SERIALIZABLE, rollbackFor = Exception.class, propagation = Propagation.NESTED)
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

    public PersonDTO createPerson(CreatePersonDTO createPersonDTO, HttpServletRequest request) {
        if (personRepository.existsByName(createPersonDTO.getName()))
            throw new PersonAlreadyExistException(String.format("Person %s already exists", createPersonDTO.getName()));
        Coordinates coordinate = coordinatesRepository.findById(createPersonDTO.getCoordinatesId())
                .orElseThrow(() -> new CoordinatesNotFoundException(
                        String.format("Coordinates with id %s not found", createPersonDTO.getCoordinatesId())));

        Location location = locationRepository.findById(createPersonDTO.getLocationId())
                .orElseThrow(() -> new LocationNotFoundException(
                        String.format("Location with id %s not found", createPersonDTO.getLocationId())));

        User user = findUserByRequest(request);

        Person person = Person
                .builder()
                .name(createPersonDTO.getName())
                .coordinates(coordinate)
                .creationDate(LocalDateTime.now())
                .eyeColor(createPersonDTO.getEyeColor())
                .hairColor(createPersonDTO.getHairColor())
                .location(location)
                .height(createPersonDTO.getHeight())
                .birthday(createPersonDTO.getBirthday())
                .nationality(createPersonDTO.getNationality())
                .adminCanModify(createPersonDTO.getAdminCanModify())
                .user(user)
                .build();

        person = personRepository.save(person);
        simpMessagingTemplate.convertAndSend("/topic", "New person created");

        return toPersonDTO(person);
    }

    public PersonDTO alterPerson(Long personId, AlterPersonDTO alterPersonDTO, HttpServletRequest request) {
        Person person = personRepository.findById(personId)
                .orElseThrow(() -> new PersonNotFoundException(
                        String.format("Person with id %s not found", personId)));

        if (!checkPermission(person, request))
            throw new ForbiddenException(String.format("No access to person with id %s", personId));

        if (alterPersonDTO.getName() != null)
            person.setName(alterPersonDTO.getName());

        if (alterPersonDTO.getCoordinatesId() != null) {
            Coordinates coordinates = coordinatesRepository.findById(alterPersonDTO.getCoordinatesId())
                    .orElseThrow(() -> new CoordinatesNotFoundException(
                            String.format("Coordinates with id %s not found", alterPersonDTO.getCoordinatesId())));
            person.setCoordinates(coordinates);
        }

        person.setEyeColor(alterPersonDTO.getEyeColor());

        person.setHairColor(alterPersonDTO.getHairColor());

        if (alterPersonDTO.getLocationId() != null) {
            Location location = locationRepository.findById(alterPersonDTO.getLocationId())
                    .orElseThrow(() -> new LocationNotFoundException(
                            String.format("Location with id %s not found", alterPersonDTO.getLocationId())));
            person.setLocation(location);
        }

        if (alterPersonDTO.getHeight() != null) {
            person.setHeight(alterPersonDTO.getHeight());
        }

        if (alterPersonDTO.getBirthday() != null) {
            person.setBirthday(alterPersonDTO.getBirthday());
        }

        person.setNationality(alterPersonDTO.getNationality());

        if (alterPersonDTO.getAdminCanModify() != null)
            person.setAdminCanModify(alterPersonDTO.getAdminCanModify());

        person = personRepository.save(person);
        simpMessagingTemplate.convertAndSend("/topic", "Person updated");
        return toPersonDTO(person);
    }

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
        List<Person> persons =  personRepository.findCountByEyeColor(eyeColor);
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
