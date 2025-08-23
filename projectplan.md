# Plan implementacije - Dodavanje 15-minutnih intervala za vrijeme predavanja

## Problem
U formi za dodavanje predavanja (LectureFormNew.jsx), trenutno je dostupno samo odabiranje vremena po satima (10:00, 11:00, 12:00, itd.). Potrebno je dodati mogućnost odabira vremena sa intervalima od 15 minuta.

## Lokacija koda
- Fajl: `/web/src/components/LectureFormNew.jsx`
- Linija: 520-540 (Select komponenta za vrijeme)

## Trenutno stanje
```jsx
<Select>
  <SelectContent>
    {['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', 
      '17:00', '18:00', '19:00', '20:00', '21:00'].map(time => (
      <SelectItem key={time} value={time}>
        {time}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

## Plan implementacije

### TODO Lista:

- [x] 1. Kreirati hardkodovanu listu vremena sa 15-minutnim intervalima
  - Vremena od 06:00 do 23:45
  - Format: HH:MM (npr. 06:00, 06:15, 06:30, 06:45, 07:00...)

- [x] 2. Zamijeniti postojeću listu vremena u web aplikaciji
  - Uklonjena postojeća lista sa samo satima
  - Dodana nova hardkodovana lista sa 15-minutnim intervalima

- [x] 3. Ažurirati mobilnu aplikaciju sa istom listom vremena
  - Zamijenjena generateTimeOptions funkcija sa hardkodovanom listom
  - Osigurana konzistentnost između web i mobilne aplikacije

## Implementacijski detalji

### Funkcija za generisanje vremena:
```javascript
const generateTimeOptions = () => {
  const times = [];
  for (let hour = 6; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      times.push(time);
    }
  }
  return times;
};
```

### Prednosti ovog pristupa:
- Jednostavna implementacija
- Minimalne izmjene postojećeg koda
- Fleksibilnost za buduće promjene (npr. drugačiji intervali)
- Nema uticaja na postojeću funkcionalnost

## Review sekcija

### Sažetak implementiranih promjena:
1. **Web aplikacija** (`/web/src/components/LectureFormNew.jsx`):
   - Zamijenjena lista vremena koja je imala samo pune sate (10:00, 11:00, itd.)
   - Dodana hardkodovana lista sa 72 vremenske opcije (od 06:00 do 23:45 sa 15-minutnim intervalima)

2. **Mobilna aplikacija** (`/mob/components/forms/LectureForm.jsx`):
   - Uklonjena generateTimeOptions funkcija
   - Dodana identična hardkodovana lista kao u web aplikaciji
   - Osigurana potpuna konzistentnost između platformi

### Promjene na visokom nivou:
- Korisnici sada mogu birati vrijeme sa preciznošću od 15 minuta
- Dostupna vremena: 06:00, 06:15, 06:30, 06:45, 07:00... sve do 23:45
- Ukupno 72 vremenske opcije (18 sati × 4 opcije po satu)
- Isti korisnički doživljaj na web i mobilnoj aplikaciji