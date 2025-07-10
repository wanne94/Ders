# Analiza - Profil daje i prikazivanje predavanja

## Plan zadatka

### Todo stavke:
- [x] Analiziraj profil daje - pročitaj postojeće fajlove  
- [x] Ustanovi kako se koriste podaci za prikazivanje predavanja
- [x] Identifikuj razlog zašto se ne prikazuju predavanja
- [x] Napravi plan fajl u Tasks folderu

## Analiza komponenti

### 1. Profil daje fajl (`web/pages/profile/[type]/[id].js`)

**Ključni deo za predavanja (linija 572-595):**
```jsx
{type === 'daija' && (
  <Box sx={{ py: { xs: 4, md: 6 }, backgroundColor: '#f8f9fa' }}>
    <Container maxWidth="lg">
      <Typography variant="h4" component="h2">
        Najavljena predavanja{profileData?.name ? ` - ${profileData.name}` : ''}
      </Typography>
      
      <RelatedLectures 
        type="daija"
        daijaId={id}
        daijaName={profileData?.name}
      />
    </Container>
  </Box>
)}
```

### 2. RelatedLectures komponenta (`web/src/components/RelatedLectures.jsx`)

**Logika za daije (linija 80-96):**
```jsx
case 'daija':
  if (daijaId) {
    try {
      response = await safeApiCall(() => predavanjaService.getPredavanjaByDaija(daijaId), []);
      allLectures = normalizeToArray(response);
    } catch (error) {
      // Fallback: get all lectures and filter by daija
      response = await safeApiCall(() => predavanjaService.getAllPredavanja(), []);
      const allLecturesData = normalizeToArray(response);
      allLectures = allLecturesData.filter(lecture => {
        const matchById = lecture.daija && (lecture.daija._id === daijaId || lecture.daija === daijaId || lecture.daijaId === daijaId);
        const matchByName = daijaName && lecture.speaker && lecture.speaker.includes(daijaName);
        return matchById || matchByName;
      });
    }
  }
  break;
```

### 3. Backend endpoint (`server/routes/lecturesRoutes.js`)

**Endpoint za predavanja po daji (linija 220-249):**
```javascript
router.get('/daija/:daijaId', async (req, res) => {
  try {
    const lectures = await Lecture.find({ 
      daija: req.params.daijaId,
      status: 'approved'  // Samo odobrena predavanja
    })
      .populate('createdBy', 'firstName lastName email')
      .populate('organizationId', 'name')
      .populate('daija', 'name title image');
    
    // Transformacija za frontend kompatibilnost
    const transformedLectures = lectures.map(lecture => ({
      ...lecture.toObject(),
      daijaId: lecture.daija?._id || lecture.daija || null,
      speaker: lecture.daija && lecture.daija.title && lecture.daija.name 
        ? `${lecture.daija.title} ${lecture.daija.name}`.trim()
        : lecture.speaker || 'Nepoznat predavač'
    }));
    
    res.json(transformedLectures);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
```

## Identifikovani mogući problemi

### 1. **Status predavanja**
- Backend vraća samo predavanja sa `status: 'approved'`
- **Proverava:** Da li su predavanja u bazi odobrena?

### 2. **Povezivanje daija ID-a**
- Backend traži `daija: req.params.daijaId`
- **Proverava:** Da li je u bazi polje `daija` pravilno popunjeno sa ID-om daje?

### 3. **Tip podatka za daija polje**
- Može biti ObjectId ili string
- **Proverava:** Konzistentnost tipova između frontend-a i backend-a

### 4. **Fallback mehanizam**
- Ako endpoint ne radi, koristi se filtriranje svih predavanja
- **Proverava:** Da li fallback pravilno radi i nalazi predavanja?

## Preporučeni koraci za debug

1. **Proverava bazu podataka:**
   - Status predavanja za specifičnu daju
   - Hodnota polja `daija` u predavanjima
   - Format daija ID-a (ObjectId vs string)

2. **Testira backend endpoint direktno:**
   - Pozovi `/api/lectures/daija/{daijaId}` u browser-u
   - Proveri response i greške

3. **Proveri frontend log-ove:**
   - Console greške u RelatedLectures komponenti
   - Network tab za API pozive

4. **Testira fallback mehanizam:**
   - Privremeno onemogućiti endpoint da testiras fallback

## Review

Analizom je identifikovano da sistem za prikazivanje predavanja za daije profil ima:
- Jasnu arhitekturu (profil → RelatedLectures → backend)
- Fallback mehanizam za robusnost
- Proper error handling

Glavni mogući uzroci problema:
1. Status predavanja nije 'approved'
2. Daija ID nije pravilno povezan u bazi
3. Tip podatka inconsistency
4. Backend endpoint greške

Sledeći korak bi trebalo da bude provera baze podataka i testiranje backend endpoint-a.