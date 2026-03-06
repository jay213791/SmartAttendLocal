package smartattendLocal.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Card {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String name;

    @Column(name = "SUBJECT")
    private String subjectName;

    @ManyToOne
    @JoinColumn(name = "TEACHER_ID",referencedColumnName = "ID", nullable = false)
    private Teacher teacher;
}
