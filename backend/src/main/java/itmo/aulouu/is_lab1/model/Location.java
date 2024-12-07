package itmo.aulouu.is_lab1.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;


@Entity
@Table(name = "location")
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Data
public class Location implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "x")
    private double x;

    @Column(name = "y", nullable = false)
    private Integer y;

    @Column(name = "z")
    private double z;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "admin_can_modify", nullable = false)
    private Boolean adminCanModify;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;
}
