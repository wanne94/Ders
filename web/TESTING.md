# Testing Guide

Ovaj dokument objašnjava kako koristiti test sistem koji je postavljen za web aplikaciju.

## Vrste Testova

### 1. Unit Testovi (Jedinačni testovi)
- **Lokacija**: `src/**/__tests__/**` ili `src/**/*.test.js`
- **Svrha**: Testiraju pojedinačne komponente i funkcije
- **Tehnologija**: Jest + React Testing Library

#### Pokretanje:
```bash
npm test                 # Pokrece sve unit testove
npm run test:watch       # Pokrece testove u watch modu
npm run test:coverage    # Pokrece testove sa coverage reportom
```

### 2. End-to-End (E2E) Testovi
- **Lokacija**: `tests/e2e/`
- **Svrha**: Testiraju celu aplikaciju u browseru
- **Tehnologija**: Playwright

#### Pokretanje:
```bash
npm run test:e2e        # Pokrece E2E testove
npm run test:e2e:ui     # Pokrece E2E testove sa UI interfejsom
```

### 3. Pre-Deploy Testovi
- **Lokacija**: `tests/pre-deploy.test.js`
- **Svrha**: Provjerava da li je aplikacija spremna za deploy
- **Uključuje**: Linting, unit testove, build, E2E testove, security check

#### Pokretanje:
```bash
npm run pre-deploy      # Pokrece sve pre-deploy testove
npm run test:pre-deploy # Alternativni način
```

## Testiranje Prije Deploy-a

**VAŽNO**: Pre-deploy testovi se automatski pokreću kada pokušate da deployujete web aplikaciju:

```bash
npm run deploy:web      # Automatski pokrece pre-deploy testove
```

Ako bilo koji kritični test ne prođe, deploy će biti blokiran.

## Kritični vs Opcionalni Testovi

### Kritični Testovi (blokiraju deploy):
- ✅ Environment files check
- ✅ Linting
- ✅ Unit testovi
- ✅ Build proces
- ✅ Build output provjera

### Opcionalni Testovi (daju upozorenje):
- ⚠️ E2E testovi
- ⚠️ Security audit

## Pisanje Novih Testova

### Unit Test Primjer:
```javascript
// src/components/__tests__/MyComponent.test.jsx
import { render, screen } from '@testing-library/react';
import MyComponent from '../MyComponent';

test('renders component correctly', () => {
  render(<MyComponent title="Test" />);
  expect(screen.getByText('Test')).toBeInTheDocument();
});
```

### E2E Test Primjer:
```javascript
// tests/e2e/mypage.spec.js
const { test, expect } = require('@playwright/test');

test('should load page', async ({ page }) => {
  await page.goto('/mypage');
  await expect(page).toHaveTitle(/MyPage/);
});
```

## Konfiguracija

### Jest Konfiguracija
- **File**: `jest.config.js`
- **Setup**: `jest.setup.js`

### Playwright Konfiguracija  
- **File**: `playwright.config.js`

## Folder Struktura

```
web/
├── src/
│   ├── components/
│   │   └── __tests__/          # Component testovi
│   ├── utils/
│   │   └── __tests__/          # Utility testovi
│   └── __tests__/              # Opšti testovi
├── tests/
│   ├── e2e/                    # E2E testovi
│   ├── screenshots/            # Screenshots iz E2E testova
│   └── pre-deploy.test.js      # Pre-deploy test script
├── jest.config.js              # Jest konfiguracija
├── jest.setup.js               # Jest setup
└── playwright.config.js        # Playwright konfiguracija
```

## Najbolje Prakse

1. **Pišite testove za nove komponente** - svaka nova komponenta treba imati osnovne testove
2. **Testirajte critical paths** - fokusirajte se na glavne funkcionalnosti
3. **Koristite data-testid** - za lakše targetovanje elemenata u E2E testovima
4. **Mock eksterni API-ji** - za pouzdane i brže testove
5. **Redovno pokretajte testove** - ne čekajte do deploya

## Troubleshooting

### Česti Problemi:

1. **E2E testovi padaju** - Proverite da li je Next.js dev server pokrenut
2. **Unit testovi padaju** - Proverite Jest konfiguraciju i mocks
3. **Build pada** - Proverite sintaks greške i TypeScript errors
4. **Linting pada** - Pokrenite `npm run lint` i ispravite greške

### Debug Komande:
```bash
npm run test -- --verbose       # Detaljni output unit testova
npm run test:e2e:ui             # E2E testovi sa vizuelnim interfejsom
npm run test:coverage           # Coverage report
```

## Continuous Integration

Testovi se mogu integrisati u CI/CD pipeline:

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: |
    cd web
    npm run pre-deploy
```

## Podrška

Za pitanja o testiranju, obratite se development timu ili pregledajte dokumentaciju:
- [Jest](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Playwright](https://playwright.dev/) 