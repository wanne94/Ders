# 🚀 DERS.BA Quick Start

## 1. Prvi put deployment

```bash
# Brzi deployment (preporučeno) - slike + server + web:
npm run deploy

# ili ako želiš potpuni deployment sa testovima:
npm run deploy:full
```

**To je to!** 🎉

## 2. Svakodnevni rad

### Ažurirao si kod? Deploy web:
```bash
npm run deploy:web
```

### Dodao si slike? Deploy slike:
```bash
npm run deploy:images  
```

### Promerio si server? Deploy server:
```bash
npm run deploy:server
```

### Proveri da li sve radi:
```bash
npm run health
```

## 3. Backup pre većih izmena
```bash
npm run backup
```

## 4. Monitoring
```bash
# Logs
npm run logs

# Server status  
npm run monitor
```

## 🆘 Problemi?

### Slike se ne učitavaju?
```bash
npm run deploy:images
```

### API ne radi?
```bash
npm run deploy:server
npm run health
```

### Web app ne radi?
```bash
npm run deploy:web
npm run health
```

### Sve ne radi?
```bash
npm run deploy:full
```

## 📖 Više opcija?
```bash
node deploy-complete.js help
```

## 🎯 Najčešći workflow:

1. **Razvoj**: `npm run dev`
2. **Test**: `npm run test:web`  
3. **Deploy**: `npm run deploy:web`
4. **Provjera**: `npm run health`
5. **Backup**: `npm run backup` (sedmično)

---

**Sve staro i dalje radi**, ovo su samo nova poboljšanja! 🚀 