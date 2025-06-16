# ✅ Web Upload Fix - Produkcijski Server Upload

## Problem
Web development aplikacija je upload-ovala slike u lokalni `server/uploads` folder umesto na produkcijski `https://ders.ba` server.

## ✅ Rešeno - Nova implementacija

### 🆕 Upload Service
Kreiran novi `uploadService.js` koji **uvek koristi produkcijski server** za upload:

```javascript
// web/src/utils/uploadService.js
const UPLOAD_SERVER_URL = 'https://ders.ba';

export const uploadImage = async (file, token = null) => {
  // Upload direktno na produkcijski server
  const uploadUrl = `${UPLOAD_SERVER_URL}/api/upload-image`;
  
  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
    headers: headers
  });
  
  return response.json();
};
```

### 🔄 Ažurirane komponente

#### **LectureForm.jsx** ✅
```javascript
import { uploadImage } from '../utils/uploadService';

// U handleSubmit funkciji:
const uploadResponse = await uploadImage(formData.imageFile);
```

#### **DaijaForm.jsx** ✅ 
Ažuriran da koristi novi upload servis

#### **OrganizationForm.jsx** ✅
Ažuriran da koristi novi upload servis

### 📍 Novi flow za upload

**STARO (problematično):**
```
Web Development → localhost:5003/api/upload-image → server/uploads/ (lokalno)
Web Production → https://ders.ba/api/upload-image → server/uploads/ (produkcijski)
```

**NOVO (ispravljen):**
```
Web Development → https://ders.ba/api/upload-image → server/uploads/ (produkcijski) ✅
Web Production → https://ders.ba/api/upload-image → server/uploads/ (produkcijski) ✅
```

### 🎯 Rezultat

- ✅ **Development i Production** upload-uju na isti server
- ✅ **Sve slike** su dostupne svim verzijama aplikacija
- ✅ **Konzistentno ponašanje** kroz sva okruženja
- ✅ **Debug logovi** za praćenje upload-a

### 🧪 Testiranje

1. **Pokreni web development** aplikaciju
2. **Upload-uj sliku** kroz bilo koju formu (Predavanje/Daija/Udruženje)
3. **Proveraj console** za debug logove:
```
📤 [UPLOAD SERVICE] Starting image upload to production server
🎯 [UPLOAD SERVICE] Target server: https://ders.ba
✅ [UPLOAD SERVICE] Upload successful: { success: true, path: '/uploads/images/...' }
```
4. **Slika treba da bude dostupna** na `https://ders.ba/uploads/images/filename`

### 📱 Mobile upload
Mobilna aplikacija već koristi `https://ders.ba` server za upload, tako da nema promene.

### 🔧 Debugging
Ako upload ne radi, proveraj:
1. **Network tab** u browser-u za upload request
2. **Console logove** iz uploadService.js
3. **Auth token** - možda je potrebna autentifikacija
4. **CORS postavke** na serveru