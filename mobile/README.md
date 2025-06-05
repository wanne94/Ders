# DERS Mobile App

Mobilna aplikacija za DERS platformu - digitalna platforma za promociju islamskih predavanja.

## Funkcionalnosti

### 🏠 Početna stranica
- Hero sekcija sa DERS brendom
- Brza statistika (broj predavanja, daija, udruženja)
- Najnovija predavanja
- Aktivna udruženja
- Istaknute daije
- Brze akcije za navigaciju

### 📚 Dersovi
- Lista svih predavanja
- Pretraga po nazivu, predavaču ili lokaciji
- Filtriranje po kategorijama (Akida, Ahlak, Ibadet, Porodica, Ekonomija)
- Detaljan prikaz predavanja sa mogućnostima:
  - Dodavanje u kalendar
  - Dijeljenje
  - Otvaranje lokacije u mapama

### 👨‍🏫 Daije
- Lista islamskih predavača/učenjaka
- Pretraga po imenu, specijalizaciji ili gradu
- Profili daija sa:
  - Biografijom
  - Kontakt informacijama
  - Specijalizacijom
  - Mogućnostima pozivanja i slanja emaila

### 🏢 Udruženja
- Lista islamskih udruženja
- Filtriranje po tipovima (Rijaset, Medžlis, Obrazovanje, Dijaspora)
- Pretraga po nazivu, gradu ili opisu
- Profili udruženja sa:
  - Osnovnim informacijama
  - Aktivnostima
  - Kontakt podacima
  - Mogućnostima pozivanja, emaila i posjete website-a

## Tehnologije

- **React Native** - Framework za mobilne aplikacije
- **Expo** - Platforma za razvoj React Native aplikacija
- **React Navigation** - Navigacija između ekrana
- **React Native Paper** - Material Design komponente
- **Expo Vector Icons** - Ikone
- **Expo Linear Gradient** - Gradijenti

## Pokretanje aplikacije

1. Instaliraj dependencies:
```bash
npm install
```

2. Pokreni Expo development server:
```bash
npm start
```

3. Skeniraj QR kod sa Expo Go aplikacijom na telefonu ili pokreni u simulatoru.

## Struktura projekta

```
mobile/
├── App.js                          # Glavna aplikacija sa navigacijom
├── src/
│   └── screens/
│       ├── HomeScreen.js           # Početna stranica
│       ├── LecturesScreen.js       # Lista predavanja
│       ├── LectureDetailScreen.js  # Detalji predavanja
│       ├── DaijeScreen.js          # Lista daija
│       ├── DaijaProfileScreen.js   # Profil daije
│       ├── OrganizationsScreen.js  # Lista udruženja
│       └── OrganizationProfileScreen.js # Profil udruženja
├── package.json
└── README.md
```

## Buduće funkcionalnosti

- Integracija sa backend API-jem
- Push notifikacije za nova predavanja
- Offline pristup sadržaju
- Korisničke liste omiljenih predavanja
- Kalendar događaja
- Mapa sa lokacijama predavanja

## Dizajn

Aplikacija koristi Material Design principe sa:
- Primarnom bojom: #1976d2 (plava)
- Gradijentima za hero sekcije
- Card layout za sadržaj
- Intuitivnom navigacijom sa tab bar-om
- Responsive dizajnom za različite veličine ekrana 