package itmo.aulouu.is.exceptions;

public class AdminRequestAlreadyExistException extends RuntimeException {
    public AdminRequestAlreadyExistException(String message) {
        super(message);
    }
}