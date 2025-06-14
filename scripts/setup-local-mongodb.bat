@echo off
echo Konfiguriranje MongoDB-a za WSL2 pristup...

echo.
echo 1. Pokretanje MongoDB servisa...
net start MongoDB
if %errorlevel% neq 0 (
    echo MongoDB servis nije pokrenut ili nije instaliran
    goto :EOF
)

echo.
echo 2. Kreiranje port proxy za WSL2 pristup...
netsh interface portproxy add v4tov4 listenport=27017 listenaddress=0.0.0.0 connectport=27017 connectaddress=127.0.0.1

echo.
echo 3. Dodavanje firewall pravila...
netsh advfirewall firewall add rule name="MongoDB WSL2" dir=in action=allow protocol=TCP localport=27017

echo.
echo MongoDB je konfigurisan za WSL2 pristup!
echo Koristiti: mongodb://172.31.112.1:27017/Predavanja

pause