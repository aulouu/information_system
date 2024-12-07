package itmo.aulouu.is_lab1.model;

public enum OperationStatus {
    SUCCESS("SUCCESS"),
    FAILURE("FAILURE");
    private final String status;

    OperationStatus(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }
}
