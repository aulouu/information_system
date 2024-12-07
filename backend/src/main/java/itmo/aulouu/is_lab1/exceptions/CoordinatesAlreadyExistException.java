package itmo.aulouu.is_lab1.exceptions;

public class CoordinatesAlreadyExistException extends RuntimeException {
    public CoordinatesAlreadyExistException(String message) {
        super(message);
    }
}