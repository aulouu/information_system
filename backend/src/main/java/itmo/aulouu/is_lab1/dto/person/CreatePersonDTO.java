package itmo.aulouu.is_lab1.dto.person;

import itmo.aulouu.is_lab1.model.Color;
import itmo.aulouu.is_lab1.model.Country;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class CreatePersonDTO {
    @NotBlank
    @NotNull
    private String name;

    @NotNull
    @Positive
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
    private String birthday;

    private Country nationality;

    @NotNull
    private Boolean adminCanModify;
}
