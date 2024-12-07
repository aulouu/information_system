package itmo.aulouu.is_lab1.dto.coordinates;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class CreateCoordinatesDTO {

    private int x;

    @Min(-290)
    private int y;

    @NotNull
    private Boolean adminCanModify;
}
