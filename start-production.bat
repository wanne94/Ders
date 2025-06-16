@echo off
echo ========================================
echo    POKRETANJE PRODUKCIJSKE APLIKACIJE
echo ========================================

REM Postavi environment varijable za produkciju
set NODE_ENV=production
set MONGODB_URI_PRODUCTION=mongodb://avdoAdmin:WanNeAvdo1994@194.163.176.171:27017/Predavanja?authSource=admin
set PORT=5003

echo.
echo Konfiguracija:
echo   - Environment: %NODE_ENV%
echo   - Port: %PORT%
echo   - MongoDB: PRODUCTION DATABASE
echo.

echo Pokretanje servera...
cd server
node index.js

pause 