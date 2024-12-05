package itmo.aulouu.is_lab1.model;

public enum Country {
    RUSSIA("RUSSIA"),
    CHINA("CHINA"),
    THAILAND("THAILAND"),
    SOUTH_KOREA("SOUTH_KOREA"),
    NORTH_KOREA("NORTH_KOREA");
    private final String countryName;
    Country(String countryName) {
        this.countryName = countryName;
    }
    public String getCountryName() {
        return countryName;
    }
}
