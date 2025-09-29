# Plan: Smanjivanje razmaka između kartica na webu

## TODO Liste:

### 1. Analiza trenutnog stanja
- [x] Identifikovati sve lokacije gdje se koriste kartice
- [x] Analizirati trenutne gap/spacing vrijednosti

### 2. Izmjene gap vrijednosti u grid layoutima
- [x] Smanjiti gap u GridLayout komponenti (trenutno gap={2} ili gap={3})
- [x] Smanjiti gap u Tailwind grid klasama (gap-6 na gap-3 ili gap-2)
- [x] Smanjiti gap u LecturesSection komponenti

### 3. Izmjene na specific stranicama
- [x] Izmjena gap-a na index.js stranici
- [x] Izmjena gap-a na profile stranici
- [x] Izmjena gap-a u svim grid layoutima

### 4. Testiranje i provjera
- [x] Provjeriti vizuelni izgled na različitim rezolucijama
- [x] Provjeriti da li su sve kartice vizuelno dobro poravnate

## Napomene:
- Trenutni gap na većini mjesta je 3-6 (što u Tailwindu znači 0.75rem-1.5rem)
- Preporučujem smanjenje na gap-2 ili gap-3 (0.5rem-0.75rem) za bolji, kompaktniji izgled

## Review - Završene promjene:
Uspješno sam smanjio razmake između kartica na web stranici:

1. **GridLayout komponenta** - Smanjio default gap sa 2 na 1.5, i responsive gap sa xs:2, sm:2.5 na xs:1.5, sm:2
2. **LecturesSection komponenta** - Smanjio gap sa 3 na 2
3. **index.js stranica** - Smanjio sve gap vrijednosti (gap-6 → gap-3, gap-8 → gap-4)
4. **profile stranica** - Smanjio sve grid gap vrijednosti sa gap-4/gap-6 na gap-3

Sada su kartice bliže jedna drugoj što omogućava bolji pregled i više vidljivog sadržaja na ekranu.