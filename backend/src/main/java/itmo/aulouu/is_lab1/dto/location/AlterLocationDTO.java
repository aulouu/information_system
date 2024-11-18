package itmo.aulouu.is_lab1.dto.location;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class AlterLocationDTO {

   private double x;

   @NotNull
   private Integer y;

   private double z;

   @NotBlank
   @NotNull
   private String name;

   @NotNull
   private Boolean adminCanModify;
}
