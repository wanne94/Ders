# Plan: Smanjenje veličine slika u karticama za predavanja u mobilnoj aplikaciji

## Analiza problema
Trenutno su slike u UniverzalCard komponenti prevelike za mobilni prikaz, što utiče na korisničko iskustvo i performanse.

**Trenutno stanje:**
- Slike u lecturing kartama zauzimaju 120px širine i visinu celog kontejnera
- Za daije se koriste kružne slike 70x70px - PREVELIKE
- Za organizacije se koriste iste dimenzije kao za predavanja (120px širine)
- Potrebno je:
  - Smanjiti slike daija
  - Napraviti slike organizacija 1:1 aspect ratio (kvadratne)

## TODO Lista:

### [ ] 1. Analizirati trenutne dimenzije slika
- Pregled stilova za image i imageColumn u UniverzalCard.js
- Identifikacija razlika između tipova kartica

### [ ] 2. Definirati nove dimenzije
- Smanjiti imageDaija sa 70x70px na 50x50px ili 60x60px (kružne)
- Napraviti nove stilove za organizacije - kvadratne slike 1:1 aspect ratio

### [ ] 3. Kreirati novi stil za slike organizacija
- Dodati imageOrganization stil za kvadratne slike
- Definirati fiksne dimenzije (npr. 80x80px)

### [ ] 4. Ažurirati UniverzalCard.js
- Modificirati imageDaija style za manje dimenzije
- Dodati uslovni rendering za organizacije da koriste novi stil
- Ažurirati borderRadius

### [ ] 5. Testirati promene
- Proveriti daije (kružne, manje)
- Proveriti organizacije (kvadratne 1:1)
- Proveriti predavanja (ostaju isti)

## Review

### Završene promene:

1. **Slike daija** - smanjene sa 100x100px na 50x50px (kružne)
2. **Slike organizacija** - dodat novi stil 80x80px kvadratne sa borderRadius: 8
3. **Uslovni rendering** - organizacije sada koriste imageOrganization stil
4. **Predavanja** - ostaju iste (120px širine, puna visina)

### Tehničke izmene:
- Ažuriran `imageDaija` stil u UniverzalCard.js (linija 389-393)
- Dodat `imageOrganization` stil (linija 394-398)  
- Ažuriran uslovni rendering za Image komponentu (linija 300)