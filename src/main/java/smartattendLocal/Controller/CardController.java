package smartattendLocal.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import smartattendLocal.Entity.Card;
import smartattendLocal.Entity.Teacher;
import smartattendLocal.Repository.CardsRepository;
import smartattendLocal.Repository.TeacherRepository;

import java.util.List;

@RestController
@RequestMapping("/cards")
public class CardController {

    @Autowired
    private CardsRepository cardsRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @PostMapping("/add")
    public ResponseEntity<?> addCard(@RequestBody Card card, Authentication authentication) {
        String teacherEmail = authentication.getName();

        Teacher teacher = teacherRepository.findByEmail(teacherEmail);

        if (teacher == null) {
            return ResponseEntity
                    .badRequest()
                    .body("Teacher not found");
        }

        card.setTeacher(teacher);

        Card savedCard = cardsRepository.save(card);

        return ResponseEntity.ok(savedCard);
    }

    @GetMapping("/my-cards")
    public ResponseEntity<?> getMyCards(Authentication authentication) {
        String teacherEmail = authentication.getName();
        Teacher teacher = teacherRepository.findByEmail(teacherEmail);


        if (teacher == null) {
            return ResponseEntity
                    .badRequest()
                    .body("Teacher not found");
        }

        List<Card> cards = cardsRepository.findByTeacher_Email(teacherEmail);

        return ResponseEntity.ok(cards);
    }
}
