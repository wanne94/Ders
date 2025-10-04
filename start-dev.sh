#!/bin/bash

# DERS.BA Development Server Startup Script
# Pokretanje server i web aplikacije paralelno

echo "🚀 Pokretanje DERS.BA development servera..."

# Provjeri da li postoje potrebni direktoriji
if [ ! -d "server" ]; then
    echo "❌ Server direktorij ne postoji!"
    exit 1
fi

if [ ! -d "packages/web" ]; then
    echo "❌ packages/web direktorij ne postoji!"
    exit 1
fi

# Provjeri da li su node_modules instalirani
echo "📦 Provjera dependencies..."

if [ ! -d "server/node_modules" ]; then
    echo "⬇️ Instaliranje server dependencies..."
    cd server && npm install && cd ..
fi

if [ ! -d "packages/web/node_modules" ]; then
    echo "⬇️ Instaliranje web dependencies..."
    (cd packages/web && npm install)
fi

# Pokreni aplikacije paralelno
echo "🔧 Pokretanje server i web aplikacije..."
echo "📍 Server će biti dostupan na: http://localhost:5003"
echo "📍 Web će biti dostupan na: http://localhost:3000"
echo ""
echo "💡 Za zaustavljanje pritisni Ctrl+C"
echo ""

# Koristi npm run komande iz root package.json
echo "Opcije za pokretanje:"
echo "1. npm run dev        - Pokretanje server i web zajedno"
echo "2. npm run dev:server - Pokretanje samo servera"
echo "3. npm run dev:web    - Pokretanje samo web aplikacije"
echo ""
echo "Pokretanje sve tri opcije su dostupne!"
echo ""

# Pokretanje default npm run dev komande
npm run dev
