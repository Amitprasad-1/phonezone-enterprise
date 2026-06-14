# 📱 PhoneZone Enterprise E-Commerce Platform

[![Live Demo](https://img.shields.io/badge/Demo-Live%20on%20Vercel-cyan?style=for-the-badge&logo=vercel)](https://phonezone-enterprise.vercel.app/)
[![Java Version](https://img.shields.io/badge/Java-17%2B-violet?style=for-the-badge&logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-emerald?style=for-the-badge&logo=springboot)](https://spring.io/projects/spring-boot)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-brightgreen?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)

**PhoneZone** is a premium, state-of-the-art e-commerce platform specializing in verified open-box, unsealed, and second-hand flagship smartphones. Built with a modern glassmorphic responsive interface and backed by an enterprise Spring Boot Spring Data JPA engine, it offers a secure catalog, verified checkout logging, tracking, and owner analytics.

---

## ✨ Core Features

### 🌟 Premium UX/UI Design
- **Glassmophism & Vibrant Accent Glows**: Implemented with dynamic HSL-based dark mode and light mode layouts, spotlight backgrounds, and micro-interactions.
- **Diagonal Shine CTAs**: Buttons sweep on hover using a hardware-accelerated shine sweep animation for luxury visual feedback.
- **Always-Open Desktop Sidebar & Ergonomic Mobile Drawer**: Interactive filters stay open and clean on desktops and collapse into a smooth, dim-overlay slide-out drawer on mobile screens.

### 🧪 45-Point Hardware Diagnostics Integration
- Every smartphone listed features verified diagnostics reports visible directly on the product detail cards (battery health percentage, configuration specs, actual IMEI, warranty details, and condition tags).
- Spacing is refined using a clean, borderless list format with subtle row dividers and high-contrast typography.

### 🛡️ Verified Purchase Customer Reviews
- **Wall of Transparency**: Customers can read and submit reviews linked to authenticated transaction order IDs.
- **Dynamic Summaries**: Real-time rating breakdowns, total reviews count, and star-rating distribution bars updated client-side.

### 📶 Offline Standalone Mode (PWA)
- Fully offline-ready! If the Render.com cloud database backend goes into sleep mode or is unreachable, the frontend automatically catches connection failures, triggers an informative standalone info toast, and falls back to loading a local seeder dataset (`default-seed-data.js`).
- Complete core features—including cart checkout, order lookup, review publication, and admin stats tracking—are simulated locally and synchronized via `localStorage`.
- Manifest-ready with splash icons and service worker assets caching (`v1.1.0`) for local installation on iOS/Android home screens.

### 📊 Owner Dashboard & svg Charts
- Secure shop owner portal to manage smartphone inventory (add new listings with base64 image uploads or preset assets, toggle stock states, delete records).
- Real-time business metrics tracking: Total Revenue, active in-stock listings, sold units, and average device values.
- Dynamic SVG graphs illustrating Brand Share and Device Condition Share compositions.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend UI** | HTML5, ES6+, CSS3 | Glassmorphism, animations, responsive CSS Flexbox/Grid |
| **Ergonomics & Offline** | Service Workers (PWA) | Versioned client-side caching & service manifest config |
| **Offline Seeder** | Vanilla JavaScript | Standalone seeder fallback for live demonstration |
| **Backend API** | Spring Boot 3.x, Java 17 | REST controllers, Spring Data JPA services, seeder runners |
| **Database** | MySQL / Hibernate | Relational storage, auto-migrations, JDBC database alterations |
| **Hosting** | Vercel & Render | Continuous deployment pipeline for frontend and backend API |

---

## 📂 Repository Directory Structure

```text
├── phonezone-frontend/        # Client-side web application source files
│   ├── assets/                # Product photos, icons, apple-touch icons
│   ├── app.js                 # Core frontend business logic & API fetch bindings
│   ├── default-seed-data.js   # Local catalog seed data fallback configuration
│   ├── index.html             # Storefront template page layout
│   ├── manifest.json          # PWA Mobile manifest configuration
│   ├── styles.css             # Premium custom stylesheet rules
│   └── sw.js                  # PWA service worker caching rules
├── phonezone-backend/         # Spring Boot backend source files
│   ├── src/main/java/         # Java source packages (Model, Repo, Controller, Config)
│   ├── src/main/resources/    # Application properties configuration files
│   └── pom.xml                # Maven project dependency manifest
├── start.bat                  # One-click startup script for local environments
└── README.md                  # Project documentation manual
```

---

## 🚀 Getting Started

### 1. Prerequisite Environments
Make sure you have the following installed on your machine:
* Java Development Kit (JDK) 17 or higher
* Apache Maven (or use the provided `mvnw` wrapper)
* MySQL Server (running on port 3306)
* Node.js (for serving frontend locally via `http-server`)

### 2. Configure Database Connection
Configure your database username and password in [application.properties](file:///c:/My%20Work/Project/PhoneZone/phonezone-backend/src/main/resources/application.properties):
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/phonezone_db?createDatabaseIfNotExist=true
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

### 3. One-Click Local Run (Windows Only)
Double-click `start.bat` in the project root directory. This script will automatically:
1. Start the Spring Boot REST API server on port 8080.
2. Spin up a local static server on port 8081 for the PWA storefront.
3. Warm up database connections and launch the storefront in your web browser.

### 4. Manual Running

#### Launching Java Backend
Navigate to the backend directory and launch via Maven:
```bash
cd phonezone-backend
./mvnw spring-boot:run
```

#### Launching Frontend PWA
Navigate to the frontend directory and serve the static files:
```bash
cd phonezone-frontend
npx http-server -p 8081 -c-1
```
Now, open your web browser and navigate to `http://localhost:8081/index.html`.

---

## 📈 Auto-Migration & Schema Details
The backend features an automatic column-type alteration on startup. If your database had previously created the `image` column using a restricted datatype (like `VARCHAR(255)`), the Spring Boot seeder automatically issues an `ALTER TABLE` statement to upgrade it to `LONGTEXT`. This permits direct uploads of high-resolution Base64 condition photographs of second-hand smartphones without text truncation or rendering errors.
