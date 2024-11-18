package itmo.aulouu.is_lab1.exceptions;

public class UserAlreadyAdminException extends RuntimeException {
   public UserAlreadyAdminException(String message) {
       super(message);
   }
}