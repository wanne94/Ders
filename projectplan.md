# Plan za dodavanje prikaza dana uz datum

## Cilj
Kada se odabere datum u formi, treba da se prikaže i dan u sedmici pored datuma (npr. "24.09.2025 Srijeda")

## TODO Lista

### 1. ✅ Analiziraj trenutni prikaz datuma
- Provjerio kako se trenutno formatira datum u mobilnoj aplikaciji ✓
- Provjerio kako se trenutno formatira datum u web aplikaciji ✓

### 2. ✅ Dodaj prikaz dana u mobilnoj aplikaciji
- Dodao helper funkciju `formatDateWithDay()` ✓
- Koristi bosanske nazive dana (Nedjelja, Ponedjeljak, Utorak, Srijeda, Četvrtak, Petak, Subota) ✓
- Ažurirane sve funkcije koje koriste format() ✓
- Prilagođene funkcije za parsiranje datuma da uklone naziv dana ✓

### 3. ✅ Dodaj prikaz dana u web aplikaciji
- Modificiran DatePickerFixed komponenta ✓
- Koristi date-fns sa bosanskim locale ✓
- Format: dd.MM.yyyy EEEE ✓

### 4. ✅ Testiraj promjene
- Provjerio da se dan ispravno prikazuje ✓
- Provjerio da su nazivi dana na bosanskom ✓
- Kreiran test fajl sa detaljnim izvještajem ✓

## Review

### Izvršene promjene:

#### Mobilna aplikacija (React Native)
**Lokacija:** `mob/components/forms/LectureForm.jsx`

**Izmjene:**
1. Dodana helper funkcija `formatDateWithDay()` koja formatira datum sa nazivom dana
2. Bosanski nazivi dana: Nedjelja, Ponedjeljak, Utorak, Srijeda, Četvrtak, Petak, Subota
3. Ažurirane sve funkcije koje koriste format datuma:
   - `handleDateChange()`
   - `handleSubmit()` - parsira datum bez dana prije slanja
   - `populateFormWithEditData()`
   - `validateDate()` - prihvata novi format
   - `calculateSeminarDays()` - parsira datum bez dana

#### Web aplikacija (Next.js)
**Lokacija:** `web/src/components/ui/date-picker-fixed.jsx`

**Izmjene:**
1. Import bosanskog locale: `import { bs } from "date-fns/locale"`
2. Modificiran prikaz datuma u Button komponenti
3. Format: `{format(internalDate, "dd.MM.yyyy")} {format(internalDate, "EEEE", { locale: bs })}`

### Primjeri prikaza:
- Mobilna: "24.09.2025 Srijeda" (veliko početno slovo)
- Web: "24.09.2025 srijeda" (malo slovo prema date-fns locale)

### Napomene:
- Server i dalje prima datum u formatu YYYY-MM-DD
- Validacija datuma je prilagođena da prihvata novi format sa danom
- Promjene se automatski primjenjuju na sve forme koje koriste ove komponente