# @predavanje/shared

Zajednički kod koji se koristi u web i mobile aplikacijama.

## Struktura

```
shared/
├── src/
│   ├── types/          # TypeScript tipovi i interfejsi
│   ├── helpers/        # Pomoćne funkcije
│   ├── utils/          # Utility klase i funkcije
│   ├── constants/      # Konstante aplikacije
│   └── index.ts        # Glavni export fajl
├── package.json
├── tsconfig.json
└── README.md
```

## Korišćenje

### U web aplikaciji

```typescript
import { User, ApiClient, formatDate, API_ENDPOINTS } from '@predavanje/shared';

const apiClient = new ApiClient('http://localhost:3001');
const user: User = { /* ... */ };
const formattedDate = formatDate(new Date());
```

### U mobile aplikaciji

```typescript
import { User, validateEmail, STORAGE_KEYS } from '@predavanje/shared';

const isValid = validateEmail('test@example.com');
const tokenKey = STORAGE_KEYS.AUTH_TOKEN;
```

## Razvoj

```bash
# Kompajliranje TypeScript koda
npm run build

# Watch mode za razvoj
npm run dev

# Čišćenje dist foldera
npm run clean
```

## Dodavanje novog koda

1. Dodaj novi kod u odgovarajući folder u `src/`
2. Eksportuj ga u odgovarajućem `index.ts` fajlu
3. Kompajliraj kod sa `npm run build`
4. Kod će biti dostupan u web i mobile aplikacijama 