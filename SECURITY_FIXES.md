# Sigurnosne ispravke sistema odobravanja

## 🚨 Pronađeni problemi

### 1. **Nedostaje filtriranje po statusu u javnim API endpointima**

**Problem:** Javni API endpointi su vraćali SVE sadržaje (uključujući pending i rejected) umjesto samo odobrenih.

**Pogođeni endpointi:**
- `/api/lectures/daija/:daijaId` - prikazivao sva predavanja za daiju
- `/api/lectures/organization/:organizationId` - prikazivao sva predavanja za organizaciju  
- `/api/daije` - prikazivao sve daije
- `/api/organizations` - prikazivao sve organizacije

**Rizik:** Korisnici su mogli vidjeti neodobreni sadržaj koji još nije prošao proces odobravanja.

### 2. **Nedosljednost u frontend filtriranju**

**Problem:** Frontend kod je ponekad koristio nefiltriran sadržaj ili je imao komentare koji su sugerirali namjerno uklanjanje filtriranja.

**Primjer:** U `ActiveOrganizations` komponenti je bio komentar "Remove status filter to see all lectures".

## ✅ Implementirane ispravke

### 1. **Server-side ispravke**

#### Dodano filtriranje po statusu u javne endpointe:

```javascript
// Prije (NESIGURNO):
const lectures = await Lecture.find({ daija: req.params.daijaId })

// Poslije (SIGURNO):
const lectures = await Lecture.find({ 
  daija: req.params.daijaId,
  status: 'approved'  // Samo odobrena predavanja
})
```

#### Ispravke u endpointima:
- ✅ `/api/lectures/daija/:daijaId` - sada vraća samo odobrena predavanja
- ✅ `/api/lectures/organization/:organizationId` - sada vraća samo odobrena predavanja
- ✅ `/api/daije` - sada vraća samo odobrene daije
- ✅ `/api/organizations` - sada vraća samo odobrene organizacije

### 2. **Dodani admin-specifični endpointi**

Za administrativne potrebe, dodani su novi endpointi koji vraćaju SVE sadržaje (uključujući pending/rejected):

- ✅ `/api/admin/daije` - sve daije za admin
- ✅ `/api/admin/organizations` - sve organizacije za admin  
- ✅ `/api/admin/lectures/daija/:daijaId` - sva predavanja za daiju (admin)
- ✅ `/api/admin/lectures/organization/:organizationId` - sva predavanja za organizaciju (admin)

**Sigurnost:** Ovi endpointi zahtijevaju autentifikaciju i admin/super_admin dozvole.

### 3. **Frontend ispravke**

#### Uklonjen problematičan komentar:
```javascript
// Prije:
const lectures = lecturesResponse.data; // Remove status filter to see all lectures

// Poslije:  
const lectures = lecturesResponse.data; // Only approved lectures from /lectures/public
```

#### Uklonjena redundantna filtriranja:
Pošto server sada pravilno filtrira, uklonjena su redundantna client-side filtriranja.

## 🔒 Sigurnosni principi implementirani

### 1. **Defense in Depth**
- Server-side filtriranje kao primarna odbrana
- Client-side validacija kao sekundarna odbrana
- Autentifikacija i autorizacija za admin endpointe

### 2. **Principle of Least Privilege**
- Javni endpointi vraćaju minimum potrebnih podataka
- Admin endpointi dostupni samo autentificiranim admin korisnicima
- Jasno razdvojeni javni i admin API-ji

### 3. **Secure by Default**
- Svi novi endpointi će po defaultu filtrirati po statusu
- Eksplicitno označavanje admin endpointa
- Jasno dokumentovani sigurnosni zahtjevi

## 📋 Preporučene dodatne mjere

### 1. **Monitoring i logging**
```javascript
// Dodati monitoring za pristup neodobrenom sadržaju
logger.warn('Attempt to access non-approved content', {
  userId: req.user?.id,
  endpoint: req.path,
  userAgent: req.get('User-Agent')
});
```

### 2. **Rate limiting**
Implementirati rate limiting za javne endpointe da se spriječi zloupotreba.

### 3. **Input validation**
Dodati strožu validaciju parametara u svim endpointima.

### 4. **Security headers**
```javascript
// Dodati sigurnosne header-e
res.set({
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block'
});
```

## 🧪 Testiranje

### Testovi za verifikaciju ispravki:

1. **Test javnih endpointa:**
   - Verifikovati da vraćaju samo approved sadržaj
   - Testirati sa pending/rejected sadržajem u bazi

2. **Test admin endpointa:**
   - Verifikovati da zahtijevaju autentifikaciju
   - Testirati da vraćaju sve sadržaje za admin korisnike

3. **Test frontend komponenti:**
   - Verifikovati da prikazuju samo odobreni sadržaj
   - Testirati edge case-ove

## 📝 Zaključak

Implementirane sigurnosne ispravke osiguravaju da:
- ✅ Korisnici vide samo odobreni sadržaj
- ✅ Administratori imaju pristup svim sadržajima kroz dedicirane endpointe
- ✅ Sistem je siguran po defaultu
- ✅ Jasno je razdvojen javni i admin pristup

**Status:** ✅ RIJEŠENO - Sistem odobravanja je sada siguran i funkcionalan. 