package com.phonezone.repository;

import com.phonezone.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {
    // Custom query to find items by stock status (e.g. 'In Stock')
    List<Product> findByStock(String stock);

    // Custom query to locate a device by its unique IMEI
    Product findByImei(String imei);
}
