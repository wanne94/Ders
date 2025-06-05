# "Zapamti me" Funkcionalnost

## Pregled

Implementirana je "Zapamti me" funkcionalnost koja omogućava korisnicima da sačuvaju svoje email i lozinku za buduće prijave na oba platforme (web i mobile).

## Funkcionalnosti

### ✅ Web Platforma

**Lokacija:** `web/src/pages/auth.jsx`

- **Checkbox "Zapamti me"** - Omogućava korisniku da označi da želi da se zapamte kredencijali
- **Automatsko učitavanje** - Pri sledećoj poseti, email i lozinka se automatski popunjavaju
- **Sigurno brisanje** - Kredencijali se brišu pri odjavi ili isteku tokena

**Implementacija:**
```jsx
<FormControlLabel
  control={
    <Checkbox
      checked={rememberMe}
      onChange={(e) => setRememberMe(e.target.checked)}
    />
  }
  label="Zapamti me"
/>
```

### ✅ Mobile Platforma

**Lokacija:** `mobile/src/screens/AuthScreen.js`

- **Checkbox "Zapamti me"** - Ista funkcionalnost kao na web-u
- **AsyncStorage** - Koristi se za sigurno čuvanje kredencijala
- **Opcije odjave** - Korisnik može da bira da li da obriše zapamćene podatke

**Implementacija:**
```jsx
<View style={styles.checkboxContainer}>
  <Checkbox
    status={rememberMe ? 'checked' : 'unchecked'}
    onPress={() => setRememberMe(!rememberMe)}
    color={colors.primary.main}
  />
  <Text style={styles.checkboxLabel}>Zapamti me</Text>
</View>
```

## Sigurnost

### 🔒 Čuvanje podataka

**Web:**
- `localStorage.setItem('rememberedEmail', email)`
- `localStorage.setItem('rememberedPassword', password)`

**Mobile:**
- `AsyncStorage.setItem('remember_email', email)`
- `AsyncStorage.setItem('remember_password', password)`

### 🛡️ Automatsko brisanje

Zapamćeni kredencijali se automatski brišu u sledećim slučajevima:

1. **Odjava korisnika** - Korisnik eksplicitno bira da obriše podatke
2. **Istek tokena** - Kada se token istekne ili postane nevažeći
3. **401/403 greške** - Kada server vrati unauthorized greške

## Struktura fajlova

### Web platforma
```
web/src/
├── utils/authHelpers.js          # Helper funkcije za auth
├── pages/auth.jsx                # Login forma sa "Zapamti me"
├── components/Navigation.jsx     # Logout funkcionalnost
└── utils/axiosConfig.js          # Interceptor za token cleanup
```

### Mobile platforma
```
mobile/src/
├── utils/authHelpers.js          # AsyncStorage helper funkcije
├── services/authService.js      # Auth servis sa remember me
├── contexts/AuthContext.js      # Auth context sa state management
├── screens/AuthScreen.js        # Login forma sa checkbox
└── components/CustomDrawerContent.js # Logout opcije
```

## API Pozivi

Funkcionalnost ne zahteva izmene na backend-u. Koriste se postojeći endpointi:

- `POST /users/auth` - Login
- `POST /users/register` - Registracija
- `POST /users/forgot-password/*` - Reset lozinke

## Korisničko iskustvo

### Prvi login
1. Korisnik unosi email i lozinku
2. Označava "Zapamti me" checkbox
3. Klika "Prijavi se"
4. Kredencijali se čuvaju lokalno

### Sledeći login
1. Forma se automatski popunjava sa zapamćenim podacima
2. "Zapamti me" je već označeno
3. Korisnik može direktno da se prijavi

### Odjava (Mobile)
1. Korisnik klika "Odjavi se"
2. Prikazuje se dialog sa opcijama:
   - "Odjavi se i zapamti podatke"
   - "Odjavi se i obriši podatke"

### Odjava (Web)
1. Korisnik klika "Odjavi se"
2. Automatski se brišu svi podaci uključujući zapamćene kredencijale

## Testiranje

### Test scenariji

1. **Osnovni flow:**
   - Prijavi se sa "Zapamti me"
   - Odjavi se
   - Vrati se na login - podaci su zapamćeni

2. **Brisanje podataka:**
   - Prijavi se sa "Zapamti me"
   - Odjavi se i obriši podatke (mobile) ili običnu odjavu (web)
   - Vrati se na login - podaci su obrisani

3. **Istek tokena:**
   - Prijavi se sa "Zapamti me"
   - Sačekaj da token istekne
   - Pokušaj API poziv - automatski redirect na login sa obrisanim podacima

## Sigurnosne napomene

⚠️ **Važno:** Lozinke se čuvaju u plain text formatu u localStorage/AsyncStorage. Ovo je prihvatljivo za development, ali za production preporučuje se:

1. **Enkripcija** - Enkriptovati lozinku pre čuvanja
2. **Biometrijska autentifikacija** - Koristiti TouchID/FaceID na mobile
3. **Session management** - Implementirati refresh token sistem
4. **Timeout** - Automatski brisati podatke nakon određenog vremena

## Buduće poboljšanje

- [ ] Enkripcija zapamćenih lozinki
- [ ] Biometrijska autentifikacija (mobile)
- [ ] Timeout za zapamćene kredencijale
- [ ] Opcija "Zapamti samo email" (bez lozinke)
- [ ] Admin panel za upravljanje remember me politikama 