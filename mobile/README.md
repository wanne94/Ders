# DERS Mobile App

React Native aplikacija za DERS platformu izgrađena sa Expo-om.

## 🚀 Značajke

- **Predavanja**: Pregled i detalji predavanja
- **Organizacije**: Lista organizacija i njihovi profili
- **Daije**: Pregled daija i povezanih predavanja
- **Autentifikacija**: Prijava i registracija korisnika
- **Offline podrška**: Osnovne funkcionalnosti rade offline
- **Push notifikacije**: Obavještenja o novim predavanjima

## 📱 Platforme

- **iOS**: iPhone i iPad
- **Android**: Telefoni i tableti
- **Web**: Expo web verzija za development

## 🛠️ Tehnologije

- **React Native**: 0.79.3
- **Expo**: ~53.0.10
- **TypeScript**: ~5.8.3
- **Axios**: Za API komunikaciju
- **React Navigation**: Za navigaciju između ekrana

## 🔧 Instalacija

### Preduvjeti

- Node.js (v18 ili noviji)
- npm ili yarn
- Expo CLI: `npm install -g @expo/cli`
- Za iOS: Xcode (samo na macOS)
- Za Android: Android Studio

### Pokretanje

1. **Instaliraj dependencies:**
   ```bash
   npm install
   ```

2. **Pokreni development server:**
   ```bash
   npm start
   ```

3. **Pokreni na platformi:**
   ```bash
   # iOS (potreban macOS)
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

## 📱 Testiranje na uređaju

### Expo Go aplikacija

1. Instaliraj Expo Go na svoj telefon:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Skeniraj QR kod koji se prikaže nakon `npm start`

### Development Build

Za naprednije funkcionalnosti:

```bash
# Kreiraj development build
npx expo install --fix
npx expo run:ios
npx expo run:android
```

## 🔗 API Konfiguracija

Aplikacija se povezuje na backend server na:
- **Development**: `http://localhost:5003`
- **Production**: Konfigurirati u `app.json`

### Promjena API URL-a

Uredi `app.json`:
```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://your-api-url.com"
    }
  }
}
```

## 📁 Struktura projekta

```
mobile/
├── src/
│   ├── components/     # Reusable komponente
│   ├── screens/        # Ekrani aplikacije
│   ├── services/       # API servisi
│   ├── types/          # TypeScript tipovi
│   └── utils/          # Utility funkcije
├── assets/             # Slike, ikone, fontovi
├── App.tsx             # Glavna komponenta
├── app.json            # Expo konfiguracija
└── package.json        # Dependencies
```

## 🎨 Dizajn

Aplikacija koristi Material Design principe sa DERS brand bojama:
- **Primarna**: #1976d2 (plava)
- **Sekundarna**: #ffffff (bijela)
- **Accent**: #4caf50 (zelena)

## 🔐 Autentifikacija

Aplikacija podržava:
- Prijavu sa email/password
- Registraciju novih korisnika
- Automatsko osvježavanje tokena
- Sigurno čuvanje credentials

## 📊 State Management

Trenutno koristi React hooks za state management:
- `useState` za lokalni state
- `useEffect` za side effects
- Context API za globalni state (planiran)

## 🚀 Deployment

### Expo Application Services (EAS)

1. **Instaliraj EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Konfiguriraj EAS:**
   ```bash
   eas build:configure
   ```

3. **Build aplikaciju:**
   ```bash
   # Android APK
   eas build --platform android
   
   # iOS IPA
   eas build --platform ios
   ```

### App Store / Google Play

1. Kreiraj production build
2. Testiraj na TestFlight/Internal Testing
3. Submit za review

## 🐛 Debugging

### Expo Developer Tools

```bash
# Otvori developer menu
# iOS: Cmd+D
# Android: Cmd+M ili shake device
```

### Remote Debugging

1. Otvori developer menu
2. Odaberi "Debug with Chrome"
3. Koristi Chrome DevTools

### Logs

```bash
# Prati logs u terminalu
npx expo logs
```

## 🤝 Doprinos

1. Fork repository
2. Kreiraj feature branch: `git checkout -b feature/nova-funkcionalnost`
3. Commit promjene: `git commit -m 'Dodaj novu funkcionalnost'`
4. Push na branch: `git push origin feature/nova-funkcionalnost`
5. Otvori Pull Request

## 📄 Licenca

Ovaj projekt je licenciran pod MIT licencom.

## 📞 Podrška

Za pitanja i podršku:
- Email: support@ders.ba
- GitHub Issues: [Otvori issue](https://github.com/your-repo/issues)

---

**DERS Mobile** - Pristup znanju na dlanu 📱 