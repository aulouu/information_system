package itmo.aulouu.is_lab1.exceptions;

public class UserAlreadyExistException extends RuntimeException {
   public UserAlreadyExistException(String message) {
       super(message);
   }
}
