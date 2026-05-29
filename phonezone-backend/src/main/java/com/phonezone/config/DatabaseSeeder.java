package com.phonezone.config;

import com.phonezone.model.Product;
import com.phonezone.repository.ProductRepository;
import com.phonezone.repository.SaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SaleRepository saleRepository;

    @Override
    public void run(String... args) throws Exception {
        if (productRepository.count() == 0) {
            Product p1 = new Product();
            p1.setId("PZ-8391");
            p1.setBrand("Apple");
            p1.setModel("iPhone 15 Pro");
            p1.setPrice(89900.00);
            p1.setOriginalPrice(99900.00);
            p1.setImei("358291049281749");
            p1.setAgeValue(3.0);
            p1.setAgeUnit("months");
            p1.setWarrantyValue(9.0);
            p1.setWarrantyUnit("months");
            p1.setPhoneCondition("Like New");
            p1.setSeal("Open-Box");
            p1.setImage("assets/images/iphone.png");
            p1.setDescription("Device is in absolute mint condition with 100% battery capacity. Space Black finish, zero hairline scratches. Comes in the original retail box with an unused USB-C charging cable and paper manuals.");
            p1.setStock("In Stock");

            Product p2 = new Product();
            p2.setId("PZ-7429");
            p2.setBrand("Samsung");
            p2.setModel("Galaxy S24 Ultra");
            p2.setPrice(94900.00);
            p2.setOriginalPrice(129900.00);
            p2.setImei("359183028194837");
            p2.setAgeValue(1.0);
            p2.setAgeUnit("months");
            p2.setWarrantyValue(11.0);
            p2.setWarrantyUnit("months");
            p2.setPhoneCondition("Like New");
            p2.setSeal("Open-Box");
            p2.setImage("assets/images/samsung.png");
            p2.setDescription("Like-new Titanium Gray edition. Standard 256GB storage variant. Includes built-in S-Pen. Tested under 45-point diagnostics showing 100% screen fidelity and battery performance. Original charging cord included.");
            p2.setStock("In Stock");

            Product p3 = new Product();
            p3.setId("PZ-5912");
            p3.setBrand("Google");
            p3.setModel("Pixel 8 Pro");
            p3.setPrice(69900.00);
            p3.setOriginalPrice(99900.00);
            p3.setImei("354829104829104");
            p3.setAgeValue(14.0);
            p3.setAgeUnit("days");
            p3.setWarrantyValue(23.0);
            p3.setWarrantyUnit("months");
            p3.setPhoneCondition("Like New");
            p3.setSeal("Sealed");
            p3.setImage("assets/images/pixel.png");
            p3.setDescription("Brand new, factory sealed device. Unopened box with intact security pull tabs. Bay Blue color. Includes full Google manufacturer warranty of 2 years starting from original purchase date.");
            p3.setStock("In Stock");

            Product p4 = new Product();
            p4.setId("PZ-2948");
            p4.setBrand("Apple");
            p4.setModel("iPhone 14 Pro");
            p4.setPrice(64900.00);
            p4.setOriginalPrice(79900.00);
            p4.setImei("358948194829184");
            p4.setAgeValue(1.5);
            p4.setAgeUnit("years");
            p4.setWarrantyValue(0.0);
            p4.setWarrantyUnit("days");
            p4.setPhoneCondition("Excellent");
            p4.setSeal("Unsealed");
            p4.setImage("assets/images/iphone.png");
            p4.setDescription("Deep Purple edition in Excellent cosmetic condition. Extremely minor micro-scratches on display frame only visible under direct light. Battery health at 88%. Device only - ships in generic box.");
            p4.setStock("In Stock");

            Product p5 = new Product();
            p5.setId("PZ-3829");
            p5.setBrand("Samsung");
            p5.setModel("Galaxy S23+");
            p5.setPrice(49900.00);
            p5.setOriginalPrice(69900.00);
            p5.setImei("356829104829381");
            p5.setAgeValue(8.0);
            p5.setAgeUnit("months");
            p5.setWarrantyValue(4.0);
            p5.setWarrantyUnit("months");
            p5.setPhoneCondition("Good");
            p5.setSeal("Unsealed");
            p5.setImage("assets/images/samsung.png");
            p5.setDescription("Good working condition. Lavender tint. Tempered glass screen protector installed. Minor finish rub on the back-left chassis corner from case friction. Battery health is at 91%. USB cable included.");
            p5.setStock("In Stock");

            Product p6 = new Product();
            p6.setId("PZ-1049");
            p6.setBrand("OnePlus");
            p6.setModel("OnePlus 12");
            p6.setPrice(59900.00);
            p6.setOriginalPrice(69900.00);
            p6.setImei("863920194829104");
            p6.setAgeValue(5.0);
            p6.setAgeUnit("months");
            p6.setWarrantyValue(7.0);
            p6.setWarrantyUnit("months");
            p6.setPhoneCondition("Excellent");
            p6.setSeal("Open-Box");
            p6.setImage("assets/images/pixel.png");
            p6.setDescription("Silky Black version in excellent condition. Equipped with Snapdragon 8 Gen 3 and ultra-fast charging. Includes original 80W SuperVOOC charger block and signature red charging cable. Screen is flawless.");
            p6.setStock("In Stock");

            productRepository.saveAll(Arrays.asList(p1, p2, p3, p4, p5, p6));
            System.out.println(">>> Database seeder completed. 6 flagship phones populated in products table.");
        }
    }
}
