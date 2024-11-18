package itmo.aulouu.is_lab1.dto.coordinates;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class CoordinatesDTO {
   private Long id;
   private int x;
   private int y;
   private Boolean adminCanModify;
   private Long userId;
}
