package itmo.aulouu.is_lab1.exceptions;

public class AdminRequestAlreadyExistException extends RuntimeException {
   public AdminRequestAlreadyExistException(String message) {
       super(message);
   }
}