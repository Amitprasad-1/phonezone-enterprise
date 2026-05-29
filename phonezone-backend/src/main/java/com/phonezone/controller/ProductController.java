package com.phonezone.controller;

import com.phonezone.model.Product;
import com.phonezone.model.Sale;
import com.phonezone.repository.ProductRepository;
import com.phonezone.repository.SaleRepository;
import com.phonezone.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private EmailService emailService;

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

    // 6. Complete single purchase transaction: decrement stock, save sale log, send confirmation email
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
        sale.setStatus("Pending");
        Sale savedSale = saleRepository.save(sale);

        // Trigger automated email invoice log
        try {
            emailService.sendOrderConfirmation(sale.getCustomerEmail(), sale.getCustomerName(), sale.getOrderId(), List.of(savedSale));
        } catch (Exception e) {
            System.err.println("[ProductController] Confirmation email failed: " + e.getMessage());
        }

        return ResponseEntity.ok(savedSale);
    }

    // 6b. Complete bulk purchase transaction: decrement stock for multiple items, save sale logs, send confirmation email
    @PutMapping("/purchase/bulk")
    public ResponseEntity<?> purchaseBulkProducts(@RequestBody List<Sale> sales) {
        if (sales == null || sales.isEmpty()) {
            return ResponseEntity.badRequest().body("No items in checkout payload.");
        }

        // Validate that all products exist and are in stock
        for (Sale sale : sales) {
            Product product = productRepository.findById(sale.getProductId()).orElse(null);
            if (product == null) {
                return ResponseEntity.badRequest().body("Device listing " + sale.getProductId() + " not found.");
            }
            if ("Out of Stock".equals(product.getStock())) {
                return ResponseEntity.badRequest().body("Device " + product.getModel() + " is already sold out!");
            }
        }

        long now = System.currentTimeMillis();
        // Mark all products as Out of Stock and save sales
        for (Sale sale : sales) {
            Product product = productRepository.findById(sale.getProductId()).get();
            product.setStock("Out of Stock");
            productRepository.save(product);

            sale.setTimestamp(now);
            sale.setStatus("Pending");
            saleRepository.save(sale);
        }

        // Trigger automated email invoice log for the bulk transaction
        try {
            String email = sales.get(0).getCustomerEmail();
            String name = sales.get(0).getCustomerName();
            String orderId = sales.get(0).getOrderId();
            emailService.sendOrderConfirmation(email, name, orderId, sales);
        } catch (Exception e) {
            System.err.println("[ProductController] Bulk confirmation email failed: " + e.getMessage());
        }

        return ResponseEntity.ok(sales);
    }

    // 7. Fetch all sales logs (for dashboard analytics)
    @GetMapping("/sales")
    public List<Sale> getAllSales() {
        return saleRepository.findAll();
    }

    // 8. Order Status Lookup
    @GetMapping("/purchase/lookup/{orderId}")
    public ResponseEntity<List<Sale>> lookupOrder(@PathVariable String orderId) {
        List<Sale> sales = saleRepository.findByOrderId(orderId);
        if (sales.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(sales);
    }

    // 9. Update Order Status
    @PutMapping("/purchase/status/{orderId}")
    public ResponseEntity<?> updateOrderStatus(@PathVariable String orderId, @RequestParam String status) {
        List<Sale> sales = saleRepository.findByOrderId(orderId);
        if (sales.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        for (Sale sale : sales) {
            sale.setStatus(status);
            saleRepository.save(sale);
        }

        return ResponseEntity.ok(sales);
    }
}
