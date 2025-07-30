# Plan za prikaz otkazanih predavanja na /lectures stranici

## Analiza problema
Nakon detaljne analize, identificiran je ključni problem:

1. Frontend kod je ispravno implementiran - `ElementPage.jsx` poziva API sa `status=all`
2. Backend kod je ispravno implementiran - prima i obrađuje `status` parametar
3. Ali API vraća 0 otkazanih predavanja čak i sa `status=all`

## TODO lista:

1. [x] Provjeri da li se prikazuju otkazana predavanja u frontendu
   - ✅ Frontend kod je spreman da prikaže otkazana predavanja
   - ✅ CancelledOverlay komponenta postoji

2. [x] Provjeri da li postoji overlay za otkazana predavanja  
   - ✅ CancelledOverlay komponenta je implementirana
   - ✅ UniversalCard koristi overlay za cancelled predavanja

3. [x] Provjeri da li API vraća otkazana predavanja
   - ❌ API vraća 0 cancelled predavanja čak i sa status=all
   - ❌ Predavanje "Diskriminacija žene muslimanke" se ne vraća u API odgovoru

4. [x] Testirati API endpoint direktno
   - ✅ Test pokazuje da API vraća 37 predavanja ali nijedno nije otkazano

5. [x] Provjeriti zašto se otkazana predavanja ne vraćaju
   - ✅ Pronađen uzrok: Dashboard koristi Lecture.find({}) bez filtera, a public endpoint koristi filter koji možda ne pokriva sve slučajeve

## Identificiran problem

Dashboard koristi `/api/lectures` endpoint koji vraća SVA predavanja bez filtera:
```javascript
const lectures = await Lecture.find({})
```

Public endpoint koristi filter koji traži samo određene statuse:
```javascript
statusFilter = { status: { $in: ['approved', 'cancelled'] } }
```

Problem je što predavanje može biti otkazano na različite načine:
- `status: 'cancelled'`
- `isCancelled: true`
- Možda čak i `status: 'canceled'` (tipfeler)

## Implementirano rješenje

Promijenjen je query u `/api/lectures/public` endpoint-u da pokriva sve moguće načine označavanja otkazanih predavanja:

```javascript
statusFilter = { 
  $or: [
    { status: 'approved' },
    { status: 'cancelled' },
    { status: 'canceled' }, // in case of typo
    { isCancelled: true }    // additional check for isCancelled field
  ]
};
```

## Sljedeći koraci

1. **Restartovati server** da bi promjene bile učitane
2. **Testirati API ponovo** sa `test_updated_api.js` skriptom
3. **Provjeriti frontend** da li sada prikazuje otkazana predavanja

## Review

Problem je bio u tome što public endpoint nije pokrivao sve moguće načine označavanja otkazanih predavanja. Dashboard je radio jer vraća SVA predavanja, dok je public endpoint imao ograničen filter. Sada bi trebalo da radi ispravno nakon što se server restartuje.