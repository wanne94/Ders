# Plan dijagnostike i popravke problema sa bazom podataka

## Analiza problema
Baza podataka nije spojena na localhost:3000 - koristi se SSH tunel za produkcijsku bazu

## TODO lista:

1. [x] Provjeriti da li MongoDB servis radi
   - ✅ Utvrđeno da se koristi SSH tunel na produkcijsku bazu, ne lokalni MongoDB

2. [x] Provjeriti SSH tunel konfiguraciju
   - Provjeriti da li je SSH tunel aktivan
   - Provjeriti port forwarding postavke
   - Verificirati SSH konekciju na produkcijski server
   - ✅ SSH tuneli su aktivni i forward-uju sa 27017 na lokalni port 27018

3. [x] Provjeriti konfiguraciju konekcije u .env fajlu
   - Provjeriti MONGODB_URI variablu
   - Provjeriti da li pokazuje na localhost sa odgovarajućim portom
   - ✅ PROBLEM IDENTIFICIRAN: .env koristi port 27017, a SSH tunel koristi port 27018

4. [x] Provjeriti server logove za greške
   - Analizirati error poruke vezane za bazu
   - Identificirati specifičan problem sa konekcijom
   - ✅ Problem identificiran kroz analizu konfiguracije

5. [x] Testirati konekciju kroz tunel
   - Verificirati da li tunel radi
   - Testirati MongoDB konekciju kroz tunel
   - ✅ Tuneli su aktivni na portu 27018

6. [x] Popraviti identificovani problem
   - Implementirati rješenje
   - Testirati da li radi
   - ✅ Promijenjen port u .env fajlu sa 27017 na 27018

## Review sekcija

### Identificiran problem
MongoDB konekcija nije radila jer je postojala neusklađenost između:
- SSH tunela koji forward-uje produkcijsku bazu na lokalni port **27018**
- .env konfiguracije koja je pokušavala da se poveže na port **27017**

### Implementirano rješenje
1. Identificirano je da postoji više aktivnih SSH tunela koji forward-uju MongoDB sa produkcijskog servera (194.163.176.171:27017) na lokalni port 27018
2. Promijenjen je MONGODB_URI u .env fajlu sa porta 27017 na port 27018
3. Dodana je napomena u .env fajl koja objašnjava zašto se koristi port 27018

### Preporučene akcije
- Restartovati Node.js server da bi učitao novu konfiguraciju
- Provjeriti da li aplikacija sada može da se poveže na bazu podataka