# Plan za povezivanje slika sa dersovima

## Trenutno stanje
- **66 dersova** koristi default sliku (`predavanjeslika.jpg`) ili prazan string
- **152 neiskorištene slike** postoje u `/var/www/ders.ba/server/uploads/images/`
- Nema automatskog načina za mapiranje (nedostaje metadata)

## Opcije

### Opcija A: Ručno mapiranje (PREPORUČENO)
1. Kreirati alat za pregled slika i dersova side-by-side
2. Admin ručno povezuje slike sa dersovima kroz dashboard
3. Prednost: Tačno mapiranje
4. Mana: Vremenski zahtjevno

### Opcija B: Automatsko mapiranje po timestamp-u
1. Pokušati povezati slike sa dersovima po blizini `createdAt` i timestamp slike
2. Prednost: Brzo
3. Mana: Netačno - mnoge slike nemaju korelaciju sa vremenom kreiranja dersa

### Opcija C: Hibridni pristup
1. Automatski mapirati one gdje je timestamp blizak (< 1 sat razlike)
2. Ostale ručno pregledati
3. Prema analizi: samo ~2-3 dersa imaju timestamp match

## Preporučeni plan implementacije

### Faza 1: Kreirati admin alat za mapiranje slika
1. Nova stranica u dashboardu: `/dashboard/image-mapper`
2. Lijeva strana: Lista dersova sa default slikom
3. Desna strana: Grid neiskorištenih slika (thumbnails)
4. Klik na sliku -> dodjeljuje je odabranom dersu
5. Sprema promjenu u bazu

### Faza 2: Bulk pregled
1. Otvoriti sve neiskorištene slike u browseru
2. Screenshot ili vizualni pregled
3. Prepoznati koja slika pripada kojem dersu po sadržaju

### Faza 3: Čišćenje
1. Nakon mapiranja, obrisati zaista nekorištene slike
2. Dodati validaciju pri uploadu da se slike odmah povežu

## Tehnički detalji

### API endpoint za update slike
```javascript
// PUT /api/lectures/:id/image
{
  "image": "/uploads/images/optimized-xxxx.webp"
}
```

### Query za dersove sa default slikom
```javascript
db.lectures.find({
  $or: [
    {image: /predavanjeslika/},
    {image: ""}
  ]
})
```

### Lista neiskorištenih slika
```javascript
// Server endpoint koji vraća neiskorištene slike
// GET /api/admin/unused-images
```

## Sljedeći koraci
1. [ ] Odlučiti koju opciju koristiti
2. [ ] Implementirati admin alat ili ručno mapirati
3. [ ] Testirati na par dersova
4. [ ] Izvršiti mapiranje
5. [ ] Verificirati da slike rade
