package itmo.aulouu.is_lab1.exceptions;

public class ForbiddenException extends RuntimeException {
   public ForbiddenException(String message) {
       super(message);
   }
}