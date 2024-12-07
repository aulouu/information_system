package itmo.aulouu.is_lab1.exceptions;

public class AdminRequestNotFoundException extends RuntimeException {
    public AdminRequestNotFoundException(String message) {
        super(message);
    }
}