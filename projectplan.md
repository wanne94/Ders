# KRITIČAN PROBLEM - DatePicker i dalje pokazuje prethodni dan na produkciji

## Problem
Uprkos svim dosadašnjim pokušajima, na produkciji (ders.ba) kada se odabere datum (npr. 22.08.2025), prikazuje se prethodni dan (21.08.2025).

## Analiza
Problem je vjerovatno u MUI DatePicker komponenti koja interno koristi Date objekte. Kada DatePicker vrati vrijednost, ona je u UTC midnight što uzrokuje pomjeranje.

## NOVO RJEŠENJE - Ultimativni pristup

### TODO Lista

- [ ] 1. Implementirati custom date adapter za MUI DatePicker
  - Forsirati da DatePicker UVIJEK radi sa lokalnim datumima
  - Override-ovati sve date metode

- [ ] 2. Alternativno rješenje - Dodati 1 dan na frontend
  - Kada DatePicker vrati datum, provjeriti da li je pomjeren
  - Ako jeste, dodati 1 dan da kompenzujemo

- [ ] 3. Kreirati custom DatePicker wrapper
  - Wrapper koji automatski koriguje datum
  - Osigurati da uvijek vraća točan datum

- [ ] 4. Server-side korekcija
  - Na serveru provjeriti timezone offset
  - Automatski korigovati datum ako je potrebno

- [ ] 5. Testirati i deployovati
  - Testirati sa različitim datumima
  - Deploy na produkciju

## Hitno rješenje koje ćemo implementirati ODMAH

```javascript
// Kada DatePicker vrati datum, FORSIRAJ korekciju
const handleDateChange = (date) => {
  if (!date) return '';
  
  // KRITIČNO: Uzmi lokalne komponente direktno
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  // Kreiraj novi datum sa EKSPLICITNIM satima (12:00)
  // Ali ako je datum pomjeren, dodaj 1 dan
  const testDate = new Date(year, month, day, 12, 0, 0);
  
  // Provjeri da li je datum pomjeren
  if (testDate.getDate() !== day) {
    // Datum je pomjeren, korigiraj ga
    testDate.setDate(testDate.getDate() + 1);
  }
  
  // Format u YYYY-MM-DD
  const formatted = formatDateToLocalString(testDate);
  return formatted;
};
```

## Review sekcija
(Biće popunjena nakon implementacije)