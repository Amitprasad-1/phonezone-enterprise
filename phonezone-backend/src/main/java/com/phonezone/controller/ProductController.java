package com.phonezone.controller;

import com.phonezone.model.Product;
import com.phonezone.model.Sale;
import com.phonezone.repository.ProductRepository;
import com.phonezone.repository.SaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*") // Allow frontend scripts to communicate
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SaleRepository saleRepository;

    // 1. Fetch all products (for dashboard inventory)
    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // 2. Fetch in-stock products (for customer storefront catalog)
    @GetMapping("/storefront")
    public List<Product> getStorefrontProducts() {
        return productRepository.findByStock("In Stock");
    }

    // 3. Add or update a product listing
    @PostMapping
    public Product saveProduct(@RequestBody Product product) {
        return productRepository.save(product);
    }

    // 4. Delete a product listing
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
        if (!productRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        productRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // 5. Toggle stock status between "In Stock" and "Out of Stock"
    @PutMapping("/toggle-stock/{id}")
    public ResponseEntity<Product> toggleStock(@PathVariable String id) {
        Product product = productRepository.findById(id)
                .orElse(null);
        if (product == null) {
            return ResponseEntity.notFound().build();
        }
        
        String newStatus = "In Stock".equals(product.getStock()) ? "Out of Stock" : "In Stock";
        product.setStock(newStatus);
        Product updated = productRepository.save(product);
        return ResponseEntity.ok(updated);
    }

    // 6. Complete purchase transaction: decrement stock, save sale log
    @PutMapping("/purchase/{id}")
    public ResponseEntity<?> purchaseProduct(@PathVariable String id, @RequestBody Sale sale) {
        Product product = productRepository.findById(id)
                .orElse(null);
        if (product == null) {
            return ResponseEntity.badRequest().body("Device listing not found.");
        }

        if ("Out of Stock".equals(product.getStock())) {
            return ResponseEntity.badRequest().body("This device is already sold out!");
        }

        // Set stock status of phone to sold
        product.setStock("Out of Stock");
        productRepository.save(product);

        // Populate and save Sale record
        sale.setProductId(id);
        sale.setTimestamp(System.currentTimeMillis());
        Sale savedSale = saleRepository.save(sale);

        return ResponseEntity.ok(savedSale);
    }

    // 7. Fetch all sales logs (for dashboard analytics)
    @GetMapping("/sales")
    public List<Sale> getAllSales() {
        return saleRepository.findAll();
    }
}
