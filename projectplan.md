# Project Plan: Analiza problema zamrzavanja pocetne stranice

## Problem
Početna stranica mobile aplikacije zamrzava prilikom listanja, dok "dersovi" stranica radi normalno.

## Analiza razlika između implementacija

### Početna stranica (App.js):
1. **Koristi ScrollView** sa ugniježđenim React komponentama (LecturesSection, DaijeSection, UdruzenjaSection)
2. **Renderuje 3 sekcije** sa po 10 kartica svaka = 30 kartica odjednom
3. **Svaka sekcija ima vlastiti state i useEffect** koji se izvršavaju nezavisno
4. **Nema optimizaciju renderovanja** - sve kartice se renderuju odjednom
5. **Koristi React.memo** ali bez pravilne implementacije
6. **InteractionManager se koristi samo za Daije sekciju**

### Dersovi stranica (UniversalPage.js):
1. **Koristi FlatList** - optimizovan za velike liste
2. **Ima paginaciju** - prikazuje samo 10 stavki odjednom sa "Prikaži više" dugmetom
3. **Koristi optimizacije**:
   - windowSize={10}
   - initialNumToRender={10}
   - maxToRenderPerBatch={5}
   - removeClippedSubviews={true}
   - getItemLayout za bolje performanse
4. **Memorisan renderItem** sa useCallback
5. **Pravilno implementiran keyExtractor**

## Glavni uzrok problema
Početna stranica renderuje sve 30 kartica odjednom u ScrollView bez ikakve optimizacije, dok dersovi stranica koristi FlatList sa paginacijom i optimizacijama.

## TODO Lista

- [x] Refaktorisati LecturesSection da koristi FlatList umjesto mapiranja u ScrollView
- [x] Refaktorisati DaijeSection da koristi FlatList umjesto mapiranja u ScrollView
- [x] Refaktorisati UdruzenjaSection da koristi FlatList umjesto mapiranja u ScrollView
- [x] Alternativno: Implementirati virtualizaciju za cijelu početnu stranicu sa SectionList
- [x] Dodati pravilnu memoizaciju za UniverzalCard komponente
- [ ] Testirati performanse nakon promjena

## Implementirane promjene

1. **Zamijenjen ScrollView sa SectionList** - Početna stranica sada koristi SectionList komponentu koja automatski virtualizuje sadržaj
2. **Kombinovane sve tri sekcije** - Umjesto tri nezavisne komponente, sada imamo jednu optimizovanu komponentu
3. **Dodane performanse optimizacije**:
   - windowSize={10}
   - initialNumToRender={10}
   - maxToRenderPerBatch={5}
   - removeClippedSubviews={true}
   - getItemLayout za precizno pozicioniranje
4. **Paralelno učitavanje podataka** - Svi podaci se učitavaju istovremeno sa Promise.all
5. **Memoizirane callback funkcije** - renderItem, renderSectionHeader, keyExtractor su memorizirani sa useCallback

## Preporučeni pristup
Umjesto refaktorisanja svake sekcije pojedinačno, najbolje bi bilo koristiti SectionList komponentu koja je dizajnirana baš za ovakve slučajeve gdje imamo više sekcija sa listama.