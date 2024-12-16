package itmo.aulouu.is.exceptions;

public class LocationAlreadyExistException extends RuntimeException {
    public LocationAlreadyExistException(String message) {
        super(message);
    }
}
