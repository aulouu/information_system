package itmo.aulouu.is_lab1.controller;

import itmo.aulouu.is_lab1.dto.AdminRequestDTO;
import itmo.aulouu.is_lab1.service.AdminService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;

    @GetMapping
    public List<AdminRequestDTO> getAdminRequests(@RequestParam int from, @RequestParam int size) {
        return adminService.getAdminRequests(from, size);
    }

    @PostMapping
    public void createAdminRequest(HttpServletRequest request) {
        adminService.createAdminRequest(request);
    }

    @PutMapping("/{adminRequestId}")
    public void approveOnAdminRequest(@PathVariable Long adminRequestId, HttpServletRequest request) {
        adminService.approveOnAdminRequest(adminRequestId, request);
    }

}
