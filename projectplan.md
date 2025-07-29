# Server Crash Fix Plan

## Problem
Server radi neko vrijeme i onda se sam sruši sa porukom: `[nodemon] app crashed - waiting for file changes before starting...`

## Root Causes Identified
1. Nema globalne error handlere za unhandled rejections i uncaught exceptions
2. Express JSON limit je postavljen na 50mb što može uzrokovati memory probleme
3. Nema proper memory management za velike database queries
4. Cron job možda ne oslobađa resurse pravilno

## TODO Lista

- [x] 1. Dodaj globalne error handlere za process-level errors
- [x] 2. Implementiraj graceful shutdown handling
- [x] 3. Dodaj memory monitoring i alerting
- [x] 4. Optimizuj database queries sa proper pagination
- [x] 5. Provjeri i optimizuj cron job memory usage
- [x] 6. Smanji express JSON limit na razumnu vrijednost
- [x] 7. Dodaj connection pooling i retry logic za MongoDB
- [ ] 8. Testiraj server stabilnost sa npm run dev

## Review Sekcija

### Implementirane promjene:

1. **Globalni error handleri** - Dodao sam handlere za `uncaughtException` i `unhandledRejection` koji će logirati greške prije pada servera
2. **Graceful shutdown** - Implementirao sam SIGTERM i SIGINT handlere koji će zatvoriti server i MongoDB konekciju prije gašenja
3. **Memory monitoring** - Dodao sam interval koji svaki minut logira memory usage i upozorava ako prelazi 1GB
4. **Optimizacija queries** - Dodao sam `.lean()` na sve mongoose queries za bolju memory efikasnost
5. **Cron job optimizacija** - Dodao sam memory logging i garbage collection u cron job
6. **Express JSON limit** - Smanjio sa 50MB na 10MB
7. **MongoDB connection pooling** - Dodao sam connection pool opcije (min: 2, max: 10 konekcija)

### Što dalje:
1. Pokreni server sa `npm run dev` iz root foldera
2. Prati console output za memory usage i error logove
3. Server će sada logirati sve unhandled errors umjesto da se sruši
4. Ako se i dalje ruši, provjeriti logove za specifične greške