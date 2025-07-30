# Plan za uklanjanje Android popup-a i premještanje sekcije aplikacija

## TODO stavke:

1. [x] Ukloniti Android app popup koji se prikazuje korisnicima
   - Pronaći i analizirati AndroidAppModal komponentu
   - Ukloniti logiku koja prikazuje popup na Android uređajima
   - Ukloniti import i korištenje AndroidAppModal komponente

2. [x] Premjestiti DownloadAppSection unutar HeroSection
   - Trenutno se DownloadAppSection nalazi skoro na kraju stranice
   - Premjestiti je unutar prve sekcije ispod podnaslova "Digitalna platforma za promociju islamskih predavanja"
   - Prilagoditi stilove da se uklopi u HeroSection

3. [x] Testirati promjene
   - Provjeriti da se popup više ne prikazuje
   - Provjeriti da sekcija za download aplikacija izgleda dobro u novoj poziciji
   - Provjeriti da sve ostalo funkcioniše kao prije

## Napomene:
- Android popup se trenutno prikazuje samo Android korisnicima nakon 1.5 sekundi
- DownloadAppSection prikazuje linkove za Google Play i App Store (App Store je označen kao "Uskoro dostupno")
- Trebamo zadržati funkcionalnost download linkova, samo premjestiti sekciju i ukloniti popup

## Review

### Završene promjene:

1. **Uklonjen Android popup:**
   - Uklonjen import AndroidAppModal komponente
   - Uklonjena state varijabla showAndroidModal
   - Uklonjen useEffect koji provjerava Android uređaje i prikazuje popup
   - Uklonjena funkcija handleAndroidModalClose
   - Uklonjen AndroidAppModal iz render dijela komponente

2. **Premještena sekcija za download aplikacija:**
   - Dodani linkovi za download aplikacija direktno u HeroSection
   - Pozicionirani ispod podnaslova "Digitalna platforma za promociju islamskih predavanja"
   - Prilagođene veličine dugmića (160x48 za mobilne, 180x54 za desktop)
   - Zadržana funkcionalnost - Google Play link radi, App Store označen kao "Uskoro dostupno"
   - Dodan import Image komponente iz next/image
   - Uklonjena originalna DownloadAppSection sa dna stranice
   - Uklonjen import DownloadAppSection komponente

### Rezultat:
- Korisnici više neće vidjeti popup za instalaciju Android aplikacije
- Linkovi za download aplikacija su sada prominentno prikazani u hero sekciji
- Sve funkcionalnosti su zadržane, samo je promijenjena lokacija i način prikaza