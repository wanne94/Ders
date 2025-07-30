# Plan implementacije sedmičnih predavanja i funkcionalnosti otkazivanja za mobilnu aplikaciju

## Analiza postojećeg stanja

### Web aplikacija
1. **Sedmična predavanja**:
   - Model `Lecture` ima polja: `isWeeklyLecture`, `weeklySeriesId`, `weekNumber`, `totalWeeks`, `parentLectureId`
   - Pri kreiranju sedmičnog predavanja automatski se kreiraju sva predavanja u seriji (2-12 sedmica)
   - Badge "Sedmično" se prikazuje na kartici predavanja

2. **Otkazivanje predavanja**:
   - Korisnici mogu prijaviti otkazivanje (i gosti i prijavljeni)
   - Nakon 3 prijave predavanje se automatski označava kao otkazano
   - Model ima polja: `cancellationReports`, `isCancelled`, `cancelledAt`, `cancellationReason`
   - Otkazana predavanja se prikazuju sa dijagonalnim "OTKAZANO" preko slike
   - API endpoint: `POST /lectures/:id/report-cancellation`

3. **Prikaz predavanja**:
   - Koristi se `/lectures/public` endpoint koji vraća sva odobrena i otkazana predavanja
   - Status se dinamički izračunava (aktivan, predstoji, završen)
   - Sortiranje: aktivna -> predstojeća -> prošla

### Mobilna aplikacija
1. Trenutno koristi `/lectures/dashboard/public` koji vraća samo odobrena predavanja
2. UniverzalCard komponenta već ima osnovnu podršku za:
   - Prikaz sedmičnih predavanja (badge)
   - Prikaz otkazanih predavanja (dijagonalni overlay)
   - Kalkulaciju statusa predavanja
3. Nedostaje:
   - Pravilno dohvaćanje otkazanih predavanja sa servera
   - UI za prijavljivanje otkazivanja
   - Prikaz broja prijava i statusa otkazivanja

## TODO Lista

- [ ] 1. Promijeniti API endpoint u mobilnoj aplikaciji
  - Zamijeniti `/lectures/dashboard/public` sa `/lectures/public?status=all` u `UniversalPage.js`
  - Ukloniti lokalno filtriranje otkazanih predavanja

- [ ] 2. Ažurirati prikaz otkazanih predavanja
  - Provjeriti da li se otkazana predavanja pravilno prikazuju
  - Testirati dijagonalni "OTKAZANO" overlay

- [ ] 3. Kreirati CancellationReportButton komponentu
  - Kreirati React Native verziju komponente za prijavljivanje otkazivanja
  - Dodati modal/bottom sheet za formu prijave

- [ ] 4. Kreirati CancellationReportForm komponentu
  - Forma sa poljima: razlog, kako ste saznali, dodatne informacije
  - Validacija i slanje na server

- [ ] 5. Integrirati dugme za prijavljivanje u LectureDetailScreen
  - Dodati dugme samo za predavanja koja nisu otkazana
  - Prikazati broj trenutnih prijava (ako je < 3)

- [ ] 6. Dodati API poziv za prijavljivanje otkazivanja
  - Implementirati POST request na `/lectures/:id/report-cancellation`
  - Handle response i error states

- [ ] 7. Testirati sedmična predavanja
  - Provjeriti da li se badge "Sedmično" pravilno prikazuje
  - Testirati prikaz broja sedmice ako je dostupan

- [ ] 8. Optimizacija performansi
  - Provjeriti da li se status predavanja pravilno kešira
  - Optimizovati re-renderovanje komponenti

- [ ] 9. Finalno testiranje
  - Testirati sve funkcionalnosti na Android i iOS
  - Provjeriti kompatibilnost sa različitim veličinama ekrana

## Tehnički detalji implementacije

### 1. API promjena
```javascript
// U UniversalPage.js
const fetchLectures = async () => {
  const response = await apiClient.get('/lectures/public?status=all');
  return response.data;
};
```

### 2. CancellationReportButton komponenta
- Koristiti React Native Button ili TouchableOpacity
- Ikona: Ionicons "warning" ili "alert-circle"
- Boja: narandžasta (#ff9800)

### 3. CancellationReportForm
- Modal ili BottomSheet sa formom
- TextInput komponente za unos podataka
- Dropdown za "Kako ste saznali"

### 4. Integracija u LectureDetailScreen
- Prikazati dugme ispod osnovnih informacija
- Uslovni prikaz na osnovu `isCancelled` statusa

## Napomene
- Sve promjene treba da budu što jednostavnije
- Koristiti postojeće komponente i stilove gdje god je moguće
- Testirati na oba OS-a (Android i iOS)