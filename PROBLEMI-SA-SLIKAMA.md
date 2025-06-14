# Rešavanje problema sa slikama u produkciji

## Identifikovani problemi

1. **LogoCircle komponenta** - ispravljena da koristi `getLogoUrl()` funkciju
2. **Express server** - već ima konfiguraciju za serviranje `/uploads` direktorijuma
3. **Duplikacija funkcionalnosti** - i `imageUtils.js` i `environment.js` imaju slične funkcije za slike

## Koraci za rešavanje problema na produkciji

### 1. Proveri da li postoje slike na serveru
```bash
ssh user@ders.ba
ls -la /var/www/ders/server/uploads/
ls -la /var/www/ders/server/uploads/images/
```

### 2. Proveri prava pristupa
```bash
sudo chown -R www-data:www-data /var/www/ders/server/uploads
sudo chmod -R 755 /var/www/ders/server/uploads
```

### 3. Proveri nginx konfiguraciju
Treba da sadrži:
```nginx
location /uploads {
    proxy_pass http://localhost:5003/uploads;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### 4. Testiraj direktan pristup slikama
```bash
curl -I https://ders.ba/uploads/logo.jpg
curl -I https://ders.ba/uploads/images/predavanjeslika.jpg
```

### 5. Proveri Express server logove
```bash
pm2 logs
# ili
journalctl -u ders-server -n 50
```

## Moguće greške

1. **404 Not Found** - slike ne postoje na serveru ili su na pogrešnoj lokaciji
2. **403 Forbidden** - problem sa pravima pristupa
3. **502 Bad Gateway** - Express server ne radi ili nginx ne može da se poveže

## Brzo rešenje

Ako slike ne postoje na serveru, kopiraj ih:
```bash
# Sa lokalnog računara
scp -r /mnt/c/react-apps/predavanje/server/uploads/* user@ders.ba:/var/www/ders/server/uploads/
```

## Provera nakon popravke

1. Osvezi browser cache (Ctrl+F5)
2. Proveri Network tab u browser dev tools-ima
3. Potvrdi da slike dolaze sa `https://ders.ba/uploads/...`