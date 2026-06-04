@echo off
setlocal enabledelayedexpansion
title PhoneZone E-Commerce Full-Stack Starter
echo ===================================================
echo   PhoneZone Starter System - Spring Boot + MySQL
echo ===================================================

:: 1. Start Spring Boot Backend in a separate console window
echo [1/3] Launching Spring Boot backend service (Port 8080)...
start "Spring Boot Backend" cmd /k "cd phonezone-backend && .\mvnw.cmd spring-boot:run"

:: 2. Start Frontend HTTP Server in a separate window
echo [2/3] Launching Frontend HTTP Server (Port 8081)...
start "PhoneZone Frontend Server" cmd /c "npx -y http-server phonezone-frontend -p 8081 -c-1"

:: 3. Wait for services to warm up
echo [3/3] Warming up services and database connections...
timeout /t 5 /nobreak > nul

:: Find Local IPv4 Address for Mobile Access
set "MY_IP=localhost"
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "ipv4"') do (
    set "temp_ip=%%a"
    for /f "tokens=*" %%b in ("!temp_ip!") do set "temp_ip=%%b"
    if "!MY_IP!"=="localhost" (
        echo !temp_ip! | findstr /r "^192\." >nul && set "MY_IP=!temp_ip!"
        echo !temp_ip! | findstr /r "^10\." >nul && set "MY_IP=!temp_ip!"
        echo !temp_ip! | findstr /r "^172\." >nul && set "MY_IP=!temp_ip!"
    )
)

:: 4. Launch local browser
echo Launching PhoneZone E-Commerce storefront page...
start "" "http://localhost:8081/index.html"

echo ===================================================
echo PhoneZone system initialization completed.
echo ===================================================
echo.
echo  ACCESS FROM YOUR PC:
echo  Storefront URL:  http://localhost:8081/index.html
echo  Backend API:     http://localhost:8080/api/products
echo.
echo  ACCESS FROM YOUR MOBILE PHONE:
echo  1. Make sure your phone is on the same Wi-Fi network.
echo  2. Open the following address on your phone browser:
echo.
echo     http://!MY_IP!:8081/index.html
echo.
echo ===================================================
echo Please leave the backend and frontend server windows open.
echo ===================================================
pause
