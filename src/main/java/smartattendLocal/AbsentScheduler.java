package smartattendLocal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import smartattendLocal.Entity.Attendance;
import smartattendLocal.Entity.Card;
import smartattendLocal.Entity.Student;
import smartattendLocal.Repository.AttendanceRepository;
import smartattendLocal.Repository.CardsRepository;
import smartattendLocal.Repository.StudentRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.TextStyle;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@Component
public class AbsentScheduler {

    @Autowired
    private CardsRepository cardsRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    // runs every minute
    @Scheduled(fixedRate = 60000)
    public void markAbsentStudents() {
        LocalTime now = LocalTime.now();
        LocalDate today = LocalDate.now();

        List<Card> cards = cardsRepository.findAll();

        for (Card card : cards) {
            if (card.getEndTime() == null) continue;

            // skip if today is not a scheduled class day
            if (card.getClassDays() != null && !card.getClassDays().isEmpty()) {
                String todayAbbr = today.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
                if (!Arrays.asList(card.getClassDays().split(",")).contains(todayAbbr)) continue;
            }

            // trigger only within the minute after endTime
            if (now.isBefore(card.getEndTime()) || now.isAfter(card.getEndTime().plusMinutes(1))) continue;

            List<Student> students = studentRepository.findByCardId(card.getId());

            for (Student student : students) {
                boolean scanned = attendanceRepository.existsByStudentIdAndCardIdAndScanTimeBetween(
                        student.getId(),
                        card.getId(),
                        today.atStartOfDay(),
                        today.atTime(23, 59, 59)
                );

                if (!scanned) {
                    Attendance absent = new Attendance();
                    absent.setStudentId(student.getId());
                    absent.setClassName(card.getSubjectName());
                    absent.setCard(card);
                    absent.setScanTime(LocalDateTime.now());
                    absent.setStatus("Absent");
                    attendanceRepository.save(absent);
                }
            }
        }
    }
}
