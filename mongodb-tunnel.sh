#!/bin/bash
# MongoDB SSH Tunnel Script
# Kreira SSH tunel za pristup MongoDB-u na produkcijskom serveru

echo "🔧 Pokretanje MongoDB SSH tunela..."

# Proveri da li tunel već postoji
if lsof -Pi :27018 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 27018 je već zauzet. Zatvaranje postojećeg tunela..."
    pkill -f "ssh.*27018:127.0.0.1:27017"
    sleep 2
fi

# Pokreni SSH tunel u background-u
ssh -f -N -L 27018:127.0.0.1:27017 root@194.163.176.171

# Proveri da li je tunel uspešno pokrenut
sleep 2
if lsof -Pi :27018 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ MongoDB SSH tunel je uspešno pokrenut na portu 27018"
    echo "📝 MongoDB je sada dostupan na: mongodb://localhost:27018"
    echo "🔄 Za zatvaranje tunela koristite: pkill -f 'ssh.*27018'"
else
    echo "❌ Greška: SSH tunel nije uspešno pokrenut"
    exit 1
fi 