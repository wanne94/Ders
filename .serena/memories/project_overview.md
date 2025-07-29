# DERS.BA Web Application

DERS.BA je web aplikacija za upravljanje predavanjima (dersovima), daijama (predavačima) i udruženjima. 

## Tech Stack
- **Frontend**: Next.js 13, React 18, Material-UI (MUI)
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Deployment**: PM2, nginx
- **Testing**: Jest, Playwright

## Funkcionalnosti
- Upravljanje predavanjima (lectures)
- Upravljanje daijama (speakers/preachers)
- Upravljanje udruženjima (organizations)
- Administratorski panel sa approval workflow
- Status tracking predavanja (pending, approved, rejected)
- Upload slika za entitete

## Struktura
- `/web` - Next.js frontend aplikacija
- `/server` - Express.js backend API
- `/mob` - Expo React Native aplikacija (mobilna)