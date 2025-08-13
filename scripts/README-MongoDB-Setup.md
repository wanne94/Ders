# MongoDB Setup za WSL2

## Problem
WSL2 ne može pristupiti MongoDB-u koji radi na Windows host-u jer MongoDB po defaultu sluša samo na localhost (127.0.0.1).

## Riješenje 1: Konfiguriši Windows MongoDB (Preporučeno)

### 1. Otvori Command Prompt kao Administrator

### 2. Zaustavi MongoDB servis
```cmd
net stop MongoDB
```

### 3. Backup postojeće konfiguracije
```cmd
copy "C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg" "C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg.backup"
```

### 4. Edituj MongoDB konfiguraciju
Otvori: `C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg`

Promijeni `bindIp` liniju:
```yaml
net:
  port: 27017
  bindIp: 0.0.0.0  # PROMIJENI sa 127.0.0.1
```

### 5. Pokreni MongoDB servis
```cmd
net start MongoDB
```

### 6. Dodaj firewall pravilo
```cmd
netsh advfirewall firewall add rule name="MongoDB WSL2" dir=in action=allow protocol=TCP localport=27017
```

### 7. Test konekcije
```bash
# U WSL2:
cd /mnt/c/react-apps/predavanje
node ../temp/test-mongodb-connection.js
```

## Riješenje 2: Automatska konfiguracija (Pojednostavljeno)

### Pokreni setup script kao Administrator:
```cmd
# U Windows Command Prompt kao Administrator:
cd C:\react-apps\predavanje\scripts
setup-local-mongodb.bat
```

## Provjera konfiguracije

### Provjeri da li MongoDB prima konekcije:
```cmd
netstat -an | findstr :27017
```

Trebao bi pokazati:
```
TCP    0.0.0.0:27017         0.0.0.0:0              LISTENING
```

### Test iz WSL2:
```bash
# Iz WSL2 terminala:
nc -zv 172.31.112.1 27017
```

## Troubleshooting

### Ako i dalje nema konekcije:
1. Provjeri Windows Firewall
2. Provjeri antivirus software
3. Restart Windows
4. Koristi produkcijsku bazu privremeno

### Vraćanje na lokalnu bazu:
```bash
# U .env.local promijeni:
MONGODB_URI=mongodb://172.31.112.1:27017/Predavanja
```