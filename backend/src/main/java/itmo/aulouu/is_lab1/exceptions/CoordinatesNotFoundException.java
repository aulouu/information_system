package itmo.aulouu.is_lab1.exceptions;

public class CoordinatesNotFoundException extends RuntimeException {
   public CoordinatesNotFoundException(String message) {
       super(message);
   }
}