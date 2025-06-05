# 🚀 Brza pomoć - Test Data Management

## Najčešće korišćene komande

### NPM skripte (preporučeno)
```bash
# Brzo dodavanje test podataka
npm run test-data:quick

# Pregled stanja baze
npm run test-data:stats

# Brisanje test podataka
npm run test-data:delete

# Puna demonstracija
npm run test-data:demo
```

### Direktne komande
```bash
# Dodaj 30 organizacija, 30 daija, 30 predavanja
node manage-test-data.js populate

# Prikaži statistike
node manage-test-data.js stats

# Obriši sve test podatke
node manage-test-data.js delete

# Automatska demo
node demo-test-data.js

# Brzo testiranje
node quick-test.js
```

## Tipični workflow

1. **Početak rada** - Dodaj test podatke:
   ```bash
   npm run test-data:quick
   ```

2. **Tokom rada** - Provjeri stanje:
   ```bash
   npm run test-data:stats
   ```

3. **Kraj rada** - Obriši test podatke:
   ```bash
   npm run test-data:delete
   ```

## Što se kreira?

- ✅ **30 organizacija** (različiti tipovi, gradovi, statusи)
- ✅ **30 daija** (imena, biografije, obrazovanje)
- ✅ **30 predavanja** (teme, datumi, povezanost)
- ✅ **1 test korisnik** (admin za kreiranje)

## Sigurnost

- 🔒 Briše **SAMO** test podatke
- 🔒 **NE** briše originalne podatke
- 🔒 Koristi napredne regex pattern-e za prepoznavanje

## Problemi?

Ako imate problema, pokrenite:
```bash
node manage-test-data.js
```

Za detaljnu dokumentaciju pogledajte: `README-test-data.md` 