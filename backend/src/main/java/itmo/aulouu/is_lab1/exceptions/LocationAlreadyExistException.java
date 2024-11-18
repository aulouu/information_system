package itmo.aulouu.is_lab1.exceptions;

public class LocationAlreadyExistException extends RuntimeException {
   public LocationAlreadyExistException(String message) {
       super(message);
   }
}
