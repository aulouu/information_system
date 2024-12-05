package itmo.aulouu.is_lab1.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import itmo.aulouu.is_lab1.model.OperationStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ImportHistoryDTO {
    private Long id;
    private OperationStatus status;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime importTime;
    private int importedCount;
    private Long userId;
}
