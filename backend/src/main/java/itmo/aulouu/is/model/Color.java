package itmo.aulouu.is.model;

public enum Color {
    GREEN("GREEN"),
    RED("RED"),
    ORANGE("ORANGE");
    private final String colorName;

    Color(String colorName) {
        this.colorName = colorName;
    }

    public String getColorName() {
        return colorName;
    }
}
