package smartattendLocal.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import smartattendLocal.Entity.Student;
import java.util.List;

@Repository
public interface StudentRepository extends JpaRepository<Student, Integer> {
    boolean existsByEmail(String email);
    List<Student> findByTeacherEmail(String teacherEmail);
    long countByTeacherEmail(String email);
}
