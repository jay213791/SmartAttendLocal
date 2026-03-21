package smartattendLocal.Entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "ATTENDANCE")
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "STUDENT_ID")
    private int studentId;

    @Column(name = "CLASS_NAME")
    private String className;

    @Column(name = "TIME")
    private LocalDateTime scanTime;

    @Column(name = "STATUS")
    private String status;

    @ManyToOne
    @JoinColumn(name = "CARD_ID",referencedColumnName = "ID", nullable = false)
    private Card card;
}
