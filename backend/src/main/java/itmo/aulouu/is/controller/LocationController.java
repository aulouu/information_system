package itmo.aulouu.is.controller;

import itmo.aulouu.is.dto.location.AlterLocationDTO;
import itmo.aulouu.is.dto.location.CreateLocationDTO;
import itmo.aulouu.is.dto.location.LocationDTO;
import itmo.aulouu.is.service.LocationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/location")
@RequiredArgsConstructor
public class LocationController {
    private final LocationService locationService;

    @GetMapping
    public List<LocationDTO> getLocations(@RequestParam int from, @RequestParam int size) {
        return locationService.getLocations(from, size);
    }

    @PostMapping
    public LocationDTO createLocation(@RequestBody @Valid CreateLocationDTO createLocationDTO, HttpServletRequest request) {
        return locationService.createLocation(createLocationDTO, request);
    }

    @PatchMapping("/{locationId}")
    public LocationDTO alterLocation(@PathVariable Long locationId, @RequestBody @Valid AlterLocationDTO alterLocationDTO,
                                     HttpServletRequest request) {
        return locationService.alterLocation(locationId, alterLocationDTO, request);
    }

    @DeleteMapping("/{locationId}")
    public void deleteLocation(@PathVariable Long locationId, HttpServletRequest request) {
        locationService.deleteLocation(locationId, request);
    }
}
