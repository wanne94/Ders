# Plan za deployment aplikacije

## Cilj
Deployati DERS.BA aplikaciju (web i server komponente) na produkciju.

## TODO Liste

### 1. [ ] Priprema za deployment
- Provjeriti da li su sve promjene committovane
- Provjeriti da li aplikacija radi lokalno bez grešaka
- Provjeriti environment varijable

### 2. [ ] Build web aplikacije
- Pokrenuti build proces za Next.js aplikaciju
- Provjeriti da li build prođe bez grešaka

### 3. [ ] Test prije deploya
- Pokrenuti pre-deploy testove
- Provjeriti da li svi testovi prolaze

### 4. [ ] Deploy aplikacije
- Deployati server aplikaciju
- Deployati web aplikaciju
- Provjeriti health status nakon deploya

### 5. [ ] Verifikacija
- Provjeriti da li aplikacija radi na produkciji
- Provjeriti osnovne funkcionalnosti
- Provjeriti logove za greške

## Napomene
- Koristićemo postojeći deploy script iz package.json
- Deploy se vrši pomoću npm run deploy komande