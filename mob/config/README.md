# Konfiguracija okruženja za DERS Mobile App

## Pregled

Aplikacija automatski detektuje okruženje i koristi odgovarajuću konfiguraciju:

- **Development**: Koristi lokalni server na vašoj IP adresi
- **Production**: Koristi https://ders.ba

## Development konfiguracija

### Ažuriranje IP adrese

Ako se promeni IP adresa vašeg računara, ažurirajte je u `network.js`:

```javascript
export const NETWORK_CONFIG = {
  LOCAL_IP: '192.168.0.20', // <- Ažurirajte ovu vrednost
  LOCAL_PORT: '5003',
  PRODUCTION_URL: 'https://ders.ba'
};
```

### Kako pronaći IP adresu

Na Windows-u:
```cmd
ipconfig
```

Tražite "IPv4 Address" u sekciji za vašu mrežnu karticu.

### Testiranje konekcije

Pre pokretanja aplikacije, proverite da li server radi:
```
http://192.168.0.20:5003/api
```

## Production build

Za production build, aplikacija će automatski koristiti https://ders.ba

## Struktura fajlova

- `index.js` - Glavni konfiguracija fajl koji automatski bira okruženje
- `env.development.js` - Development konfiguracija
- `env.production.js` - Production konfiguracija  
- `network.js` - Network postavke za lakše upravljanje IP adresama

## Korišćenje u kodu

```javascript
import { ENV } from '../config';

// Koristi ENV.API_URL, ENV.SERVER_URL, itd.
``` 