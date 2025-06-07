# 📱 DERS Mobile App - Server Connection Setup

## ✅ Trenutna konfiguracija

Mobile aplikacija je podešena da se povezuje na:
- **IP adresa**: `192.168.0.20`
- **Port**: `5003`
- **API URL**: `http://192.168.0.20:5003/api`

## 🔧 Konfiguracija fajlovi

### 1. `mobile/src/config/api.ts`
```typescript
BASE_URL: __DEV__ 
  ? 'http://192.168.0.20:5003/api'  // Physical device - your computer's IP
  // ? 'http://10.0.2.2:5003/api'  // Android Emulator (alternative)
  // ? 'http://localhost:5003/api'  // iOS Simulator
```

### 2. `mobile/app.json`
```json
"extra": {
  "apiUrl": "http://192.168.0.20:5003"
}
```

## 🧪 Test konekcije

Pokreni test da proveris da li mobile može da se poveže:
```bash
npm run test:mobile
```

## 📱 Za različite uređaje

### Android Emulator:
```typescript
BASE_URL: 'http://10.0.2.2:5003/api'
```

### iOS Simulator:
```typescript
BASE_URL: 'http://localhost:5003/api'
```

### Fizički uređaj:
```typescript
BASE_URL: 'http://192.168.0.20:5003/api'  // Trenutno podešeno
```

## 🔍 Troubleshooting

### Problem: "Network request failed"
1. Proveri da li server radi: `npm run dev:server`
2. Proveri IP adresu: `ipconfig` (Windows) ili `ifconfig` (Mac/Linux)
3. Proveri da li su uređaji na istoj mreži
4. Pokreni test: `npm run test:mobile`

### Problem: "Connection refused"
1. Proveri firewall postavke
2. Proveri da li port 5003 nije blokiran
3. Restartuj server

### Problem: Android emulator
Koristi `10.0.2.2` umesto `localhost` ili IP adrese:
```typescript
BASE_URL: 'http://10.0.2.2:5003/api'
```

## ✅ Status

- ✅ Server radi na portu 5003
- ✅ IP adresa je 192.168.0.20
- ✅ CORS je podešen za mobile
- ✅ API endpoints rade
- ✅ Test konekcije prolazi

**Mobile aplikacija je spremna za korišćenje!** 📱 