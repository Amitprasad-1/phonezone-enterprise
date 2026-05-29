package com.phonezone.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "products")
public class Product {
    @Id
    @Column(length = 50)
    private String id;

    @Column(nullable = false, length = 50)
    private String brand;

    @Column(nullable = false, length = 100)
    private String model;

    @Column(nullable = false)
    private Double price;

    private Double originalPrice;

    @Column(nullable = false, unique = true, length = 15)
    private String imei;

    @Column(nullable = false)
    private Double ageValue;

    @Column(nullable = false, length = 20)
    private String ageUnit;

    @Column(nullable = false)
    private Double warrantyValue;

    @Column(nullable = false, length = 20)
    private String warrantyUnit;

    @Column(name = "phone_condition", nullable = false, length = 50)
    private String phoneCondition; // Maps 'Condition' ('Like New', 'Excellent', etc.)

    @Column(nullable = false, length = 50)
    private String seal; // 'Sealed', 'Open-Box', 'Unsealed'

    @Column(nullable = false, length = 255)
    private String image;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(nullable = false, length = 30)
    private String stock; // 'In Stock' or 'Out of Stock'

    // --- Getters & Setters ---

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Double getOriginalPrice() {
        return originalPrice;
    }

    public void setOriginalPrice(Double originalPrice) {
        this.originalPrice = originalPrice;
    }

    public String getImei() {
        return imei;
    }

    public void setImei(String imei) {
        this.imei = imei;
    }

    public Double getAgeValue() {
        return ageValue;
    }

    public void setAgeValue(Double ageValue) {
        this.ageValue = ageValue;
    }

    public String getAgeUnit() {
        return ageUnit;
    }

    public void setAgeUnit(String ageUnit) {
        this.ageUnit = ageUnit;
    }

    public Double getWarrantyValue() {
        return warrantyValue;
    }

    public void setWarrantyValue(Double warrantyValue) {
        this.warrantyValue = warrantyValue;
    }

    public String getWarrantyUnit() {
        return warrantyUnit;
    }

    public void setWarrantyUnit(String warrantyUnit) {
        this.warrantyUnit = warrantyUnit;
    }

    public String getPhoneCondition() {
        return phoneCondition;
    }

    public void setPhoneCondition(String phoneCondition) {
        this.phoneCondition = phoneCondition;
    }

    public String getSeal() {
        return seal;
    }

    public void setSeal(String seal) {
        this.seal = seal;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStock() {
        return stock;
    }

    public void setStock(String stock) {
        this.stock = stock;
    }
}
