# 🚨 Production Image Fix - DERS.BA

## Problem Description

When deploying to production, images don't load and daija names don't display properly, even though everything works fine in development.

## Root Cause Analysis

### 1. **Image Path Mismatch**
- **Development**: Images served from `http://localhost:5003/uploads/...`
- **Production**: Images expected from `https://ders.ba/uploads/...`
- **Issue**: Server uploads directory was empty

### 2. **Directory Structure Inconsistency**
- Images exist in: `public/uploads/images/` and `web/public/uploads/images/`
- Server expects: `server/public/uploads/images/`
- Deploy script didn't copy images to server location

### 3. **Environment Configuration**
- Development uses localhost URLs
- Production uses https://ders.ba URLs
- Image utility functions use `NEXT_PUBLIC_SERVER_URL` environment variable

## Solution Implemented

### 1. **Image Synchronization Script** (`sync-images.js`)
```bash
node sync-images.js
```
- Copies all images from `public/uploads/` to `server/public/uploads/`
- Copies all images from `web/public/uploads/` to `server/public/uploads/`
- Verifies critical default images exist

### 2. **Enhanced Deploy Script** (`deploy.js`)
- Added automatic image synchronization before deployment
- Ensures critical images are copied to server location
- Verifies all uploaded images are included in deployment package

### 3. **Quick Fix Script** (`fix-images-production.js`)
```bash
node fix-images-production.js
```
- Comprehensive fix for production image issues
- Checks environment configuration
- Creates deployment-ready package
- Provides step-by-step guidance

## Critical Images Required

These default images must exist in `server/public/uploads/images/`:
- `predavanjeslika.jpg` - Default lecture image
- `daijaslika.jpg` - Default daija image  
- `udruzenjeslika.jpg` - Default organization image

## Environment Variables

### Development (`web/.env.development`)
```env
NEXT_PUBLIC_SERVER_URL=http://localhost:5003
NEXT_PUBLIC_API_URL=http://localhost:5003/api
```

### Production (`web/.env.production`)
```env
NEXT_PUBLIC_SERVER_URL=https://ders.ba
NEXT_PUBLIC_API_URL=https://ders.ba/api
```

## Server Configuration

Server must serve static files from uploads directory:
```javascript
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
```

## Deployment Process

### Option 1: Full Deployment
```bash
node deploy.js
```
This now includes automatic image synchronization.

### Option 2: Quick Fix Only
```bash
node fix-images-production.js
```
Then manually upload `server/public/uploads/` to your server.

### Option 3: Manual Fix
1. Run: `node sync-images.js`
2. Upload `server/public/uploads/` directory to server
3. Ensure server environment variables are correct
4. Restart server application

## Verification Steps

1. **Check images locally**:
   ```bash
   ls server/public/uploads/images/
   ```
   Should contain: `predavanjeslika.jpg`, `daijaslika.jpg`, `udruzenjeslika.jpg`

2. **Test image URLs**:
   - Development: `http://localhost:5003/uploads/images/predavanjeslika.jpg`
   - Production: `https://ders.ba/uploads/images/predavanjeslika.jpg`

3. **Verify data loading**:
   - Check browser network tab for failed requests
   - Ensure API calls use correct base URL
   - Verify daija names display properly

## Build Process Confirmation

✅ **Build runs only once per deployment**
- Web build: `cd web && npm run build`
- Server check: Verifies `server/index.js` exists
- No duplicate builds during deployment

## Troubleshooting

### Images still not loading?
1. Check server logs for 404 errors
2. Verify nginx/reverse proxy configuration
3. Ensure uploads directory permissions are correct
4. Check browser network tab for failed requests

### Daija names not displaying?
1. Verify API endpoint: `https://ders.ba/api/daije`
2. Check database connection
3. Ensure server environment variables are correct
4. Check server logs for API errors

### Environment issues?
1. Verify `.env.production` file exists in web directory
2. Check `NEXT_PUBLIC_SERVER_URL` points to `https://ders.ba`
3. Ensure server `.env` has correct MongoDB connection
4. Restart both web and server applications

## Files Modified/Created

- ✅ `sync-images.js` - Image synchronization utility
- ✅ `fix-images-production.js` - Production fix script
- ✅ `deploy.js` - Enhanced with image synchronization
- ✅ `PRODUCTION-IMAGE-FIX.md` - This documentation

## Success Indicators

After applying the fix, you should see:
- ✅ Default images load properly
- ✅ Uploaded images display correctly  
- ✅ Daija names appear in listings
- ✅ No 404 errors for image requests
- ✅ Consistent behavior between development and production 