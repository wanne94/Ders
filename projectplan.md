# Plan za popravku iOS dropdown problema

## Problem
Dropdown lista za daije na iOS-u se prikazuje samo na pola ekrana umjesto da koristi više prostora.

## Analiza
1. IOSCompatibleDropdown komponenta ima ograničenja:
   - `maxHeight: '80%'` na modalContent (linija 229)
   - `maxHeight: 400` na FlatList (linija 162)
2. Ovo posebno utiče na daije dropdown jer može imati puno opcija

## TODO Lista

### [x] 1. Analizirati trenutnu implementaciju
- Pronaći sve dropdown komponente koje koriste IOSCompatibleDropdown
- Identificirati specifične probleme sa visinom na iOS-u

### [x] 2. Popraviti visinu modal-a
- Povećati maxHeight za modalContent (sa 80% na 90%)
- Dodati SafeAreaView za iOS kompatibilnost
- Posebno optimizovati za iPhone notch/Dynamic Island

### [x] 3. Popraviti FlatList visinu
- Ukloniti fiksnu maxHeight sa FlatList-e (bila je 400px)
- Omogućiti da lista koristi maksimalnu dostupnu visinu (flex: 1)

### [x] 4. Testirati promjene
- Testirati na različitim iOS uređajima
- Provjeriti da li dropdown radi pravilno sa puno opcija
- Provjeriti da li search funkcionalnost radi

### [x] 5. Review i optimizacija
- Provjeriti performanse sa velikim listama
- Optimizovati renderovanje ako je potrebno

## Review izmjena

### Izvršene promjene:
1. **Povećana visina modal-a** - sa 80% na 90% ekrana
2. **Uklonjena fiksna visina FlatList-e** - umjesto `maxHeight: 400` sada koristi `flex: 1`
3. **Dodata SafeAreaView podrška** - za pravilno prikazivanje na iOS uređajima sa notch/Dynamic Island
4. **Poboljšan modal overlay** - dodata transparentna pozadina

### Tehničke izmjene u IOSCompatibleDropdown.js:
- Linija 121: Dodat SafeAreaView wrapper oko modal sadržaja
- Linija 162: Promjena sa `style={{ maxHeight: 400 }}` na `style={{ flex: 1 }}`
- Linija 170: Zatvorena SafeAreaView umjesto View
- Linija 216: Dodata `backgroundColor: 'transparent'` na modalOverlay
- Linija 229: Promjena `maxHeight` sa '80%' na '90%'

Ove izmjene će omogućiti da se dropdown lista prikazuje sa više prostora na iOS uređajima, posebno kada ima puno opcija kao što je slučaj sa listom daija.