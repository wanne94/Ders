# React Web Project - Image Display Issues in Production Analysis

## Current State Analysis

### 1. **Image Storage Locations**
The project has multiple image locations which may cause confusion:

#### Server-side Images (`/server/uploads/`):
- `logo.jpg`
- `images/daijaslika.jpg`
- `images/predavanjeslika.jpg`
- `images/udruzenjeslika.jpg`
- `images/favicon.png`
- Various optimized WebP images

#### Web Public Directory Images (`/web/public/uploads/`):
- Same default images as server
- This is the correct location for Next.js static assets

### 2. **Image URL Configuration**

#### Environment Configuration (`web/config/environment.js`):
```javascript
production: {
  SERVER_URL: 'https://ders.ba',
  // ...
}
```

#### Image Utils (`web/src/utils/imageUtils.js`):
- Uses `process.env.NEXT_PUBLIC_SERVER_URL` for image URLs
- Default production URL: `https://ders.ba`
- Handles path normalization from `/upload/images/` to `/uploads/images/`

### 3. **Server Static File Serving**

From `server/index.js`:
```javascript
// Line 160-161
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```

The server serves the `/server/uploads` directory at the `/uploads` route.

### 4. **Image Usage in Components**

#### UniversalCard Component:
- Uses `getImageUrl()` helper function
- Implements proper error handling with `onError` fallback
- Default images are loaded using utility functions

#### LogoCircle Component:
- Uses Next.js `Image` component
- Direct path reference: `/uploads/logo.jpg`
- This expects the image to be in `web/public/uploads/`

## Identified Issues

### Issue 1: **Duplicate Image Locations**
- Images exist in both `/server/uploads/` and `/web/public/uploads/`
- This creates confusion about which images are being served

### Issue 2: **Mixed Image Serving Strategies**
- Some images are served by Express from `/server/uploads/`
- Some images should be served by Next.js from `/web/public/`
- LogoCircle uses Next.js Image component expecting public directory

### Issue 3: **Production URL Configuration**
- Images are prefixed with `https://ders.ba` in production
- This means they're expected to be served by the Express server
- But Next.js components may expect local public directory access

### Issue 4: **Path Inconsistencies**
- Some paths use `/upload/images/`
- Others use `/uploads/images/`
- The utility function handles this, but it's still confusing

## Recommendations

### 1. **Consolidate Image Storage**
Choose one strategy:
- **Option A**: Serve all images from Express server (`/server/uploads/`)
- **Option B**: Serve static images from Next.js public directory

### 2. **Fix LogoCircle Component**
If using Express server for images:
```javascript
import React from 'react';
import Image from 'next/image';
import { getLogoUrl } from '../utils/imageUtils';

const LogoCircle = () => (
  <Image
    src={getLogoUrl()} // Use the utility function
    alt="DERS Logo"
    width={50}
    height={50}
    priority
    // ... rest of styles
  />
);
```

### 3. **Ensure Consistent Path Structure**
- Standardize on `/uploads/images/` everywhere
- Remove duplicate images from web/public if using server

### 4. **Production Deployment Checklist**
1. Verify server static middleware is working: `curl https://ders.ba/uploads/logo.jpg`
2. Check CORS settings allow image requests
3. Ensure SSL certificate covers image requests
4. Verify Nginx/Apache proxy passes `/uploads/*` to Node.js server

### 5. **Add Image Loading Diagnostics**
Add temporary logging to debug production:
```javascript
// In imageUtils.js
export const getImageUrl = (imagePath) => {
  // ... existing code ...
  const finalUrl = `${IMAGE_SERVER_URL}${cleanPath}`;
  
  if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
    console.log('Image URL Debug:', {
      original: imagePath,
      cleaned: cleanPath,
      final: finalUrl,
      serverUrl: IMAGE_SERVER_URL
    });
  }
  
  return finalUrl;
};
```

### 6. **Verify Production Server Configuration**
The production server should:
- Serve `/uploads/*` routes before API routes
- Have proper MIME types for images
- Allow cross-origin requests for images

## Quick Fix for Production

If images are not showing in production, the quickest fix is:

1. SSH into the production server
2. Verify images exist in `/var/www/ders/server/uploads/`
3. Test direct image access: `curl -I https://ders.ba/uploads/images/logo.jpg`
4. Check PM2 logs: `pm2 logs ders-server`
5. Verify Nginx configuration includes:
   ```nginx
   location /uploads {
     proxy_pass http://localhost:5003/uploads;
     proxy_http_version 1.1;
     proxy_set_header Upgrade $http_upgrade;
     proxy_set_header Connection 'upgrade';
     proxy_set_header Host $host;
     proxy_cache_bypass $http_upgrade;
   }
   ```

## Testing Commands

```bash
# Test from local machine
curl -I https://ders.ba/uploads/logo.jpg
curl -I https://ders.ba/uploads/images/predavanjeslika.jpg

# Check Express server is serving uploads
curl -I http://localhost:5003/uploads/logo.jpg

# Verify file permissions on server
ls -la /var/www/ders/server/uploads/
ls -la /var/www/ders/server/uploads/images/
```