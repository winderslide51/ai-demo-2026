package com.demo.annonces.annonce;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnnonceRepository extends JpaRepository<Annonce, UUID> {

    /** Listing order is part of the business contract, not a client parameter. */
    List<Annonce> findAllByOrderByCreatedAtDesc();
}
