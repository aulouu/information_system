package itmo.aulouu.is.dto.person;

import itmo.aulouu.is.model.Color;
import itmo.aulouu.is.model.Country;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
    private String birthday;

    private Country nationality;

    private Boolean adminCanModify;
}
