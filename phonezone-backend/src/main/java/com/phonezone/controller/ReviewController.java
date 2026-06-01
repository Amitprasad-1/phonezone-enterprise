package com.phonezone.controller;

import com.phonezone.model.Review;
import com.phonezone.model.Sale;
import com.phonezone.repository.ReviewRepository;
import com.phonezone.repository.SaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private SaleRepository saleRepository;

    // 1. Get all customer reviews (sorted by newest first)
    @GetMapping
    public List<Review> getAllReviews() {
        return reviewRepository.findAllByOrderByTimestampDesc();
    }

    // 2. Submit a review with verified purchase check
    @PostMapping
    public ResponseEntity<?> submitReview(@RequestBody Review review) {
        if (review.getOrderId() == null || review.getOrderId().trim().isEmpty()) {
            Map<String, String> errorMap = new HashMap<>();
            errorMap.put("error", "Order ID is required to verify your purchase.");
            return ResponseEntity.badRequest().body(errorMap);
        }

        // Search for sale record matching the Order ID
        List<Sale> sales = saleRepository.findByOrderId(review.getOrderId().trim().toUpperCase());
        if (sales == null || sales.isEmpty()) {
            Map<String, String> errorMap = new HashMap<>();
            errorMap.put("error", "Invalid Order ID: " + review.getOrderId() + ". Reviews can only be submitted for verified purchases.");
            return ResponseEntity.badRequest().body(errorMap);
        }

        // Verify rating boundaries
        if (review.getRating() == null || review.getRating() < 1 || review.getRating() > 5) {
            Map<String, String> errorMap = new HashMap<>();
            errorMap.put("error", "Rating must be between 1 and 5 stars.");
            return ResponseEntity.badRequest().body(errorMap);
        }

        if (review.getTitle() == null || review.getTitle().trim().isEmpty() ||
            review.getComment() == null || review.getComment().trim().isEmpty()) {
            Map<String, String> errorMap = new HashMap<>();
            errorMap.put("error", "Review title and comment cannot be empty.");
            return ResponseEntity.badRequest().body(errorMap);
        }

        // Auto-populate purchase and customer details from the verified sale record
        Sale verifiedSale = sales.get(0);
        
        // Construct brand/model summary if multiple items in order, otherwise show the single item
        String brand = verifiedSale.getBrand();
        String model = verifiedSale.getModel();
        if (sales.size() > 1) {
            model = model + " (+" + (sales.size() - 1) + " more item" + (sales.size() > 2 ? "s" : "") + ")";
        }

        review.setCustomerName(verifiedSale.getCustomerName());
        review.setCustomerEmail(verifiedSale.getCustomerEmail());
        review.setBrandName(brand);
        review.setModelName(model);
        review.setTimestamp(System.currentTimeMillis());
        review.setOrderId(verifiedSale.getOrderId()); // Use canonical upper-case order id

        Review savedReview = reviewRepository.save(review);
        return ResponseEntity.ok(savedReview);
    }
}
