# Services - Ujednačeni između Web i Mobile App

Ovaj direktorij sadrži sve API servise za web aplikaciju. Servisi su refaktorisani da koriste konzistentan pristup i potpuno su ujednačeni sa mobile aplikacijom.

## 🔄 **Promjene u Ujednačavanju**

### Ažurirani Endpointi
- ✅ `PREDAVANJA: '/lectures'` (umjesto `/predavanja`)
- ✅ `UDRUZENJA: '/organizations'` (umjesto `/udruzenja`)
- ✅ Svi ostali endpointi ostaju isti

### Novi Server Endpointi
- ✅ `GET /api/lectures/approved` - Odobrena predavanja sa paginacijom
- ✅ `GET /api/lectures/pending` - Predavanja na čekanju sa paginacijom (admin)
- ✅ `GET /api/lectures/latest` - Najnovija predavanja
- ✅ `GET /api/lectures/search` - Pretraživanje predavanja

## Struktura

- `apiClient.js` - Glavni API klijent za HTTP zahtjeve
- `config.js` - Konfiguracija API endpointa (ujednačena sa mob app)
- `predavanjaService.js` - Servis za predavanja/dersove
- `udruzenjaService.js` - Servis za udruženja/organizacije
- `daijeService.js` - Servis za daije
- `suggestionsService.js` - Servis za prijedloge
- `index.js` - Glavni export fajl

## Korištenje

### Import servisa

```javascript
// Pojedinačni import
import predavanjaService from '@/services/predavanjaService';
import { daijeService, udruzenjaService } from '@/services';

// Ili sve odjednom
import { 
  predavanjaService, 
  daijeService, 
  udruzenjaService, 
  suggestionsService 
} from '@/services';
```

### Primjeri korištenja

#### Predavanja Service

```javascript
// Dohvati sva javna predavanja
const lectures = await predavanjaService.getAllPredavanja();

// Dohvati odobrena predavanja sa paginacijom (NOVI)
const approvedResponse = await predavanjaService.getApprovedPredavanja(1, 20);
const { lectures, pagination } = approvedResponse;

// Dohvati predavanja na čekanju sa paginacijom (admin)
const pendingResponse = await predavanjaService.getPendingPredavanja(1, 10);
const { lectures: pendingLectures, pagination: pendingPagination } = pendingResponse;

// Dohvati najnovija predavanja
const latestLectures = await predavanjaService.getLatestPredavanja(5);

// Pretraži predavanja
const searchResults = await predavanjaService.searchPredavanja('islam');

// Dohvati predavanje po ID-u
const lecture = await predavanjaService.getPredavanjeById(id);

// Dohvati predavanja po daiji (ispravljen endpoint)
const daijaLectures = await predavanjaService.getPredavanjaByDaija(daijaId);

// Dohvati predavanja po organizaciji (ispravljen endpoint)
const orgLectures = await predavanjaService.getPredavanjaByOrganization(orgId);

// Stvori novo predavanje
const newLecture = await predavanjaService.createPredavanje(lectureData);

// Ažuriraj status
await predavanjaService.updateStatus(id, 'approved');
```

#### Daije Service

```javascript
// Dohvati sve daije
const daije = await daijeService.getAllDaije();

// Dohvati daiju po ID-u
const daija = await daijeService.getDaijaById(id);

// Dohvati predavanja daije (ispravljen endpoint)
const lectures = await daijeService.getDaijaPredavanja(daijaId);
```

#### Udruženja Service

```javascript
// Dohvati sva udruženja
const organizations = await udruzenjaService.getAllUdruzenja();

// Dohvati udruženje po ID-u
const org = await udruzenjaService.getUdruzenjeById(id);

// Dohvati predavanja udruženja (ispravljen endpoint)
const lectures = await udruzenjaService.getUdruzenjePredavanja(orgId);
```

## 🆕 **Novi Endpointi sa Paginacijom**

### 1. Odobrena Predavanja
```javascript
const response = await predavanjaService.getApprovedPredavanja(1, 20);
// Vraća:
{
  lectures: [...],
  pagination: {
    page: 1,
    limit: 20,
    total: 150,
    pages: 8
  }
}
```

### 2. Predavanja na Čekanju (Admin)
```javascript
const response = await predavanjaService.getPendingPredavanja(1, 10);
// Vraća:
{
  lectures: [...],
  pagination: {
    page: 1,
    limit: 10,
    total: 25,
    pages: 3
  }
}
```

## 🔧 **Server Endpointi**

| Endpoint | Metoda | Pristup | Opis |
|----------|--------|---------|------|
| `/api/lectures/public` | GET | Javni | Sva javna predavanja |
| `/api/lectures/approved` | GET | Javni | Odobrena predavanja (paginacija) |
| `/api/lectures/pending` | GET | Admin | Predavanja na čekanju (paginacija) |
| `/api/lectures/latest` | GET | Javni | Najnovija predavanja |
| `/api/lectures/search` | GET | Javni | Pretraživanje predavanja |
| `/api/lectures/daija/:id` | GET | Javni | Predavanja po daiji |
| `/api/lectures/organization/:id` | GET | Javni | Predavanja po organizaciji |
| `/api/lectures/:id` | GET | Javni | Pojedinačno predavanje |

## Konfiguracija

API base URL se čita iz environment varijable:
- `NEXT_PUBLIC_API_URL` - URL backend servera

## Error Handling

Svi servisi automatski bacaju greške koje možete uhvatiti:

```javascript
try {
  const data = await predavanjaService.getAllPredavanja();
  // Koristi data
} catch (error) {
  console.error('Greška:', error.message);
  // Prikaži error korisniku
}
```

## 🔄 **Migracija s Axios poziva**

### Stari kod:
```javascript
const response = await axiosInstance.get('/lectures/public');
const lectures = response.data;
```

### Novi kod:
```javascript
const lectures = await predavanjaService.getAllPredavanja();
```

### Za paginaciju:
```javascript
// Stari kod
const response = await axiosInstance.get('/lectures/approved?page=1&limit=20');
const lectures = response.data.lectures;

// Novi kod
const response = await predavanjaService.getApprovedPredavanja(1, 20);
const { lectures, pagination } = response;
```

## ✅ **Testiranje**

Svi endpointi su testirani i rade ispravno:
- ✅ Web aplikacija koristi ujednačene servise
- ✅ Mobile aplikacija koristi ujednačene servise  
- ✅ Server podržava sve potrebne endpointe
- ✅ Paginacija radi ispravno
- ✅ Error handling je konzistentan 