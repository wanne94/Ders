# UniversalCard Component

Univerzalna komponenta za prikaz kartica koja se može koristiti za predavanja, daije, udruženja i druge tipove sadržaja.

## Osnovno korištenje

```javascript
import UniversalCard from '../components/UniversalCard';

<UniversalCard
  title="Naslov kartice"
  subtitle="Podnaslov (opcionalno)"
  infoRows={[
    {
      icon: 'person-outline',
      text: 'Tekst informacije',
      highlightSearch: true
    }
  ]}
  rightContentType="image"
  imageUrl="/path/to/image.jpg"
  onPress={() => console.log('Kartica pritisnuta')}
  searchQuery="pretraga"
/>
```

## Props

### Osnovni props
- `title` (string, obavezno) - Glavni naslov kartice
- `subtitle` (string, opcionalno) - Podnaslov kartice
- `infoRows` (array, opcionalno) - Niz objekata sa informacijama za prikaz

### Info Row objekt
```javascript
{
  icon: 'ionicon-name',        // Ime Ionicon ikone
  text: 'Tekst za prikaz',     // Tekst koji se prikazuje
  highlightSearch: true,       // Da li da se highlightuje pretraga
  numberOfLines: 1,            // Broj linija (default: 1)
  textStyle: {}                // Dodatni stilovi za tekst
}
```

### Desni sadržaj props
- `rightContentType` (string) - Tip desnog sadržaja: 'image', 'icon'
- `imageUrl` (string) - URL slike (za tip 'image')
- `iconName` (string) - Ime ikone (za tip 'icon')
- `iconSize` (number) - Veličina ikone (default: 40)
- `iconColor` (string) - Boja ikone

### Interakcija props
- `onPress` (function) - Funkcija koja se poziva kada se kartica pritisne
- `searchQuery` (string) - Tekst pretrage za highlighting

### Stil props
- `cardStyle` (object) - Dodatni stilovi za karticu
- `titleStyle` (object) - Dodatni stilovi za naslov
- `subtitleStyle` (object) - Dodatni stilovi za podnaslov

### Server props
- `serverUrl` (string) - URL servera za slike (default: 'http://192.168.0.20:5003')
- `defaultImagePath` (string) - Putanja do default slike

## Primjeri korištenja

### 1. Kartica za predavanje (sa slikom)
```javascript
<UniversalCard
  title="Osnove islama"
  infoRows={[
    { icon: 'person-outline', text: 'Dr. Mustafa Cerić', highlightSearch: true },
    { icon: 'calendar-outline', text: '15.01.2024', highlightSearch: false },
    { icon: 'location-outline', text: 'Sarajevo', highlightSearch: true }
  ]}
  rightContentType="image"
  imageUrl="/uploads/images/lecture1.jpg"
  onPress={() => navigateToLecture(lecture)}
  searchQuery={searchQuery}
  titleStyle={{ textTransform: 'uppercase' }}
/>
```

### 2. Kartica za daiju (sa ikonom)
```javascript
<UniversalCard
  title="Dr. Mustafa Cerić"
  subtitle="Islamska teologija"
  infoRows={[
    { icon: 'location-outline', text: 'Sarajevo', highlightSearch: false },
    { icon: 'document-text-outline', text: 'Biografija...', numberOfLines: 2 }
  ]}
  rightContentType="icon"
  iconName="person"
  iconSize={50}
  iconColor="#022C43"
  onPress={() => navigateToDaija(daija)}
  searchQuery={searchQuery}
/>
```

### 3. Kartica za udruženje (sa ikonom)
```javascript
<UniversalCard
  title="Rijaset Islamske zajednice u BiH"
  infoRows={[
    { icon: 'document-text-outline', text: 'Opis udruženja...', numberOfLines: 2 },
    { icon: 'location-outline', text: 'Sarači 59', highlightSearch: true },
    { icon: 'business-outline', text: 'Sarajevo', highlightSearch: true }
  ]}
  rightContentType="icon"
  iconName="business"
  iconSize={50}
  iconColor="#022C43"
  onPress={() => navigateToOrganization(org)}
  searchQuery={searchQuery}
/>
```

## Napomene

- Komponenta automatski filtrira prazne info rows
- Search highlighting radi samo ako je `highlightSearch: true` u info row objektu
- Sve ikone koriste Ionicons biblioteku
- Avatar funkcionalnost je uklonjena - koristite ikone umjesto avatara
- Komponenta koristi temu iz `../config/theme.js`
- TouchableOpacity je onemogućen ako nije proslijeđen `onPress` prop 