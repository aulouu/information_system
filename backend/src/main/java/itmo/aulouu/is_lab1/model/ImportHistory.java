package itmo.aulouu.is_lab1.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "import_history")
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Data
public class ImportHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private OperationStatus status;

    @Column(name = "import_time", nullable = false)
    private LocalDateTime importTime;

    @Column(name = "imported_count")
    private Integer importedCount;

    @Column(name = "file_url", length = 1024)
    private String fileUrl;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;
}
