# Plan: Dodavanje vremena pored status tagova "Prošlo" i "Uskoro"

## Cilj
Dodati informaciju o vremenu pored tagova "Prošlo" i "Uskoro" koja će pokazivati:
- Za "Prošlo": prije koliko sati/dana je bio ders
- Za "Uskoro": za koliko sati/dana će biti ders

## Todo Lista

### Mobile App Implementation

- [ ] Kreirati helper funkciju `getTimeRelativeToLecture()` u `/mob/utils/timeUtils.js`
- [ ] Ažurirati `UniverzalCard.js` komponente da prikazuju relativno vrijeme
- [ ] Testirati prikaz za različite vremenske periode (sati, dani)

### Web App Implementation  

- [ ] Kreirati helper funkciju `getTimeRelativeToLecture()` u `/web/src/helpers/timeHelpers.ts`
- [ ] Ažurirati `UniversalCard.jsx` komponentu da prikazuje relativno vrijeme
- [ ] Testirati prikaz za različite vremenske periode (sati, dani)

### Detalji implementacije

#### Helper funkcija `getTimeRelativeToLecture()`
Funkcija treba da:
- Prima datum i vrijeme dersa
- Vraća string sa relativnim vremenom (npr. "za 2 sata", "prije 3 dana")
- Koristi postojeću logiku za određivanje statusa
- Format:
  - < 24 sata: "za X sati" ili "prije X sati"
  - >= 24 sata: "za X dana" ili "prije X dana"

#### UI Promjene
- Dodati relativno vrijeme pored postojećih emoji indikatora
- Format prikaza: 🔴 Prošlo • prije 2 dana
- Održati postojeći dizajn i boje

## Review
(Popuniti nakon implementacije)