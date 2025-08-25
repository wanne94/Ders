# Plan izmjene forme za dodavanje predavanja

## Zadatak
Forma za dodavanje predavanja treba da se izmjeni tako da predavači (daije) nemaju zasebnu oblast, nego da budu integrisani kao obične stavke u formi.

## TODO Lista

- [x] Ukloniti okvir (border) i posebno stilizovanje sa sekcije Daije/Predavači
- [x] Pojednostaviti UI za dodavanje predavača - zadržati na istoj poziciji
- [x] Prilagoditi padding i spacing da bude konzistentan sa ostalim poljima
- [x] Testirati funkcionalnost forme nakon izmjena

## Tehnički detalji

### Trenutno stanje:
- Daije/Predavači su u posebnoj sekciji sa okvirom (border p-4 rounded-lg) na liniji 480
- Imaju složen UI sa listom dodanih predavača
- Pozicija: između kratkog opisa i organizatora

### Planirane izmjene:
1. Ukloniti border, p-4 i rounded-lg klase sa wrapper div-a
2. Zadržati poziciju u formi (između kratkog opisa i organizatora)
3. Zadržati svu funkcionalnost dodavanja više predavača
4. Prilagoditi spacing da bude kao kod ostalih polja (space-y-2)

## Review

### Izvršene izmjene:
1. **Uklonjen okvir sa sekcije Daije/Predavači** - Zamijenjena klasa `border p-4 rounded-lg` sa `space-y-2` (linija 480)
2. **Pojednostavljen UI** - Uklonjen nepotreban wrapper div oko interface-a za dodavanje predavača
3. **Prilagođen spacing** - Sve je sada konzistentno sa ostalim poljima forme
4. **Zadržana sva funkcionalnost** - Dodavanje više predavača, custom imena, sve radi kao prije

### Rezultat:
- Forma sada ima jedinstveni, konzistentan izgled
- Daije/Predavači su integrisani kao obična stavka u formi
- Nema više zasebne oblasti sa okvirom
- Funkcionalnost je u potpunosti očuvana