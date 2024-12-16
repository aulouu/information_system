package itmo.aulouu.is.controller;

import itmo.aulouu.is.dao.ImportHistoryRepository;
import itmo.aulouu.is.dao.UserRepository;
import itmo.aulouu.is.dto.ImportHistoryDTO;
import itmo.aulouu.is.model.ImportHistory;
import itmo.aulouu.is.model.OperationStatus;
import itmo.aulouu.is.model.User;
import itmo.aulouu.is.security.jwt.JwtUtils;
import itmo.aulouu.is.service.ImportService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/import")
@RequiredArgsConstructor
public class ImportController {
    private final ImportHistoryRepository importHistoryRepository;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final ImportService importService;

    @PostMapping
    public ResponseEntity<String> importCoordinates(@RequestParam MultipartFile file,
                                                    HttpServletRequest request) throws IOException {
        ImportHistory importHistory = new ImportHistory();
        User user = findUserByRequest(request);
        if (file.isEmpty()) {
            importHistory.setStatus(OperationStatus.FAILURE);
            importHistory.setUser(user);
            importHistory.setImportTime(LocalDateTime.now());
            importHistory.setImportedCount(0);
            importHistory.setFileUrl(null);
            importHistoryRepository.save(importHistory);
            simpMessagingTemplate.convertAndSend("/topic", "Import failed");
            return ResponseEntity.badRequest().body("File is empty");
        }
        try {
            importService.importFile(file, request);
            simpMessagingTemplate.convertAndSend("/topic", "Import successful");
            return ResponseEntity.ok("Import successful");
        } catch (Exception e) {
            importHistory.setStatus(OperationStatus.FAILURE);
            importHistory.setUser(user);
            importHistory.setFileUrl(null);
            importHistory.setImportTime(LocalDateTime.now());
            importHistory.setImportedCount(0);
            importHistoryRepository.save(importHistory);
            simpMessagingTemplate.convertAndSend("/topic", "Import failed");
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping
    public List<ImportHistoryDTO> getImportHistory(@RequestParam int from, @RequestParam int size,
                                                   HttpServletRequest request) {
        return importService.getImportHistory(from, size, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteImportHistory(@PathVariable Long id, HttpServletRequest request) {
        importService.deleteImportHistory(id, request);
        return ResponseEntity.ok("Import history deleted");
    }

    private User findUserByRequest(HttpServletRequest request) {
        String username = jwtUtils.getUserNameFromJwtToken(jwtUtils.parseJwt(request));
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(
                        String.format("Username %s not found", username)));
    }
}
