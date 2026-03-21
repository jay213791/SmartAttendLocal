package smartattendLocal.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import smartattendLocal.Entity.Attendance;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Integer> {
    boolean existsByStudentIdAndCardIdAndScanTimeBetween(
            int studentId,
            int cardId,
            LocalDateTime start,
            LocalDateTime end
    );



    List<Attendance> findByCardIdAndScanTimeBetween(
            int cardId,
            LocalDateTime start,
            LocalDateTime end
    );

    List<Attendance> findByScanTimeBetween(
            LocalDateTime start,
            LocalDateTime end
    );
}
