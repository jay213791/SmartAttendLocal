package smartattendLocal.Entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalTime;

@Entity
@Data
public class Card {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String name;

    @Column(name = "SUBJECT")
    private String subjectName;

    @Column(name = "START_TIME")
    private LocalTime startTime;

    @Column(name = "END_TIME")
    private LocalTime endTime;

    @Column(name = "CLASS_DAYS")
    private String classDays;

    @ManyToOne
    @JoinColumn(name = "TEACHER_ID",referencedColumnName = "ID", nullable = false)
    private Teacher teacher;
}
