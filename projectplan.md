# Plan za izmjenu broja prikazanih udruženja i daija

## Problem
Trenutno se na početnoj stranici prikazuje 8 udruženja i 8 daija. Potrebno je promijeniti da se prikazuje 10 umjesto 8.

## Todo stavke

- [ ] **Promijeni broj prikazanih udruženja sa 8 na 10**
  - Linija 456: `const sortedOrganizations = approvedOrgs.slice(0, 8);` → promijeniti na `slice(0, 10)`
  - Linija 476: `Upoznaj 8 nasumično odabranih udruženja.` → promijeniti na `Upoznaj 10 nasumično odabranih udruženja.`

- [ ] **Promijeni broj prikazanih daija sa 8 na 10**
  - Linija 634: `const randomDaije = shuffled.slice(0, 8);` → promijeniti na `slice(0, 10)`
  - Linija 653: `Upoznaj 8 nasumično odabranih daija.` → promijeniti na `Upoznaj 10 nasumično odabranih daija.`

- [ ] **Testiranje promjena**
  - Provjeriti da se na početnoj stranici prikazuje 10 udruženja i 10 daija

## Review sekcija
_Ovdje će biti dodane informacije o završenim promjenama_