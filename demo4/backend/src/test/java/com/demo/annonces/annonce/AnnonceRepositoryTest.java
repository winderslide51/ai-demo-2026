package com.demo.annonces.annonce;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;

import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;

@DataJpaTest
class AnnonceRepositoryTest {

    @Autowired
    private AnnonceRepository repository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    void savesAndReadsBackAnAnnonce() {
        Instant createdAt = Instant.parse("2026-09-15T10:00:00Z");
        Annonce saved = repository.save(new Annonce(
                "Vélo de course", Category.LOISIRS, "Vélo de course en très bon état, peu servi.",
                350, "Lyon", "69003", createdAt));
        entityManager.flush();
        entityManager.clear();

        assertThat(saved.getId()).isNotNull();
        assertThat(repository.findById(saved.getId())).hasValueSatisfying(annonce -> {
            assertThat(annonce.getTitle()).isEqualTo("Vélo de course");
            assertThat(annonce.getCategory()).isEqualTo(Category.LOISIRS);
            assertThat(annonce.getDescription()).isEqualTo("Vélo de course en très bon état, peu servi.");
            assertThat(annonce.getPrice()).isEqualTo(350);
            assertThat(annonce.getCity()).isEqualTo("Lyon");
            assertThat(annonce.getPostalCode()).isEqualTo("69003");
            assertThat(annonce.getCreatedAt()).isEqualTo(createdAt);
        });
    }

    @Test
    void listsAnnoncesMostRecentFirst() {
        Instant base = Instant.parse("2026-09-22T09:00:00Z");
        // inserted out of order on purpose: the ordering must come from the query, not the insert order
        repository.save(annonce("Canapé 3 places", base.minusSeconds(60)));
        repository.save(annonce("Vélo de course", base));
        repository.save(annonce("Perceuse sans fil", base.minusSeconds(120)));
        entityManager.flush();
        entityManager.clear();

        List<Annonce> annonces = repository.findAllByOrderByCreatedAtDesc();

        assertThat(annonces)
                .extracting(Annonce::getTitle, Annonce::getCreatedAt)
                .containsExactly(
                        tuple("Vélo de course", base),
                        tuple("Canapé 3 places", base.minusSeconds(60)),
                        tuple("Perceuse sans fil", base.minusSeconds(120)));
    }

    private static Annonce annonce(String title, Instant createdAt) {
        return new Annonce(title, Category.LOISIRS, "Description suffisamment longue pour la validation.",
                100, "Lyon", "69003", createdAt);
    }
}
