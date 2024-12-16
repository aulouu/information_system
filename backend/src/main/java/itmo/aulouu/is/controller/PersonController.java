package itmo.aulouu.is.controller;

import itmo.aulouu.is.dto.person.AlterPersonDTO;
import itmo.aulouu.is.dto.person.CreatePersonDTO;
import itmo.aulouu.is.dto.person.PersonDTO;
import itmo.aulouu.is.model.Color;
import itmo.aulouu.is.service.PersonService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/person")
@RequiredArgsConstructor
public class PersonController {
    private final PersonService personService;

    @GetMapping
    public List<PersonDTO> getPersonPage(@RequestParam int from, @RequestParam int size) {
        return personService.getPersonPage(from, size);
    }

    @GetMapping("/all")
    public List<PersonDTO> getPerson() {
        return personService.getPerson();
    }

    @PostMapping
    public PersonDTO createPerson(@RequestBody @Valid CreatePersonDTO createPersonDTO, HttpServletRequest request) {
        return personService.createPerson(createPersonDTO, request);
    }

    @PatchMapping("/{personId}")
    public PersonDTO alterPerson(@PathVariable Long personId, @Valid @RequestBody AlterPersonDTO alterPersonDTO,
                                 HttpServletRequest request) {
        return personService.alterPerson(personId, alterPersonDTO, request);
    }

    @DeleteMapping("/{personId}")
    public void deletePerson(@PathVariable Long personId, HttpServletRequest request) {
        personService.deletePerson(personId, request);
    }

    @PostMapping("/delete-persons/{height}")
    public void deleteAllPersonsByHeight(@RequestParam Integer height, HttpServletRequest request) {
        personService.deleteAllPersonsByHeight(height, request);
    }

    @GetMapping("/name/{substring}")
    public List<PersonDTO> getPersonsByNameStartsWith(@PathVariable String substring) {
        return personService.getPersonsByNameStartsWith(substring);
    }

    @GetMapping("/birthday/{date}")
    public List<PersonDTO> getPersonsByBirthdayLessThan(@PathVariable String date) {
        return personService.getPersonsByBirthdayLessThan(date);
    }

    @GetMapping("/hairColor/equals/{hairColor}")
    public List<PersonDTO> getCountByHairColor(@PathVariable Color hairColor) {
        return personService.getCountByHairColor(hairColor);
    }

    @GetMapping("/eyeColor/equals/{eyeColor}")
    public List<PersonDTO> getCountByEyeColor(@PathVariable Color eyeColor) {
        return personService.getCountByEyeColor(eyeColor);
    }

}
