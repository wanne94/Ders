# Plan za dodavanje indikacije kada daija ili udruženje nemaju predavanja

## TODO Lista:

1. [x] Analizirati kako se učitavaju predavanja za daije i udruženja u UniversalProfile komponenti
2. [x] Pronaći gdje se prikazuje sekcija "Predavanja" za daije i udruženja
3. [x] Dodati poruku "Nema najavljenih predavanja" kada daija/udruženje nemaju predavanja
4. [x] Testirati prikaz za daije i udruženja sa i bez predavanja

## Review

### Promjene koje su napravljene:
1. **Modifikovana sekcija predavanja u UniversalProfile komponenti** - Promjena omogućava prikaz sekcije "Predavanja" čak i kada nema predavanja
2. **Dodana logika za prikaz poruke** - Kada daija ili udruženje nemaju predavanja, prikazuje se poruka "Nema najavljenih predavanja"
3. **Dodani stilovi** - Kreiran `noLecturesContainer` i `noLecturesText` za stilizovanje poruke

### Što je postignuto:
- Poruka se prikazuje samo u profilima daija i udruženja (ne u profilima predavanja)
- Poruka je stilizovana sa italic fontom i sivom bojom
- Sekcija "Predavanja" se uvijek prikazuje, ali sa odgovarajućim sadržajem

## Napomene:
- Indikacija će biti prikazana za daije i udruženja
- Prikazaće se samo kada se uđe u profil daije ili udruženja
- Poruka će biti prikazana umjesto liste predavanja kada nemaju nijedno predavanje