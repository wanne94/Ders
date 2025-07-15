# Optimization and Push Task

## Analiza codebase-a

Projekat sadrži:
- **Root**: Main deployment scripts i konfiguracije
- **mob/**: React Native mobile app (Expo)
- **web/**: Next.js web aplikacija
- **server/**: Node.js backend API

## Identifikovane optimizacije

### 1. Package.json optimizacije
- Uklanjanje nekorišćenih dependencies
- Ažuriranje zastarjelih paketa
- Optimizacija build skriptova

### 2. Code optimizacije
- Uklanjanje dead code-a
- Optimizacija importa
- Bundle size optimizacija

### 3. Performance optimizacije
- Image optimization
- Code splitting
- Lazy loading

### 4. Build optimizacije
- Optimizacija Metro bundler-a
- Next.js build optimizacija
- Production build konfiguracija

## Todo Lista

- [ ] Analiza package.json fajlova za nekorišćene dependencies
- [ ] Optimizacija web/next.config.js za production
- [ ] Optimizacija mob/metro.config.js
- [ ] Čišćenje unused imports u komponentama
- [ ] Optimizacija image loading-a
- [ ] Bundle size analiza i optimizacija
- [ ] Lint i test provjera
- [ ] Git commit i push promjena

## Procjena uticaja
- Smanjena bundle size
- Brže build vrijeme
- Bolje performance aplikacije
- Čišći kod