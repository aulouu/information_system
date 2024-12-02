package itmo.aulouu.is_lab1.dto.coordinates;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@AllArgsConstructor
@Getter
@Builder(toBuilder = true)
public class CoordinatesDTO {
   private Long id;
   private int x;
   private int y;
   private Boolean adminCanModify;
   private String userName;
}
