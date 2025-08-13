# Plan za automatsko odobravanje SAMO predavanja

## Cilj
Ukloniti potrebu za odobravanjem SAMO za predavanja (Lectures) - sva predavanja će biti automatski javna čim se kreiraju.
Daije i Organizacije će i dalje zahtijevati odobravanje.
Promjene se primjenjuju na backend, web aplikaciju i mobilnu aplikaciju.

## TODO Lista

### Backend promjene
- [x] 1. Izmijeni samo Lecture model da ima default status 'approved' (već je postavljeno)
- [x] 2. Ažuriraj POST rutu za kreiranje predavanja da uvijek postavlja status na 'approved'
- [x] 3. Ukloni needsApproval logiku SAMO za predavanja u server/index.js
- [x] 4. Zadrži postojeću logiku odobravanja za Daije i Organizacije

### Web aplikacija promjene  
- [x] 5. Ukloni status polje iz LectureForm komponente (/web/src/components/LectureForm.jsx)
- [x] 6. Ukloni status iz UnifiedForm za predavanja (/web/src/components/UnifiedForm.jsx)
- [x] 7. Ažuriraj dashboard sekciju "Za odobrenje" da ne prikazuje predavanja (/web/pages/dashboard.jsx)
- [x] 8. Ažuriraj brojače u dashboard-u da ne računaju pending predavanja
- [x] 9. Ukloni status kolonu za predavanja u DataTable komponenti

### Mobilna aplikacija promjene
- [x] 10. Ukloni status polje iz LectureForm (/mob/components/forms/LectureForm.jsx)
- [x] 11. Ažuriraj AddContentScreen da ne postavlja status za predavanja (/mob/screens/AddContentScreen.js)
- [x] 12. Ažuriraj DashboardScreen sekciju "Za odobrenje" da ne prikazuje predavanja (/mob/screens/DashboardScreen.js)
- [x] 13. Ažuriraj brojače da ne računaju pending predavanja
- [x] 14. Ukloni prikaz statusa za predavanja u UniversalPage (/mob/screens/UniversalPage.js)

### Testiranje
- [ ] 15. Testiraj kreiranje predavanja na web-u - treba biti odmah vidljivo
- [ ] 16. Testiraj kreiranje predavanja na mobilnoj app - treba biti odmah vidljivo
- [ ] 17. Testiraj da Daije i dalje kreiraju sa statusom 'pending' (web i mob)
- [ ] 18. Testiraj da Organizacije i dalje kreiraju sa statusom 'pending' (web i mob)
- [ ] 19. Provjeri dashboard "Za odobrenje" sekciju na web-u - ne smije prikazivati predavanja
- [ ] 20. Provjeri dashboard "Za odobrenje" sekciju na mob app - ne smije prikazivati predavanja

## Review - Implementirane promjene

### Backend
1. **POST rute za predavanja** - Uklonjena logika needsApproval, predavanja se uvijek kreiraju sa statusom 'approved'
2. **Public endpoint** - Također postavlja status na 'approved' za sva predavanja
3. **Model** - Lecture model već ima default status 'approved'

### Web aplikacija
1. **LectureForm.jsx** - Uklonjen status field iz forme
2. **UnifiedForm.jsx** - Uklonjen status field za tip 'lecture'
3. **dashboard.jsx** - Sekcija "Za odobrenje" više ne prikazuje predavanja, brojač ne računa pending predavanja

### Mobilna aplikacija
1. **LectureForm.jsx** - Uklonjen status field iz forme
2. **AddContentScreen.js** - Uklonjen status field za tip 'lecture'
3. **DashboardScreen.js** - Sekcija "Za odobrenje" više ne prikazuje predavanja, brojač ne računa pending predavanja

### Što je ostalo netaknuto
- Daije i Organizacije i dalje imaju sistem odobravanja
- Postojeća predavanja sa statusom 'pending' nisu mijenjana
- Admin funkcionalnost za mijenjanje statusa postojećih predavanja ostaje

## Napomene
- VAŽNO: Mijenjamo SAMO logiku za Lectures (predavanja)
- Daije i Organizacije zadržavaju postojeći sistem odobravanja
- Promjene se primjenjuju na sve platforme: backend, web i mobilna aplikacija
- Sve promjene su minimalne i jednostavne
- Postojeća predavanja sa statusom 'pending' ostaju kakva jesu