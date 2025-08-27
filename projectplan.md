# Uklanjanje pretrage - Samo dropdown liste sa skrolanjem

## Problem
Potrebno je ukloniti pretragu iz formi i zadržati samo dropdown liste koje mogu da se skrolaju.

## Rješenje

### ✅ 1. Web aplikacija - ZAVRŠENO
- Uklonio Combobox komponent koji ima pretragu
- Zamijenio sa standardnim Select dropdown komponentom
- Dropdown sada ima samo skrolanje (max-h-[300px] overflow-y-auto)
- Zadržana opcija za custom unos

### ✅ 2. Mobilna aplikacija - ZAVRŠENO  
- Već koristi standardni Picker dropdown bez pretrage
- Dropdown funkcioniše sa scroll wheel-om
- Nema potrebe za dodatnim izmjenama

## Promjene u kodu

### Web aplikacija:
1. `/home/avdo/Ders/web/src/components/LectureFormNew.jsx`
   - Uklonio import za Combobox (linija 25)
   - Zamijenio Combobox sa Select za daije (linije 531-558)
   - Zamijenio Combobox sa Select za organizacije (linije 623-659)
   - Dropdown liste sada imaju samo skrolanje bez pretrage

### Mobilna aplikacija:
1. `/home/avdo/Ders/mob/components/forms/LectureForm.jsx`
   - Već koristi Picker dropdown bez pretrage
   - Funkcioniše sa scroll wheel-om na PC-u

## Rezultat
- Obje platforme sada koriste standardne dropdown liste
- Nema pretrage, samo skrolanje
- Bolja kompatibilnost sa mišem na PC-u
- Jednostavniji UX bez nepotrebne pretrage

## Review
Uspješno uklonjena pretraga sa obje platforme. Forme sada koriste:
- **Web**: Select dropdown sa skrolanjem
- **Mob**: Picker dropdown sa skrolanjem
- Obje platforme rade sa scroll wheel-om miša