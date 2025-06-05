# Color Guide - Zajedničke boje za Mobile i Web aplikacije

Ovaj dokument objašnjava kako koristiti zajedničku konfiguraciju boja za osiguravanje konzistentnog branding-a kroz sve platforme.

## 📁 Struktura fajlova

```
/
├── shared-colors.js                    # Glavna konfiguracija boja (za web)
├── mobile/
│   ├── shared-colors.js                # Kopija za mobile aplikaciju
│   └── src/config/theme.js             # Mobile theme (koristi shared-colors)
└── web/src/utils/theme.js              # Web theme (koristi shared-colors)
```

## 🎨 Glavne boje

### Primary boja (Glavna brand boja)
- **Osnovna**: `#022C43` - Koristi se za header, navigaciju, glavne dugmad
- **Svijetla**: `#055A87` - Hover efekti, sekundarne varijante
- **Tamna**: `#011A2A` - Pressed stanja, tamnije varijante

### Secondary boja (Sekundarna brand boja)
- **Osnovna**: `#dc004e` - Akcenti, highlights, sekundarna dugmad
- **Svijetla**: `#ff5983` - Hover efekti
- **Tamna**: `#a7001e` - Pressed stanja

## 📱 Kako koristiti u Mobile aplikaciji

```javascript
import { colors, COLOR_USAGE } from '../config/theme';
// ili direktno:
// import { BRAND_COLORS, COLOR_USAGE } from '../shared-colors';

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLOR_USAGE.header,
  },
  headerText: {
    color: COLOR_USAGE.headerText,
  },
  title: {
    color: COLOR_USAGE.titleText,
  },
  bodyText: {
    color: COLOR_USAGE.bodyText,
  },
  primaryButton: {
    backgroundColor: COLOR_USAGE.primaryButton,
  },
  primaryButtonText: {
    color: COLOR_USAGE.primaryButtonText,
  },
});
```

## 🌐 Kako koristiti u Web aplikaciji

```javascript
import { BRAND_COLORS, COLOR_USAGE } from '../../../shared-colors';
import { useTheme } from '@mui/material/styles';

// Opcija 1: Direktno korištenje
const MyComponent = () => (
  <Box sx={{ 
    backgroundColor: COLOR_USAGE.header,
    color: COLOR_USAGE.headerText 
  }}>
    Content
  </Box>
);

// Opcija 2: Kroz MUI theme
const MyComponent = () => {
  const theme = useTheme();
  
  return (
    <Box sx={{ 
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText 
    }}>
      Content
    </Box>
  );
};
```

## 🎯 Preporučena upotreba boja

| Element | Boja | Razlog |
|---------|------|--------|
| **Header/Navigation** | `COLOR_USAGE.header` | Konzistentnost brand identiteta |
| **Naslovi kartica/sadržaja** | `COLOR_USAGE.titleText` | Brand identitet, istaknutost |
| **Naslovi stranica** | `COLOR_USAGE.headingText` | Hijerarhija sadržaja |
| **Glavni tekst** | `COLOR_USAGE.bodyText` | Čitljivost |
| **Linkovi** | `COLOR_USAGE.link` | Prepoznatljivost |
| **Glavna dugmad** | `COLOR_USAGE.primaryButton` | Brand identitet |
| **Sekundarna dugmad** | `COLOR_USAGE.secondaryButton` | Vizuelna hijerarhija |
| **Pozadina stranice** | `COLOR_USAGE.pageBackground` | Neutralnost |
| **Pozadina kartica** | `COLOR_USAGE.cardBackground` | Kontrast |

## 🔧 Dodavanje novih boja

Ako trebate dodati nove boje, uredite `shared-colors.js`:

```javascript
export const BRAND_COLORS = {
  // ... postojeće boje ...
  
  // Dodajte novu kategoriju
  newCategory: {
    main: '#hexcode',
    light: '#hexcode',
    dark: '#hexcode',
  },
};

// Dodajte u COLOR_USAGE za lakše korištenje
export const COLOR_USAGE = {
  // ... postojeće ...
  newElement: BRAND_COLORS.newCategory.main,
};
```

## ✅ Najbolje prakse

1. **Uvijek koristite `COLOR_USAGE`** umjesto direktnih hex kodova
2. **Testirajte na oba platforme** nakon promjene boja
3. **Održavajte kontrast** za pristupačnost (minimum 4.5:1 ratio)
4. **Dokumentirajte nove boje** u ovom fajlu
5. **Koristite semantička imena** umjesto opisnih (npr. `primaryButton` umjesto `blueButton`)

## 🚀 Prednosti ovog pristupa

- ✅ **Konzistentnost** - Iste boje na svim platformama
- ✅ **Održivost** - Jedna lokacija za sve promjene
- ✅ **Skalabilnost** - Lako dodavanje novih boja
- ✅ **Type Safety** - Intellisense podrška
- ✅ **Brand Compliance** - Osigurava poštovanje brand guidelines

## 🔄 osvježavanje postojećih komponenti

Kada ažurirate postojeće komponente da koriste novi sistem:

1. Importirajte theme: `import { colors, COLOR_USAGE } from '../config/theme';`
2. Zamijenite hardcoded boje sa theme varijablama
3. Testirajte na oba platforme
4. Commitajte promjene

---

**Napomena**: Ovaj sistem osigurava da sve promjene boja budu automatski primijenjene na oba platforme, što značajno smanjuje vrijeme održavanja i mogućnost grešaka. 