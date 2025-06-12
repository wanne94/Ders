@echo off
echo ========================================
echo   TEST LOKALNE MONGODB BAZE
echo ========================================
echo.

echo 🔧 Postavljanje environment varijabli...
set NODE_ENV=development
set MONGODB_URI=mongodb://127.0.0.1:27017/Predavanja

echo.
echo 📋 Konfiguracija:
echo   - Environment: %NODE_ENV%
echo   - MongoDB URI: %MONGODB_URI%
echo.

echo 🔍 Provjera MongoDB servisa...
mongosh --eval "db.adminCommand('ismaster')" --quiet
if %errorlevel% neq 0 (
    echo ❌ MongoDB nije pokrenut!
    echo Pokrenite MongoDB servis:
    echo   net start MongoDB
    pause
    exit /b 1
)

echo ✅ MongoDB je pokrenut!
echo.

echo 🗄️ Provjera baze "Predavanja"...
mongosh Predavanja --eval "print('Kolekcije u bazi:'); db.getCollectionNames().forEach(function(name) { print('  - ' + name + ' (' + db.getCollection(name).countDocuments() + ' dokumenata)'); })" --quiet

echo.
echo 🔗 Test konekcije iz Node.js aplikacije...
cd server
node check-db.js

echo.
echo ✅ Test završen!
echo.
echo 💡 Napomene:
echo   - Ako je baza prazna, to je normalno za novo development okruženje
echo   - Možete dodati test podatke kroz aplikaciju
echo   - Za import podataka iz produkcije, koristite backup skripte
echo.
pause 