package itmo.aulouu.is.exceptions;

public class AdminRequestNotFoundException extends RuntimeException {
    public AdminRequestNotFoundException(String message) {
        super(message);
    }
}