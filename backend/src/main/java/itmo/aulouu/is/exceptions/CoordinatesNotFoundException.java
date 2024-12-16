package itmo.aulouu.is.exceptions;

public class CoordinatesNotFoundException extends RuntimeException {
    public CoordinatesNotFoundException(String message) {
        super(message);
    }
}