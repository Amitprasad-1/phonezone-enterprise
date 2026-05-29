package com.phonezone.repository;

import com.phonezone.model.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {
    // Custom query to find all items associated with a single Order ID
    List<Sale> findByOrderId(String orderId);
}
