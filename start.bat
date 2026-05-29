@echo off
title PhoneZone E-Commerce Full-Stack Starter
echo ===================================================
echo   PhoneZone Starter System - Spring Boot + MySQL
echo ===================================================

:: 1. Start Spring Boot Backend in a separate console window
echo [1/2] Launching Spring Boot backend service (Port 8080)...
start "Spring Boot Backend" cmd /k "cd phonezone-backend && .\mvnw.cmd spring-boot:run"

:: 2. Wait for Spring Boot to warm up (approx 6 seconds)
echo [2/2] Warming up database connections...
timeout /t 6 /nobreak > nul

:: 3. Launch the PhoneZone Frontend client page in browser
echo Launching PhoneZone E-Commerce storefront page...
start "" "phonezone-frontend\index.html"

echo ===================================================
echo PhoneZone system initialization completed.

echo Please leave the backend terminal window running.
echo ===================================================
pause
