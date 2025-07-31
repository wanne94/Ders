# Plan za rješavanje API grešaka (500 errors) u mobilnoj aplikaciji

## Problem:
Mobilna aplikacija prikazuje 500 greške pri pokušaju dohvaćanja podataka sa sljedećih endpoint-a:
- `/api/daije/public` - Greška pri dohvaćanju daija
- `/api/lectures/dashboard/public` - Greška pri dohvaćanju predavanja za dashboard
- `/api/organizations/public` - Greška pri dohvaćanju organizacija

## TODO Lista:

- [x] Analiziraj API greške (500 error) za daije, lectures i organizations endpoints
- [x] Provjeri backend API rute i middleware za public endpoints
- [x] Provjeri konfiguraciju API URL-a u mobilnoj aplikaciji
- [x] Provjeri da li backend server radi i da li je dostupan na http://192.168.0.20:5003
- [x] Provjeri CORS konfiguraciju na backend serveru
- [x] Implementiraj rješenja za API greške

## Review Sekcija:

### Pronađen uzrok problema:
Backend server ne može da se poveže sa MongoDB bazom podataka jer SSH tunel nije pokrenut. Server koristi port 27018 koji se forward-uje na remote MongoDB server putem SSH tunela.

### Analiza:
1. **API greške** - Svi endpoint-i vraćaju 500 grešku jer ne mogu pristupiti bazi podataka
2. **Backend rute** - Rute su ispravno implementirane sa try/catch blokovima
3. **API konfiguracija** - Mobilna aplikacija koristi ispravnu adresu (http://192.168.0.20:5003)
4. **CORS** - Ispravno konfigurisano za sve domene u development modu
5. **MongoDB konekcija** - Server pokušava da se poveže na mongodb://127.0.0.1:27018/Predavanja ali SSH tunel nije aktivan

### Rješenje:
Za pokretanje aplikacije u development modu, potrebno je:

1. **Pokrenuti SSH tunel** koji forward-uje lokalni port 27018 na remote MongoDB:
   ```bash
   ssh -L 27018:localhost:27017 root@194.163.176.171 -N
   ```
   Password: WanNeAvdo1994

2. **Alternativno rješenje** - Instalirati lokalnu MongoDB instancu i promijeniti MONGODB_URI u .env fajlu na:
   ```
   MONGODB_URI=mongodb://127.0.0.1:27017/Predavanja
   ```

### Napomene:
- Server već ima skripte za pokretanje tunela: `start-ssh-tunnel.sh` i `setup-mongodb-tunnel.sh`
- Za produkciju se koristi direktna konekcija bez tunela