package itmo.aulouu.is_lab1.dto.person;

import com.fasterxml.jackson.annotation.JsonFormat;
import itmo.aulouu.is_lab1.dto.coordinates.CoordinatesDTO;
import itmo.aulouu.is_lab1.dto.location.LocationDTO;
import itmo.aulouu.is_lab1.model.Color;
import itmo.aulouu.is_lab1.model.Country;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Date;

@AllArgsConstructor
@Getter
@Builder(toBuilder = true)
public class PersonDTO {
    private Long id;
    private String name;
    private CoordinatesDTO coordinates;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime creationDate;
    private Color eyeColor;
    private Color hairColor;
    private LocationDTO location;
    private Integer height;
    @JsonFormat(pattern = "dd-MM-yyyy")
    private Date birthday;
    private Country nationality;
    private Boolean adminCanModify;
    private String userName;
}
