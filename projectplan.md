# Plan: Dodavanje broja predavanja u kartice daija/predavaca

## Problem
Potrebno je da se u karticama gdje se prikazuju daije/predavaci prikaže broj održanih predavanja na platformi.

## Analiza
1. Pronaći komponente koji prikazuju kartice daija/predavaca
2. Pronaći API endpoint koji vraća daije sa brojem predavanja
3. Modificirati backend da računa broj predavanja po daii
4. Dodati prikaz broja predavanja u kartice

## Todo stavke

### 1. Analiza frontend komponenti
- [ ] Pronaći UniversalCard komponentu
- [ ] Pronaći stranice koje prikazuju daije (daije.js)
- [ ] Proveriti kako se prikazuju kartice predavaca

### 2. Analiza backend API-ja
- [ ] Proveriti daije route u server/routes
- [ ] Proveriti Daija model u server/models
- [ ] Dodati računanje broja predavanja po daii

### 3. Implementacija
- [ ] Modificirati backend da vraća broj predavanja
- [ ] Dodati prikaz broja u kartice
- [ ] Testirati funkcionalnost

### 4. Review
- [ ] Dokumentovati promene

## Očekivani rezultat
Kartice daija/predavaca će prikazivati "Broj predavanja: X" gde je X broj održanih predavanja.

## Review

### Implementirane promene

**Backend promene (server/index.js):**
```javascript
// Modificiran /api/daije endpoint 
const daijeWithLectureCount = await Promise.all(
  daije.map(async (daija) => {
    const lectureCount = await Lecture.countDocuments({ 
      daija: daija._id, 
      status: 'approved' 
    });
    
    return {
      ...daija.toObject(),
      lectureCount: lectureCount
    };
  })
);
```

**Frontend promene (UniversalCard.jsx):**
1. **Dodana ikona:** `import ClassIcon from '@mui/icons-material/Class'`
2. **Dodano u daija kartice:**
```javascript
data.lectureCount !== undefined && { 
  icon: <ClassIcon />, 
  text: `Broj predavanja: ${data.lectureCount || 0}` 
}
```

### Funkcionalnost
- Backend sada računa broj odobrenih predavanja za svaku daiju
- Frontend prikazuje broj predavanja u kartici sa ClassIcon ikonom
- Tekst: "Broj predavanja: X" gde je X broj predavanja
- Pokazuje se samo ako `lectureCount` postoji u podacima

### Testiranje potrebno
- Pokretanje lokalnog servera da se proveri da li se prikazuje broj predavanja
- Verifikacija da backend vraća `lectureCount` polje
- Testiranje da se ikona i tekst ispravno prikazuju u karticama daija

### Zaključak
Implementacija je završena - potrebno je lokalno testiranje prije deploy-a.