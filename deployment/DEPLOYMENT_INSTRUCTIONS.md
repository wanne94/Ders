
# 🚀 DERS.BA Deployment Instructions

## 📦 Upload these files to your server:

1. **web/** folder - Next.js application
2. **server/** folder - Node.js/Express server

## 🔧 Server setup commands:

```bash
# 1. Install server dependencies
cd server
npm install --production

# 2. Install web dependencies (if needed)
cd ../web
npm install --production

# 3. Start server (production)
cd ../server
npm run prod

# Or with PM2 (recommended):
pm2 start index.js --name "ders-server"
```

## ⚙️ Environment variables:

Create **server/.env** file:
```env
NODE_ENV=production
PORT=5003
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
```

Create **web/.env.production** file:
```env
NEXT_PUBLIC_API_URL=https://yourdomain.com
NODE_ENV=production
```

## ✅ Test deployment:

1. API: https://yourdomain.com/api/health
2. Web: https://yourdomain.com
3. 404: https://yourdomain.com/test-404

## 📱 Mobile app update:

Update API URL in mobile app:
```javascript
// mobile/src/config/api.js
const API_BASE_URL = 'https://yourdomain.com';
```

Generated on: 2025-06-06T02:02:30.611Z
