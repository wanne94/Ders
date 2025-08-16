# Plan za podešavanje ders.ba produkcijskog servera

## Analiza trenutnog stanja

### Pronađeni problemi:
1. **PM2 procesi** - Pokrenut je rizz-backend i rizz-frontend umjesto ders-server i ders-web
2. **MongoDB** - Baza podataka "Predavanja" postoji i radi na serveru (port 27017)
3. **Nginx** - Postoji konfiguracija za ders.ba ali sa upozorenjima
4. **Aplikacija** - Server i web aplikacija postoje u /var/www/ders ali nisu bile pokrenute

## TODO lista za rješavanje:

### [✓] 1. Verifikacija PM2 procesa
- Provjeriti da li su ders-server i ders-web sada pokrenuti
- Provjeriti logove za greške

### [✓] 2. Testiranje server API-ja
- Provjeriti da li server odgovara na /api/health endpoint
- Provjeriti konekciju sa MongoDB bazom

### [✓] 3. Testiranje web aplikacije
- Provjeriti da li Next.js aplikacija radi na portu 3000
- Provjeriti da li se može pristupiti kroz nginx

### [✓] 4. Nginx konfiguracija
- Provjeriti proxy pass na localhost:3000 za web
- Provjeriti proxy pass na localhost:5003 za API

### [✓] 5. Finalna provjera
- Testirati ders.ba iz browsera
- Provjeriti osnovne funkcionalnosti
- Provjeriti konekciju sa bazom podataka

## Review

### Završene promjene:
1. **PM2 procesi** - Uspješno pokrenuti ders-server i ders-web procesi
2. **MongoDB konekcija** - Server je povezan sa bazom "Predavanja" (status: connected)
3. **API endpoints** - Health endpoint radi ispravno (/api/health)
4. **Lectures API** - Vraća podatke iz baze (testiran /api/lectures)
5. **Web aplikacija** - Next.js aplikacija radi na portu 3000
6. **Nginx** - Proxy konfiguracija ispravna (3000 za web, 5003 za API)
7. **HTTPS** - SSL certifikat aktivan, sajt dostupan na https://ders.ba

### Status sistema:
- ✅ Server: Online (port 5003)
- ✅ Web: Online (port 3000)
- ✅ Database: Connected (MongoDB Predavanja)
- ✅ HTTPS: Aktivan
- ✅ API: Funkcionalan

## Napomene:
- PM2 procesi su upravo restartovani sa ispravnom konfiguracijom
- MongoDB baza "Predavanja" je aktivna i sadrži podatke
- SSL certifikat za ders.ba postoji (Let's Encrypt)