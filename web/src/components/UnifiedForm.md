# UnifiedForm Komponenta

UnifiedForm je jedinstvena komponenta koja objedinjuje funkcionalnost tri odvojene forme:
- `LectureForm` - za dodavanje/uređivanje predavanja
- `DaijaForm` - za dodavanje/uređivanje daija
- `OrganizationForm` - za dodavanje/uređivanje udruženja

## Prednosti

1. **Smanjenje duplikovanja koda** - Jedna komponenta umjesto tri
2. **Lakše održavanje** - Promjene se vrše na jednom mjestu
3. **Konzistentnost** - Isti UI/UX pattern za sve tipove
4. **Fleksibilnost** - Lako dodavanje novih tipova

## Korištenje

### Osnovni primjer

```jsx
import UnifiedForm from './components/UnifiedForm';

const MyComponent = () => {
  const [formOpen, setFormOpen] = useState(false);
  
  return (
    <UnifiedForm
      open={formOpen}
      onClose={() => setFormOpen(false)}
      onSuccess={(data) => console.log('Success:', data)}
      type="lecture" // 'lecture', 'daija', ili 'organization'
    />
  );
};
```

### Dodavanje novog predavanja

```jsx
<UnifiedForm
  open={lectureFormOpen}
  onClose={() => setLectureFormOpen(false)}
  onSuccess={(newLecture) => {
    // Ažuriraj state sa novim predavanjem
    setLectures(prev => [...prev, newLecture]);
    setLectureFormOpen(false);
  }}
  type="lecture"
  approvalEnabled={true}
  daije={availableDaije}
  organizations={availableOrganizations}
/>
```

### Uređivanje postojeće daije

```jsx
<UnifiedForm
  open={daijaFormOpen}
  onClose={() => setDaijaFormOpen(false)}
  onSuccess={(updatedDaija) => {
    // Ažuriraj state sa ažuriranom daijom
    setDaije(prev => prev.map(d => 
      d._id === updatedDaija._id ? updatedDaija : d
    ));
    setDaijaFormOpen(false);
  }}
  type="daija"
  data={daijaToEdit} // postojeći podaci za uređivanje
  approvalEnabled={true}
/>
```

### Dodavanje novog udruženja

```jsx
<UnifiedForm
  open={organizationFormOpen}
  onClose={() => setOrganizationFormOpen(false)}
  onSuccess={(newOrganization) => {
    setOrganizations(prev => [...prev, newOrganization]);
    setOrganizationFormOpen(false);
  }}
  type="organization"
  approvalEnabled={true}
/>
```

## Props

| Prop | Tip | Obavezno | Opis |
|------|-----|----------|------|
| `open` | boolean | Da | Kontroliše da li je dialog otvoren |
| `onClose` | function | Da | Callback funkcija za zatvaranje dialoga |
| `onSuccess` | function | Da | Callback funkcija koja se poziva nakon uspješnog čuvanja |
| `type` | string | Da | Tip forme: 'lecture', 'daija', ili 'organization' |
| `data` | object | Ne | Postojeći podaci za uređivanje (null za dodavanje novog) |
| `approvalEnabled` | boolean | Ne | Da li je potrebno odobrenje (default: true) |
| `daije` | array | Ne | Lista daija za lecture formu |
| `organizations` | array | Ne | Lista udruženja za lecture formu |

## Tipovi podataka

### Lecture
```javascript
{
  title: string,
  description: string,
  date: string, // YYYY-MM-DD format
  time: string, // HH:MM format
  address: string,
  city: string,
  speaker: string,
  daijaId: string,
  organization: string,
  organizationId: string,
  image: string,
  status: 'pending' | 'approved' | 'rejected'
}
```

### Daija
```javascript
{
  firstName: string, // mapira se na 'name' u API-ju
  title: 'prof' | 'mr' | 'dr',
  biography: string,
  image: string,
  status: 'pending' | 'approved' | 'rejected',
  education: string[]
}
```

### Organization
```javascript
{
  name: string,
  description: string,
  address: string,
  city: string,
  facebook: string,
  instagram: string,
  telegram: string,
  viber: string,
  status: 'pending' | 'approved' | 'rejected',
  image: string
}
```

## Validacija

Komponenta automatski validira polja na osnovu tipa:

### Lecture validacija
- Naslov (min 3 karaktera)
- Datum (ne može biti u prošlosti)
- Vrijeme (obavezno)
- Adresa (min 3 karaktera)
- Mjesto (min 2 karaktera)
- Predavač (daija ili custom ime)

### Daija validacija
- Ime (min 2 karaktera)
- Biografija (min 10 karaktera)

### Organization validacija
- Naziv (min 2 karaktera)
- Opis (min 10 karaktera)
- Mjesto (min 2 karaktera)

## Upload slika

Komponenta podržava upload slika sa sljedećim ograničenjima:
- Maksimalna veličina: 5MB
- Podržani formati: JPG, PNG, GIF, WebP
- Automatski preview prije čuvanja

## API Endpoints

Komponenta automatski koristi odgovarajuće API endpoints:

- **Lecture**: `POST/PUT /predavanja`
- **Daija**: `POST/PUT /daije`
- **Organization**: `POST/PUT /udruzenja`

## Migracija sa postojećih formi

Da biste zamijenili postojeće forme sa UnifiedForm:

1. Zamijenite import:
```jsx
// Staro
import LectureForm from './LectureForm';
import DaijaForm from './DaijaForm';
import OrganizationForm from './OrganizationForm';

// Novo
import UnifiedForm from './UnifiedForm';
```

2. Zamijenite komponentu:
```jsx
// Staro
<LectureForm
  open={open}
  onClose={onClose}
  onSuccess={onSuccess}
  lecture={lectureData}
  approvalEnabled={true}
/>

// Novo
<UnifiedForm
  open={open}
  onClose={onClose}
  onSuccess={onSuccess}
  type="lecture"
  data={lectureData}
  approvalEnabled={true}
  daije={daije}
  organizations={organizations}
/>
```

## Primjer kompletne implementacije

Pogledajte `UnifiedFormExample.jsx` za kompletan primjer korištenja komponente sa svim tipovima i funkcionalnostima. 