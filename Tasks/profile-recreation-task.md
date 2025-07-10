# Profile System Recreation Task

## Current Profile Analysis

Trenutno profil sistem ima sledeće funkcionalnosti:

### Web Profile (`/web/pages/profile/[type]/[id].js`)
**UnifiedProfile komponenta - sve u jednoj:**
1. **Tipovi profila**: lecture, daija, organization
2. **State management**: useState za profileData, loading, error, imageModal
3. **Data fetching**: useCallback za fetchProfileData
4. **UI features**:
   - Hero sekcija sa gradient pozadinom
   - Responsive image display (kružna za daije, kvadratna za ostale)
   - Meta informacije (datum, vreme, lokacija, speaker, organizacija)
   - Opis/biografija sekcija
   - Social media linkovi (za udruženja)
   - Action dugmad (lokacija, share)
   - Modal za sliku u punoj veličini
   - Related lectures sekcija
5. **Navigation**: Back buttons sa type-specific routing
6. **Error handling**: Loading states, error messages, fallback images

### Mob Profile (`/mob/components/UniversalProfile.js`)
**Mobilna verzija sa sličnim funkcionalnostima**

### Dodatni fajlovi:
- `/web/pages/profile.js` - osnovni profil
- `/web/pages/profile/[type]/[id]-new.js` - nova verzija (backup?)

## Problem
Profil trenutno "ne radi" - treba obrisati sve i napraviti ispočetka zadržavajući funkcionalnosti.

## Plan za rekreaciju

### Todo Lista
1. ✅ Analiza trenutnog profil sistema
2. 🔄 Kreiranje task fajla u Tasks folderu
3. ⏳ Brisanje postojećih profil fajlova
4. ⏳ Kreiranje novog profil sistema ispočetka

## Funkcionalnosti koje treba zadržati
- Unified profil za sve tipove (lecture, daija, organization)
- Responsive dizajn
- Image handling sa fallback-ovima
- Social media linkovi
- Related lectures
- Share funkcionalnost
- Location/directions funkcionalnost
- Modal za slike
- Error handling
- Loading states

## Review Sekcija

### ✅ Implementirano

**Web Profile (`/web/pages/profile/[type]/[id].js`)**
- Recreated ProfilePage komponenta sa svim funkcionalnostima
- Simplified state management (profile, loading, error, imageModalOpen)
- Clean helper funkcije (getBackPath, getBackText, getTitle, getDefaultImage, openLocation)
- Zadržan isti UI/UX dizajn sa hero sekcijom i gradient pozadinom
- Responsive image display sa click-to-expand modal
- Meta informacije prikazane kao chips (datum, vreme, speaker, org, lokacija)
- Description/biography sekcija
- Social media linkovi za udruženja
- Action buttons (lokacija, share)
- Related lectures sekcija
- Error handling i loading states

**Mobile Profile (`/mob/components/UniversalProfile.js`)**
- Recreated UniversalProfile komponenta za React Native
- Iste funkcionalnosti kao web verzija
- Native styling sa StyleSheet
- Touch interactions i Linking za external URLs
- Modal za slike u punoj veličini
- Responsive design za mobilne uređaje

### 📋 Glavne promene
- Potpuno novi kod, čistiji i jednostavniji
- Bolje organizovane helper funkcije
- Konzistentno error handling
- Optimizovana struktura komponenti
- Zadržane sve postojeće funkcionalnosti

### 🎯 Rezultat
Profile sistem je kompletno rekreiran ispočetka sa istim funkcionalnostima ali čistijim, održivijim kodom.