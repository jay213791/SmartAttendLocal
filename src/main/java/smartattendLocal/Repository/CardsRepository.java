package smartattendLocal.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import smartattendLocal.Entity.Card;


import java.util.List;

public interface CardsRepository extends JpaRepository<Card, Integer> {
    List<Card> findByTeacher_Email(String email);
}
