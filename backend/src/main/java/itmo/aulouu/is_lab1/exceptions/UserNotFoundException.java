package itmo.aulouu.is_lab1.exceptions;

public class UserNotFoundException extends RuntimeException {
   public UserNotFoundException(String message) {
       super(message);
   }
}