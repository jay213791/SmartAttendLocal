package smartattendLocal.Controller;

import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import smartattendLocal.QRCodeGenerator;
import smartattendLocal.Entity.Student;
import smartattendLocal.Entity.Teacher;
import smartattendLocal.Repository.StudentRepository;
import smartattendLocal.Repository.TeacherRepository;


@RestController
@RequestMapping("/students")
public class StudentController {

    private static final Logger logger = LoggerFactory.getLogger(StudentController.class);

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    // ADD NG STUDENTS API
    @PostMapping("/add")
    public ResponseEntity<?> addStudent(@RequestBody Student student, Authentication authentication) {
        Teacher teacher = teacherRepository.findByEmail(authentication.getName());
        student.setTeacher(teacher);

        if (studentRepository.existsByEmail(student.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body("Email Already Exists");
        }

        if (student.getQrCode() == null || student.getQrCode().isEmpty()) {
            // use the student number
            if (student.getStudentNumber() != null) {
                student.setQrCode("QR" + student.getStudentNumber());
            } else {
                // or generate random uuid (only if no student number provided)
                student.setQrCode(UUID.randomUUID().toString().substring(0, 8));
            }
        }

        // save ng student sa database
        Student savedStudent = studentRepository.save(student);

        // Generate QR code image tapos i save sa file
        String qrFilePath = "C:" + File.separator + "Users" + File.separator + "Christian Jay" + File.separator + "Downloads" + File.separator + savedStudent.getStudentNumber() + ".png";

        try {
            QRCodeGenerator.generateQRCodeImage(savedStudent.getQrCode(), 200, 200, qrFilePath);
        } catch (Exception e) {
            logger.error("Failed to generate QR code for student: {}", savedStudent.getStudentNumber(), e);
        }
        return ResponseEntity.ok(savedStudent);
    }

    // VIEW NG ALL STUDENTS
    @GetMapping("/all")
    public List<Student> GetAllStudents() {
        return studentRepository.findAll();
    }

    @GetMapping("/count/my-students")
    public long getMyStudentsCount(Authentication authentication) {
        String teacherEmail = authentication.getName();

        if (teacherEmail == null || teacherEmail.isEmpty()) {
            throw new RuntimeException("Teacher not found");
        }

        return studentRepository.countByTeacherEmail(teacherEmail);
    }
    // DELETE NG STUDENT
    @DeleteMapping("/delete/{id}")
    public String deleteStudent(@PathVariable int id) {
        studentRepository.deleteById(id);
        return "Student with ID " + id + " deleted successfully.";
    }
}
