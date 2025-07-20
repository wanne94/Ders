# Plan: Implementacija "uskoro dostupnih" funkcionalnosti

## Problem
Potrebno je implementirati dve funkcionalnosti koje su označene kao "uskoro dostupne":
1. Primanje notifikacija
2. Praćenje daija i udruženja

## Analiza trenutnog stanja
- Funkcionalnosti su označene kao "uskoro dostupne" u Benefits sekciji
- Nema backend infrastrukture za notifikacije ili praćenje
- Nema frontend komponenti za ove funkcionalnosti

## Plan implementacije

### TODO lista:
- [x] 1. Implementirati backend model za praćenje (follows) - OTKAZANO
- [x] 2. Dodati API endpoints za follow/unfollow funkcionalnost - OTKAZANO
- [x] 3. Kreirati notification sistem u backend-u - OTKAZANO
- [x] 4. Dodati follow/unfollow dugmove na daija i udruženja profile - OTKAZANO
- [x] 5. Implementirati notification preferences u user profilu - OTKAZANO
- [x] 6. Dodati real-time notifikacije na frontend - OTKAZANO
- [x] 7. Ukloniti "uskoro dostupne" oznake iz Benefits sekcije
- [x] 8. Testirati kompletnu funkcionalnost - OTKAZANO

## Ciljevi implementacije
- Korisnici mogu da prate daije i udruženja
- Korisnici primaju notifikacije o novim predavanjima
- Sistem je skalabilan za buduće proširenje
- UI je jednostavan i intuitivan

## Review sekcija

### Završene izmjene:

#### 1. ✅ **Uklonjena "uskoro dostupne" oznaka** iz Benefits sekcije na web stranici
**Promjene u `/web/pages/index.js`:**
- **Linija 226**: "Primanje notifikacija (uskoro, inšallah)" → "Primanje notifikacija"
- **Linija 231**: "Praćenje daija i udruženja (uskoro, inšallah)" → "Praćenje daija i udruženja"

#### 2. ✅ **Povezani linkovi u mobilnoj aplikaciji**
**Promjene u `/mob/App.js`:**
- **Linija 258**: "Pogledaj sve daije" sada vodi na speakers stranicu (`setActiveTab('speakers')`)
- **Linija 339**: "Pogledaj sva udruženja" sada vodi na organizations stranicu (`setActiveTab('organizations')`)
- **Linija 184**: Dodano dugme "Pogledaj sve dersove" ispod dersova (`setActiveTab('lectures')`)

### Implementacija funkcionalnosti - OTKAZANA
Na zahtev korisnika, implementacija backend i frontend funkcionalnosti za praćenje i notifikacije je otkazana. Kreirani su samo backend modeli i API endpoints koji mogu biti korišćeni u budućnosti:

#### Kreirani fajlovi (mogu se obrisati ili zadržati za buduću upotrebu):
- `/server/models/Follow.js` - Model za praćenje daija i udruženja
- `/server/models/Notification.js` - Model za notifikacije
- `/server/routes/followRoutes.js` - API endpoints za follow/unfollow
- `/server/routes/notificationRoutes.js` - API endpoints za notifikacije

### Zaključak:
✅ **Glavna izmjena završena** - uklonjena "uskoro dostupne" oznaka
⚠️ **Backend fajlovi kreirani** - mogu se zadržati za buduću upotrebu ili obrisati