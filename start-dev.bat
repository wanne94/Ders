@echo off
echo ========================================
echo   POKRETANJE LOKALNOG DEVELOPMENT OKRUZENJA
echo ========================================
echo.

echo 🔧 Postavljanje environment varijabli za lokalni razvoj...
set NODE_ENV=development
set MONGODB_URI=mongodb://127.0.0.1:27017/Predavanja
set PORT=5003
set DEBUG=true
set NEXT_PUBLIC_SERVER_URL=http://localhost:5003
set NEXT_PUBLIC_API_URL=http://localhost:5003/api

echo.
echo 📋 Konfiguracija:
echo   - Environment: %NODE_ENV%
echo   - MongoDB: %MONGODB_URI%
echo   - Server Port: %PORT%
echo   - Upload folder: public/upload/images (lokalno)
echo.

echo 🚀 Pokretanje servera...
echo.
cd server
start "Backend Server" cmd /k "npm run dev"

echo ⏳ Čekanje da se server pokrene...
timeout /t 3 /nobreak > nul

echo 🌐 Pokretanje frontend-a...
cd ../packages/web
start "Frontend App" cmd /k "npm run dev"

echo.
echo ✅ Development okruženje je pokrenuto!
echo.
echo 📱 Aplikacija: http://localhost:3000
echo 🔧 Server API: http://localhost:5003/api
echo 📁 Upload test: http://localhost:5003/api/upload-image/test
echo.
echo 💾 MongoDB baza: Predavanja (lokalna)
echo 📂 Slike se čuvaju u: public/upload/images/
echo.
echo Pritisnite bilo koji taster za zatvaranje...
pause > nul 
