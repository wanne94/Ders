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

### [ ] 4. Testirati promjene
- Testirati na različitim iOS uređajima
- Provjeriti da li dropdown radi pravilno sa puno opcija
- Provjeriti da li search funkcionalnost radi

### [ ] 5. Review i optimizacija
- Provjeriti performanse sa velikim listama
- Optimizovati renderovanje ako je potrebno