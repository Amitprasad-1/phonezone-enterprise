package com.phonezone.config;

import com.phonezone.model.Product;
import com.phonezone.repository.ProductRepository;
import com.phonezone.repository.SaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SaleRepository saleRepository;

    @Override
    public void run(String... args) throws Exception {
        if (productRepository.count() < 10) {
            // Clear existing seed data to prevent duplicate keys
            productRepository.deleteAll();
            System.out.println(">>> Cleared existing stock data for fresh database seed...");

            List<Product> list = new ArrayList<>();
            list.add(createProduct("PZ-1000", "Apple", "iPhone 15 Pro Max", 109900.0, 159900.0, "358291049281701", 2.0, "months", 10.0, "months", "Like New", "Open-Box", "assets/images/iphone.png", "In Stock", "Titanium Black, 256GB. Battery health 100%. Unused inbox accessories. Absolute pristine condition with no signs of wear.", 8, 256, 100));
            list.add(createProduct("PZ-1001", "Apple", "iPhone 15 Pro", 89900.0, 134900.0, "358291049281702", 3.0, "months", 9.0, "months", "Like New", "Open-Box", "assets/images/iphone.png", "In Stock", "Natural Titanium, 128GB. Battery health 99%. Screen protector pre-applied. Ships in original box with USB-C cable.", 8, 128, 99));
            list.add(createProduct("PZ-1002", "Apple", "iPhone 15 Plus", 74900.0, 89900.0, "358291049281703", 1.0, "months", 11.0, "months", "Like New", "Sealed", "assets/images/iphone.png", "In Stock", "Brand new, factory sealed device. Unopened box with intact security pull tabs. Black, 128GB storage variant.", 6, 128, 100));
            list.add(createProduct("PZ-1003", "Apple", "iPhone 15", 64900.0, 79900.0, "358291049281704", 4.0, "months", 8.0, "months", "Excellent", "Unsealed", "assets/images/iphone.png", "In Stock", "Blue edition, 128GB. Excellent condition with one tiny micro-scratch on the back panel. Battery health at 98%. Includes charging cord.", 6, 128, 98));
            list.add(createProduct("PZ-1004", "Apple", "iPhone 14 Pro Max", 79900.0, 139900.0, "358291049281705", 1.2, "years", 0.0, "months", "Excellent", "Unsealed", "assets/images/iphone.png", "In Stock", "Space Black, 256GB. Cosmetic condition 9/10. Extremely clean screen. Battery health is at 89%. Device only, repackaged in secure box.", 6, 256, 89));
            list.add(createProduct("PZ-1005", "Apple", "iPhone 14 Pro", 69900.0, 119900.0, "358291049281706", 1.5, "years", 0.0, "months", "Good", "Unsealed", "assets/images/iphone.png", "In Stock", "Deep Purple, 128GB. Solid working condition. Minor paint rub near camera rings. Battery health at 86%. Screen has minor light scratches.", 6, 128, 86));
            list.add(createProduct("PZ-1006", "Apple", "iPhone 14 Plus", 54900.0, 89900.0, "358291049281707", 1.0, "years", 0.0, "months", "Excellent", "Unsealed", "assets/images/iphone.png", "In Stock", "Purple, 128GB. Screen is perfect. Frame has tiny scuffs from regular dust in phone case. Battery health at 91%.", 6, 128, 91));
            list.add(createProduct("PZ-1007", "Apple", "iPhone 14", 48900.0, 69900.0, "358291049281708", 1.6, "years", 0.0, "months", "Good", "Unsealed", "assets/images/iphone.png", "In Stock", "Midnight Black, 128GB. Good cosmetic state, minor corner scuffs. Fully functional camera and screen. Battery capacity at 85%.", 6, 128, 85));
            list.add(createProduct("PZ-1008", "Apple", "iPhone 13 Pro Max", 59900.0, 129900.0, "358291049281709", 2.2, "years", 0.0, "months", "Good", "Unsealed", "assets/images/iphone.png", "In Stock", "Sierra Blue, 128GB. Legendary battery life, currently at 84% health. Body has minor scuffs. Screen protector installed. Generic cable included.", 6, 128, 84));
            list.add(createProduct("PZ-1009", "Apple", "iPhone 13 Pro", 52900.0, 109900.0, "358291049281710", 2.4, "years", 0.0, "months", "Fair", "Unsealed", "assets/images/iphone.png", "In Stock", "Graphite edition, 128GB. Fair condition with visible scuffs on stainless steel rails. Screen has 2 medium hairline scratches. Battery at 81%.", 6, 128, 81));
            list.add(createProduct("PZ-1010", "Apple", "iPhone 13", 39900.0, 59900.0, "358291049281711", 2.0, "years", 0.0, "months", "Excellent", "Unsealed", "assets/images/iphone.png", "In Stock", "Starlight White, 128GB. Very clean device, owned by a single user. Screen is scratch-free. Battery capacity at 87%. Fully functional.", 4, 128, 87));
            list.add(createProduct("PZ-1011", "Apple", "iPhone 15 Pro", 91900.0, 134900.0, "358291049281712", 2.0, "months", 10.0, "months", "Like New", "Open-Box", "assets/images/iphone.png", "Out of Stock", "White Titanium, 128GB. Battery health 100%. Flawless diagnostics run. Checked and certified, currently reserved/sold.", 8, 128, 100));
            list.add(createProduct("PZ-1012", "Samsung", "Galaxy S24 Ultra", 99900.0, 134900.0, "359183028194701", 1.0, "months", 11.0, "months", "Like New", "Open-Box", "assets/images/samsung.png", "In Stock", "Titanium Violet, 512GB storage. Phenomenal screen, S-Pen intact. Box and unused fast charging cable included. Battery health 100%.", 12, 512, 100));
            list.add(createProduct("PZ-1013", "Samsung", "Galaxy S24+", 74900.0, 99900.0, "359183028194702", 2.0, "months", 10.0, "months", "Like New", "Open-Box", "assets/images/samsung.png", "In Stock", "Onyx Black, 256GB. Dynamic AMOLED 2X display is pristine. Extremely snappy performance. Comes with a complimentary premium case.", 12, 256, 100));
            list.add(createProduct("PZ-1014", "Samsung", "Galaxy S24", 62900.0, 79900.0, "359183028194703", 2.5, "months", 9.5, "months", "Excellent", "Unsealed", "assets/images/samsung.png", "In Stock", "Marble Gray, 128GB. Compact powerhouse in excellent condition. Screen has zero scratches. Frame has minimal wear. Battery capacity 100%.", 8, 128, 100));
            list.add(createProduct("PZ-1015", "Samsung", "Galaxy Z Fold 5", 94900.0, 154900.0, "359183028194704", 6.0, "months", 6.0, "months", "Excellent", "Unsealed", "assets/images/samsung.png", "In Stock", "Phantom Black, 256GB folding phone. Inner folding screen protector is fresh and clean. Hinge opens fully and smoothly. Minor surface dust.", 12, 256, 95));
            list.add(createProduct("PZ-1016", "Samsung", "Galaxy Z Flip 5", 54900.0, 99900.0, "359183028194705", 8.0, "months", 4.0, "months", "Excellent", "Unsealed", "assets/images/samsung.png", "In Stock", "Mint green, 256GB. Flip mechanism works perfectly. Outer screen has zero scratches. Internal panel is flawless. Generic cable included.", 8, 256, 94));
            list.add(createProduct("PZ-1017", "Samsung", "Galaxy S23 Ultra", 74900.0, 124900.0, "359183028194706", 1.1, "years", 0.0, "months", "Excellent", "Unsealed", "assets/images/samsung.png", "In Stock", "Green, 256GB. Screen protector was used since day one. Camera lenses are clear and clean. Battery capacity at 90%. S-Pen works flawlessly.", 12, 256, 90));
            list.add(createProduct("PZ-1018", "Samsung", "Galaxy S23+", 49900.0, 94900.0, "359183028194707", 1.2, "years", 0.0, "months", "Good", "Unsealed", "assets/images/samsung.png", "In Stock", "Cream, 256GB. Overall good shape. Frame has tiny paint chips near speaker grills. Screen is free of major scratches. Battery health at 88%.", 8, 256, 88));
            list.add(createProduct("PZ-1019", "Samsung", "Galaxy S23", 39900.0, 74900.0, "359183028194708", 1.3, "years", 0.0, "months", "Excellent", "Unsealed", "assets/images/samsung.png", "In Stock", "Lavender, 128GB. Clean frame and pristine glass panels. Pocket lint marks on USB port but fully operational. Battery capacity at 91%.", 8, 128, 91));
            list.add(createProduct("PZ-1020", "Samsung", "Galaxy S22 Ultra", 48900.0, 109900.0, "359183028194709", 2.2, "years", 0.0, "months", "Good", "Unsealed", "assets/images/samsung.png", "In Stock", "Burgundy, 256GB. Display is bright with no screen burn-in. Haptic feedback and S-Pen are tested good. Back glass has minor scratch. Battery at 86%.", 12, 256, 86));
            list.add(createProduct("PZ-1021", "Samsung", "Galaxy S22+", 34900.0, 84900.0, "359183028194710", 2.3, "years", 0.0, "months", "Good", "Unsealed", "assets/images/samsung.png", "In Stock", "Phantom White, 128GB. Clean display glass. Side metallic frames have minor paint scuffs. Cameras function perfectly. Battery health at 83%.", 8, 128, 83));
            list.add(createProduct("PZ-1022", "Samsung", "Galaxy S22", 26900.0, 72900.0, "359183028194711", 2.4, "years", 0.0, "months", "Fair", "Unsealed", "assets/images/samsung.png", "In Stock", "Pink Gold, 128GB. Budget flagship. Outer frame has scuffs and one minor ding. Screen has light micro-scratches. Battery capacity at 81%.", 8, 128, 81));
            list.add(createProduct("PZ-1023", "Samsung", "Galaxy S24 Ultra", 104900.0, 134900.0, "359183028194712", 15.0, "days", 11.5, "months", "Like New", "Sealed", "assets/images/samsung.png", "Out of Stock", "Titanium Yellow, 512GB. Brand new sealed unit, unopened package. Full domestic warranty remaining.", 12, 512, 100));
            list.add(createProduct("PZ-1024", "Google", "Pixel 8 Pro", 68900.0, 99900.0, "354829104829701", 1.0, "months", 11.0, "months", "Like New", "Open-Box", "assets/images/pixel.png", "In Stock", "Obsidian Black, 128GB. Flawless condition. Excellent camera performance, AI features certified working. Battery capacity is 100%.", 12, 128, 100));
            list.add(createProduct("PZ-1025", "Google", "Pixel 8", 49900.0, 75900.0, "354829104829702", 2.0, "months", 10.0, "months", "Like New", "Open-Box", "assets/images/pixel.png", "In Stock", "Hazel tint, 128GB. Minimal usage, zero scratches on screen or visor. Pure Android experience. Includes original USB cable and box.", 8, 128, 100));
            list.add(createProduct("PZ-1026", "Google", "Pixel Fold", 89900.0, 174900.0, "354829104829703", 8.0, "months", 4.0, "months", "Excellent", "Unsealed", "assets/images/pixel.png", "In Stock", "Porcelain White folding phone, 256GB. Excellent hinge mechanism. Inside display film is intact. Comes in custom protective packaging.", 12, 256, 95));
            list.add(createProduct("PZ-1027", "Google", "Pixel 7 Pro", 38900.0, 84900.0, "354829104829704", 1.5, "years", 0.0, "months", "Excellent", "Unsealed", "assets/images/pixel.png", "In Stock", "Hazel, 128GB. The metal camera bar has micro-scratches typical of the polish finish. Screen is clear, zero screen burn. Battery health at 88%.", 12, 128, 88));
            list.add(createProduct("PZ-1028", "Google", "Pixel 7", 29900.0, 59900.0, "354829104829705", 1.6, "years", 0.0, "months", "Good", "Unsealed", "assets/images/pixel.png", "In Stock", "Lemongrass Green, 128GB. Good cosmetic shape. Completely clean back glass. visors have minor scratches. Battery health stands at 86%.", 8, 128, 86));
            list.add(createProduct("PZ-1029", "Google", "Pixel 7a", 27900.0, 43900.0, "354829104829706", 11.0, "months", 1.0, "months", "Excellent", "Unsealed", "assets/images/pixel.png", "In Stock", "Sea Blue, 128GB. Under manufacturer warranty. Very light usage, screen has screen guard applied. Battery capacity is at 94%.", 8, 128, 94));
            list.add(createProduct("PZ-1030", "Google", "Pixel 6 Pro", 24900.0, 79900.0, "354829104829707", 2.2, "years", 0.0, "months", "Good", "Unsealed", "assets/images/pixel.png", "In Stock", "Sorta Sunny, 128GB. Camera visor and screen display are perfect. Back panel has minor usage marks. Battery health capacity at 82%.", 12, 128, 82));
            list.add(createProduct("PZ-1031", "Google", "Pixel 6", 19900.0, 59900.0, "354829104829708", 2.3, "years", 0.0, "months", "Good", "Unsealed", "assets/images/pixel.png", "In Stock", "Kinda Coral, 128GB. Functional, clean software. Frame paint has worn slightly around buttons. Battery health capacity at 84%.", 8, 128, 84));
            list.add(createProduct("PZ-1032", "Google", "Pixel 6a", 16900.0, 39900.0, "354829104829709", 1.8, "years", 0.0, "months", "Excellent", "Unsealed", "assets/images/pixel.png", "In Stock", "Charcoal Black, 128GB. Excellent performance and battery health (90%). No visible cosmetic damage on the display or back.", 6, 128, 90));
            list.add(createProduct("PZ-1033", "Google", "Pixel 5", 12900.0, 59900.0, "354829104829710", 3.0, "years", 0.0, "months", "Fair", "Unsealed", "assets/images/pixel.png", "In Stock", "Just Black, 128GB. Pocket-friendly size. Rear bioplastic coating has minor friction marks. Fully functional fingerprint sensor. Battery at 77%.", 8, 128, 77));
            list.add(createProduct("PZ-1034", "Google", "Pixel 8 Pro", 71900.0, 99900.0, "354829104829711", 10.0, "days", 11.5, "months", "Like New", "Sealed", "assets/images/pixel.png", "Out of Stock", "Mint color, 128GB. Brand new sealed package. A highly-coveted special edition.", 12, 128, 100));
            list.add(createProduct("PZ-1035", "OnePlus", "OnePlus 12", 58900.0, 64900.0, "863920194829101", 3.0, "months", 9.0, "months", "Like New", "Open-Box", "assets/images/pixel.png", "In Stock", "Flowy Emerald green edition. 12GB RAM, 256GB storage. Extremely clean. Includes original SuperVOOC fast charger and box. Battery 100%.", 12, 256, 100));
            list.add(createProduct("PZ-1036", "OnePlus", "OnePlus 12R", 36900.0, 39900.0, "863920194829102", 2.0, "months", 10.0, "months", "Like New", "Open-Box", "assets/images/pixel.png", "In Stock", "Cool Blue, 128GB. Fantastic battery capacity. Screen is pristine, comes with original charger adapter and red cable.", 8, 128, 99));
            list.add(createProduct("PZ-1037", "OnePlus", "OnePlus Open", 109900.0, 139900.0, "863920194829103", 5.0, "months", 7.0, "months", "Like New", "Open-Box", "assets/images/pixel.png", "In Stock", "Emerald Dusk, 512GB premium foldable. Incredible crease-free inner display. Comes with original protective shell and charger box.", 16, 512, 98));
            list.add(createProduct("PZ-1038", "OnePlus", "OnePlus 11", 41900.0, 56900.0, "863920194829104", 1.1, "years", 0.0, "months", "Excellent", "Unsealed", "assets/images/pixel.png", "In Stock", "Eternal Green, 256GB. Excellent visual shape, no paint chipping. Screen protector pre-installed. Battery health is at 91%.", 8, 256, 91));
            list.add(createProduct("PZ-1039", "OnePlus", "OnePlus 11R", 29900.0, 39900.0, "863920194829105", 1.0, "years", 0.0, "months", "Excellent", "Unsealed", "assets/images/pixel.png", "In Stock", "Galactic Silver, 128GB. Very clean frame, cameras are clear. Rapid charge tested and certified. Battery capacity at 93%.", 8, 128, 93));
            list.add(createProduct("PZ-1040", "OnePlus", "OnePlus 10 Pro", 27900.0, 66900.0, "863920194829106", 2.0, "years", 0.0, "months", "Good", "Unsealed", "assets/images/pixel.png", "In Stock", "Volcanic Black, 128GB. Display has minor micro-scratches. Camera lens glass is flawless. Dynamic 120Hz runs smooth. Battery at 86%.", 8, 128, 86));
            list.add(createProduct("PZ-1041", "OnePlus", "OnePlus 10T", 23900.0, 49900.0, "863920194829107", 1.8, "years", 0.0, "months", "Good", "Unsealed", "assets/images/pixel.png", "In Stock", "Jade Green, 128GB. Frame has case-rub marks. Display screen is scratch-free. 150W charging speeds verified. Battery health at 85%.", 8, 128, 85));
            list.add(createProduct("PZ-1042", "OnePlus", "OnePlus Nord 3", 21900.0, 33900.0, "863920194829108", 8.0, "months", 4.0, "months", "Excellent", "Unsealed", "assets/images/pixel.png", "In Stock", "Tempest Gray, 128GB. Checked by our technicians, completely clean display and back glass. Battery capacity is at 94%.", 8, 128, 94));
            list.add(createProduct("PZ-1043", "OnePlus", "OnePlus Nord CE 3", 16900.0, 26900.0, "863920194829109", 9.0, "months", 3.0, "months", "Good", "Unsealed", "assets/images/pixel.png", "In Stock", "Aqua Surge, 128GB. Good working condition, slight pocket scratches on display panel. Fully functional in-screen fingerprint sensor.", 8, 128, 92));
            list.add(createProduct("PZ-1044", "OnePlus", "OnePlus 9 Pro", 19900.0, 64900.0, "863920194829110", 2.8, "years", 0.0, "months", "Fair", "Unsealed", "assets/images/pixel.png", "In Stock", "Pine Green, 256GB. Hasselblad camera is great. Frame has visible marks and paint peeling near buttons. Battery health capacity at 80%.", 8, 256, 80));
            list.add(createProduct("PZ-1045", "Xiaomi", "Xiaomi 14", 54900.0, 69900.0, "864720194829101", 2.0, "months", 10.0, "months", "Like New", "Open-Box", "assets/images/pixel.png", "In Stock", "Black, 256GB storage. Compact flagship with Leica optics. Absolute mint condition with 100% battery capacity. Original accessories included.", 12, 256, 100));
            list.add(createProduct("PZ-1046", "Xiaomi", "Xiaomi 13 Pro", 42900.0, 79900.0, "864720194829102", 1.2, "years", 0.0, "months", "Excellent", "Unsealed", "assets/images/pixel.png", "In Stock", "Ceramic Black, 256GB. Heavy ceramic back is scratch-free. Screen has zero burn-in. Leica portrait lenses are flawless. Battery at 88%.", 12, 256, 88));
            list.add(createProduct("PZ-1047", "Xiaomi", "Xiaomi 13 Ultra", 62900.0, 99900.0, "864720194829103", 1.1, "years", 0.0, "months", "Excellent", "Unsealed", "assets/images/pixel.png", "In Stock", "Olive Green, leather-like texture. Quad-camera setup works perfectly. Truly a photographer's dream. Battery health is at 90%.", 12, 512, 90));
            list.add(createProduct("PZ-1048", "Xiaomi", "Redmi Note 13 Pro+", 26900.0, 31900.0, "864720194829104", 5.0, "months", 7.0, "months", "Like New", "Open-Box", "assets/images/pixel.png", "In Stock", "Fusion Purple, 256GB. Stylish design with curved display. Screen protector applied. Comes with high speed charger block.", 8, 256, 96));
            list.add(createProduct("PZ-1049", "Xiaomi", "POCO F6", 24900.0, 29900.0, "864720194829105", 1.0, "months", 11.0, "months", "Like New", "Open-Box", "assets/images/pixel.png", "In Stock", "Titanium Gray, 256GB. Performance monster. Inspected and certified under our 45-point diagnostics. Original charger box included.", 8, 256, 99));
            list.add(createProduct("PZ-1050", "Xiaomi", "Redmi Note 12 Pro", 17900.0, 24900.0, "864720194829106", 1.3, "years", 0.0, "months", "Good", "Unsealed", "assets/images/pixel.png", "In Stock", "Onyx Black, 128GB. Fully functional budget model. Screen has extremely light pocket wear. Back glass is scratch-free. Battery at 86%.", 6, 128, 86));
            list.add(createProduct("PZ-1051", "Xiaomi", "POCO X6 Pro", 19900.0, 26900.0, "864720194829107", 4.0, "months", 8.0, "months", "Excellent", "Unsealed", "assets/images/pixel.png", "In Stock", "POCO Yellow, leather back. Perfect screen and chassis. Gaming performance tested and certified. Battery capacity is at 98%.", 8, 256, 98));
            list.add(createProduct("PZ-1052", "Xiaomi", "POCO F5", 17900.0, 29900.0, "864720194829108", 1.1, "years", 0.0, "months", "Excellent", "Unsealed", "assets/images/pixel.png", "In Stock", "Snowstorm White, 256GB. Snapdragon 7+ Gen 2 chipset. Excellent physical shape. Battery health is currently at 91%.", 8, 256, 91));
            list.add(createProduct("PZ-1053", "Xiaomi", "Xiaomi 12 Pro", 24900.0, 62900.0, "864720194829109", 2.2, "years", 0.0, "months", "Good", "Unsealed", "assets/images/pixel.png", "In Stock", "Purple, 256GB. Beautiful quad-curved WQHD+ display. Speaker sound is loud and clear. Back panel is perfect. Battery capacity at 83%.", 8, 256, 83));
            list.add(createProduct("PZ-1054", "Xiaomi", "Redmi Note 11 Pro", 11900.0, 21900.0, "864720194829110", 2.8, "years", 0.0, "months", "Fair", "Unsealed", "assets/images/pixel.png", "In Stock", "Polar White, 128GB. Solid backup phone. Minor scuffs on plastic frame sides. Screen has a tiny chip in top-right corner. Battery at 79%", 6, 128, 79));
            productRepository.saveAll(list);
            System.out.println(">>> Database seeder completed. " + list.size() + " phones populated in products table.");
        }
    }

    private Product createProduct(String id, String brand, String model, double price, Double originalPrice, String imei, 
                                  double ageValue, String ageUnit, double warrantyValue, String warrantyUnit, 
                                  String condition, String seal, String image, String stock, String description,
                                  Integer ram, Integer rom, Integer batteryHealth) {
        Product p = new Product();
        p.setId(id);
        p.setBrand(brand);
        p.setModel(model);
        p.setPrice(price);
        p.setOriginalPrice(originalPrice);
        p.setImei(imei);
        p.setAgeValue(ageValue);
        p.setAgeUnit(ageUnit);
        p.setWarrantyValue(warrantyValue);
        p.setWarrantyUnit(warrantyUnit);
        p.setPhoneCondition(condition);
        p.setSeal(seal);
        p.setImage(image);
        p.setStock(stock);
        p.setDescription(description);
        p.setRam(ram);
        p.setRom(rom);
        p.setBatteryHealth(batteryHealth);
        return p;
    }
}
