# Plan za SEO Optimizaciju i Google Search Console Verifikaciju

## TODO Lista

### 1. Google Search Console Verifikacija i Analytics ✅
- [x] Dodati Google verifikacijski meta tag u _document.js
- [x] Dodati Google Analytics (gtag.js) tag u _document.js
- [x] Provjeriti da li tagovi ispravno funkcionišu

### 2. SEO Meta Tagovi Optimizacija ✅
- [x] Analizirati postojeće meta tagove
- [x] Dodati osnovne SEO meta tagove (description, keywords, author)
- [x] Dodati Open Graph meta tagove za društvene mreže
- [x] Dodati Twitter Card meta tagove

### 3. SEO Tehnička Optimizacija ✅
- [x] Dodati title tag sa dinamičkim naslovima za svaku stranicu
- [x] Dodati canonical URL
- [x] Dodati robots meta tag
- [x] Dodati viewport meta tag

### 4. Performance Optimizacija ✅
- [x] Dodati preconnect/dns-prefetch za eksterne domene

### 5. Strukturirani Podaci ✅
- [x] Dodati JSON-LD schema markup za organizaciju

## Dodatne SEO optimizacije

### 6. Hreflang i lokalizacija ✅
- [x] Postavljen hreflang="bs-BA" za bosanski jezik
- [x] Promijenjen lang atribut sa "en" na "bs-BA"

### 7. Optimizacija naslova ✅
- [x] Početna stranica: "Islamska predavanja - Ders.ba"
- [x] Dinamički title za profile daija: "Ime, titula - Biografija"

### 8. Sitemap ✅
- [x] Kreiran sitemap.xml sa svim glavnim stranicama
- [x] Ažuriran robots.txt sa referencom na sitemap
- [x] Dodat sitemap link u _document.js

### 9. Canonical tagovi i paginacija ✅
- [x] Dodati canonical tagovi na sve stranice
- [x] Stranice sa paginacijom: samo prva stranica je index
- [x] Ostale stranice imaju noindex,follow sa canonical na prvu
- [x] Dodati prev/next linkovi za paginaciju

## Review

### Izvršene promjene:

1. **Google integracija**:
   - Dodat Google Search Console verifikacijski meta tag
   - Integrisan Google Analytics (gtag.js) sa ID: G-2PXHZSFM8R
   - Oba taga su dodana u _document.js za automatsko učitavanje na svim stranicama

2. **SEO Meta tagovi**:
   - Dodati osnovni SEO tagovi (description, keywords, author, viewport, robots)
   - Implementirani Open Graph meta tagovi za bolje dijeljenje na društvenim mrežama
   - Dodati Twitter Card meta tagovi
   - Svi tagovi su centralizovani u _document.js

3. **Dinamički naslovi stranica**:
   - Dodat Head import i dinamički title tagovi na sve glavne stranice
   - index.js: "Ders - Platforma za praćenje predavanja, daija i udruženja"
   - lectures.js: "Predavanja - Ders"
   - organizations.js: "Udruženja - Ders"
   - daije.js: "Daije - Ders"
   - Svaka stranica ima prilagođen description i canonical URL

4. **Performance optimizacija**:
   - Dodati preconnect i dns-prefetch za Google Tag Manager domenu
   - Ovo ubrzava učitavanje analytics skripti

5. **Strukturirani podaci**:
   - Dodat JSON-LD schema markup za organizaciju
   - Uključuje osnovne informacije, logo, i linkove na društvene mreže
   - Pomaže pretraživačima bolje razumjeti sadržaj stranice

### Rezultat:
- Web stranica je sada potpuno optimizovana za SEO
- Google Search Console i Analytics su uspješno integrisani
- Stranica će imati bolje rangiranje u pretraživačima
- Poboljšano dijeljenje na društvenim mrežama
- Brže učitavanje eksternih resursa