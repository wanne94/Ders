# Plan za brisanje testnih i privremenih fajlova

## Identifikovani fajlovi za brisanje:

### Root direktorij:
- `debug-lectures.js` - debug script za lectures
- `diagnose-images.js` - dijagnostički script za slike  
- `index-fixed.js` - privremeni "fixed" fajl
- `restore-simple-images.js` - script za restore slika

### Mob direktorij:
- `check-expo-network.js` - test za network konekciju
- `app.config.js.backup` - backup fajl
- `projectplan.md` (duplikat - zadržat ću root verziju)

### Server direktorij:
- `check-db.js` - test za DB konekciju
- `check-env.js` - test env varijabli
- `check-lectures-data.js` - test za lectures data
- `combined.log` - log fajl
- `error.log` - error log fajl

### Web direktorij:
- `TESTING.md` - test dokumentacija
- `jest.config.js`, `jest.setup.js` - test konfiguracija
- `playwright.config.js` - test konfiguracija
- `components/UnifiedFormExample.jsx` - example komponenta
- `components/UnifiedForm.md` - dokumentacija komponente
- `utils/lectureStatusTests.js` - test fajl

## TODO lista:
- [x] 1. Identifikuj sve testne i privremene fajlove u projektu
- [x] 2. Analiziraj sadržaj fajlova da potvrdiš da su testni/privremeni  
- [x] 3. Obriši identifikovane testne i privremene fajlove
- [x] 4. Provjeri da li aplikacija još uvijek radi nakon brisanja

## Review sekcija

### Obrisani fajlovi:

#### Root direktorij:
- ✅ `debug-lectures.js` - debug script za testiranje MongoDB queries
- ✅ `diagnose-images.js` - dijagnostički script za slike i nginx
- ✅ `index-fixed.js` - privremeni "fixed" fajl sa ActiveDaije komponentom
- ✅ `restore-simple-images.js` - script za zamjenu CDN sa simple uploads

#### Mob direktorij:
- ✅ `check-expo-network.js` - test za network konekciju
- ✅ `app.config.js.backup` - backup fajl
- ✅ `projectplan.md` - duplikat project plan fajla

#### Server direktorij:
- ✅ `check-db.js` - test za DB konekciju
- ✅ `check-env.js` - test env varijabli
- ✅ `check-lectures-data.js` - test za lectures data
- ✅ `combined.log` - log fajl
- ✅ `error.log` - error log fajl

#### Web direktorij:
- ✅ `TESTING.md` - test dokumentacija
- ✅ `jest.config.js`, `jest.setup.js` - Jest test konfiguracija
- ✅ `playwright.config.js` - Playwright test konfiguracija
- ✅ `components/UnifiedFormExample.jsx` - example komponenta
- ✅ `components/UnifiedForm.md` - dokumentacija komponente
- ✅ `utils/lectureStatusTests.js` - test fajl za lecture status

### Rezultat testiranja:
- ✅ **Server se pokreće bez greške**
- ✅ **Web aplikacija se uspješno build-uje**
- ⚠️ **1 warning u build-u** - React Hook useEffect dependency (nije kritično)

**Svi privremeni i testni fajlovi su uspješno obrisani. Aplikacija radi normalno.**