package itmo.aulouu.is_lab1.dto.person;

import itmo.aulouu.is_lab1.model.Color;
import itmo.aulouu.is_lab1.model.Country;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class AlterPersonDTO {
    @Size(min = 1)
    private String name;

    @Positive
    @NotNull
    private Long coordinatesId;

    private Color eyeColor;

    private Color hairColor;

    @NotNull
    @Positive
    private Long locationId;

    @NotNull
    @Positive
    private Integer height;

    @NotNull
    private Date birthday;

    private Country nationality;

    private Boolean adminCanModify;
}
