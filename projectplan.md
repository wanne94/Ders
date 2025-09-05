# Popravke problema sa prikazivanjem podataka - RIJEŠENO ✓

## 1. Problem sa prikazivanjem Udruženja u mobilnoj aplikaciji

### Analiza problema
Udruženje se nije prikazivalo u kartici predavanja niti u profilu predavanja na mobilnoj aplikaciji.

### Uzrok
Server je vraćao podatke o organizaciji na različite načine:
- Za liste predavanja: vraćao je `organization` kao string (ime organizacije)
- Za pojedinačno predavanje: vraćao je samo `organizationId` kao populiran objekat

### Rješenje
Dodao sam transformaciju u server endpoint koji vraća pojedinačno predavanje (`GET /api/lectures/:id`) da uključuje polje `organization` sa imenom organizacije.

## 2. Problem sa prikazivanjem predavača na web aplikaciji

### Analiza problema
Predavač se pojavljivao na sekundu i nestajao u profilu predavanja na web aplikaciji.

### Uzrok
1. Server nije vraćao polja `speaker`, `daijaName` i `daijaTitle`
2. useEffect za učitavanje "upcoming lectures" je prepisivao podatke profila

### Rješenje
1. Proširio sam transformaciju u serveru da uključuje:
   - `speaker` - formatiran prikaz predavača
   - `daijaName` - ime daije
   - `daijaTitle` - titula daije
2. Spriječio nepotrebno učitavanje dodatnih podataka za profil predavanja
3. Promijenjeno u `/predavanje/[slug].js` da redirektuje na pravi profil URL

### Promjene u fajlovima:
- `server/routes/lecturesRoutes.js` - linija 1520-1531
- `web/pages/profile/[type]/[[...params]].js` - linija 196-201
- `web/pages/predavanje/[slug].js` - kompletna reimplementacija

## Status: ZAVRŠENO ✓

Sada se pravilno prikazuju:
- Ime udruženja na mobilnoj aplikaciji
- Predavač na web aplikaciji (bez nestajanja)