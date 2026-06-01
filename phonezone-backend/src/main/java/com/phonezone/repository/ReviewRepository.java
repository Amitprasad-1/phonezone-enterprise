package com.phonezone.repository;

import com.phonezone.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    // Custom query to find all reviews sorted by timestamp descending
    List<Review> findAllByOrderByTimestampDesc();
}
