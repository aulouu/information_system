package itmo.aulouu.is.exceptions;

public class CoordinatesAlreadyExistException extends RuntimeException {
    public CoordinatesAlreadyExistException(String message) {
        super(message);
    }
}