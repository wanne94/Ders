# DERS Mobile - API Konfiguracija

## Povezivanje sa bazom podataka

Mobilna aplikacija je sada konfigurirana da koristi isti API kao web aplikacija preko `https://ders.ba`.

### 1. Konfiguracija API URL-a

API URL je sada konfigurisan u `src/config/api.js` da koristi isti endpoint kao web aplikacija:

```javascript
export const API_CONFIG = {
  BASE_URL: 'https://ders.ba',  // Isti kao web aplikacija
  // Reverse proxy automatski preusmjerava /api pozive na backend server
};
```

### 2. Kako funkcioniše

- **Web aplikacija**: koristi `https://ders.ba/api/*`
- **Mobile aplikacija**: sada također koristi `https://ders.ba/api/*`
- **Backend server**: radi na `http://194.163.176.171:5003`
- **Reverse proxy**: preusmjerava HTTPS pozive na backend

### 3. Za testiranje na fizičkom uređaju

Mobilna aplikacija će se sada spojiti na produkcijski server preko HTTPS-a, što znači da će raditi na bilo kom uređaju sa internet konekcijom.

### 4. Backup konfiguracije

U slučaju problema, dostupne su backup opcije u `API_URLS`:

```javascript
export const API_URLS = {
  production: 'https://ders.ba',             // Glavni URL (trenutno aktivni)
  production_direct: 'http://ders.ba:5003',  // Direktan pristup backend-u
  production_ip: 'http://194.163.176.171:5003', // IP adresa backend-a
};
```

### 5. Funkcionalnosti koje koriste API

- **Početna stranica**: Učitava predavanja, udruženja i daije
- **Predavanja**: Lista i pretraga predavanja
- **Daije**: Lista i pretraga islamskih učenjaka  
- **Udruženja**: Lista i pretraga organizacija

### 6. Error Handling

Aplikacija automatski:
- Prikazuje loading indikatore tokom učitavanja
- Prikazuje error poruke ako API nije dostupan
- Nudi "Pokušaj ponovo" dugme za retry
- Koristi fallback mock podatke ako je potrebno

### 7. Autentifikacija (budućnost)

API konfiguracija je spremna za:
- JWT token authentification
- AsyncStorage za čuvanje token-a
- Automatsko refresh token-a
- Logout kada token istekne

### 8. Troubleshooting

**Problem**: Aplikacija ne može da se poveže sa serverom
**Rešenje**: 
1. Provjerite internet konekciju
2. Provjerite da li je `https://ders.ba` dostupan
3. Provjerite konzolu za error poruke

**Problem**: Podaci se ne učitavaju
**Rešenje**: 
1. Provjerite mrežnu konekciju
2. Provjerite da li web aplikacija radi na `https://ders.ba`
3. Koristite "Pokušaj ponovo" dugme

### 9. HTTPS i sigurnost

- Mobilna aplikacija sada koristi HTTPS za sve API pozive
- SSL certifikat je automatski validiran
- Svi podaci su enkriptovani tokom prenosa

### 10. Produkcijska konfiguracija

Mobilna aplikacija je sada konfigurirana za produkciju:
- Koristi isti URL kao web aplikacija
- Automatski se spaja na produkcijski server
- Nema potrebe za lokalnim backend serverom 