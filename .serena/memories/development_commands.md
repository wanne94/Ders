# Development Commands

## Development Mode
- `npm run dev` - Pokreće web, server i tunnel paralelno
- `npm run dev:server` - Samo server + tunnel
- `npm run dev:web` - Samo web development

## Testing & Quality
- `npm run lint` - Next.js linting (iz web/)
- `cd web && npm run test` - Jest testovi
- `cd web && npm run pre-deploy` - Lint + test + build

## Build & Deploy
- `npm run build` - Build web aplikacije
- `npm run deploy` - Deploy kompletne aplikacije
- `npm run health` - Health check deployovane aplikacije

## Server Commands
- `cd server && npm run dev` - Development mode sa nodemon
- `cd server && npm run start` - Production mode